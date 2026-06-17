/**
 * Endpoint de webhook do Stripe. Precisa do corpo BRUTO (raw) da requisição
 * para validar a assinatura, por isso é registrado ANTES do `express.json()`.
 *
 * Sincroniza o plano do usuário a partir dos eventos de assinatura. Se o
 * webhook não estiver configurado (sem STRIPE_WEBHOOK_SECRET), responde 503 e
 * não faz nada — o resto do app continua funcionando.
 */
import express, { type Express } from "express";
import { verifyStripeSignature, priceIdToTier } from "./payments";
import { setUserSubscription } from "./db";
import type { Tier } from "@shared/entitlements";

type SubStatus = "none" | "active" | "canceled" | "past_due";

function mapStripeStatus(stripeStatus: string | undefined): SubStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "none";
  }
}

export function registerBillingWebhook(app: Express): void {
  app.post(
    "/api/billing/webhook",
    express.raw({ type: "*/*" }),
    async (req, res) => {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ error: "billing-webhook-not-configured" });
      }

      const signature = req.headers["stripe-signature"] as string | undefined;
      const rawBody: Buffer = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(req.body ?? "");

      if (!verifyStripeSignature(rawBody, signature, secret)) {
        return res.status(400).json({ error: "invalid-signature" });
      }

      let event: any;
      try {
        event = JSON.parse(rawBody.toString("utf8"));
      } catch {
        return res.status(400).json({ error: "invalid-payload" });
      }

      try {
        const obj = event?.data?.object ?? {};
        const meta = obj.metadata ?? {};

        switch (event.type) {
          case "checkout.session.completed": {
            const openId = meta.openId as string | undefined;
            const tier = (meta.tier as Tier) || "pro";
            if (openId) {
              await setUserSubscription(openId, {
                tier,
                status: "active",
                stripeCustomerId:
                  typeof obj.customer === "string" ? obj.customer : null,
              });
            }
            break;
          }
          case "customer.subscription.updated": {
            const openId = meta.openId as string | undefined;
            const priceId = obj.items?.data?.[0]?.price?.id as string | undefined;
            const tier = (meta.tier as Tier) || priceIdToTier(priceId) || "pro";
            const status = mapStripeStatus(obj.status);
            if (openId) {
              await setUserSubscription(openId, {
                tier: status === "active" ? tier : "free",
                status,
                expiresAt: obj.current_period_end
                  ? new Date(obj.current_period_end * 1000)
                  : undefined,
              });
            }
            break;
          }
          case "customer.subscription.deleted": {
            const openId = meta.openId as string | undefined;
            if (openId) {
              await setUserSubscription(openId, { tier: "free", status: "canceled" });
            }
            break;
          }
          default:
            // Eventos não tratados são ignorados silenciosamente.
            break;
        }
      } catch (e) {
        console.error("[Billing] Webhook handler error:", e);
        // Responde 200 mesmo assim para o Stripe não reenviar em loop por erro
        // interno; o erro fica logado para investigação.
      }

      return res.json({ received: true });
    },
  );
}
