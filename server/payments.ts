/**
 * Integração de pagamentos (Stripe) sem o SDK — usa a API REST via `fetch` e
 * o `crypto` nativo para verificar assinaturas de webhook. Assim não há
 * dependência extra e a lógica central é testável.
 *
 * Tudo é opcional: se as variáveis de ambiente não estiverem configuradas,
 * `isBillingConfigured()` retorna false e as rotas degradam graciosamente
 * ("pagamento em configuração") em vez de quebrar.
 *
 * Variáveis de ambiente esperadas:
 *   STRIPE_SECRET_KEY         — chave secreta da conta Stripe
 *   STRIPE_WEBHOOK_SECRET     — segredo do endpoint de webhook
 *   STRIPE_PRICE_ESTUDANTE    — price id do plano Estudante (recorrente)
 *   STRIPE_PRICE_PRO          — price id do plano Pro (recorrente)
 *   APP_BASE_URL              — URL pública do app (para success/cancel)
 */
import crypto from "crypto";
import type { Tier } from "@shared/entitlements";

const STRIPE_API = "https://api.stripe.com/v1";

export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Planos vendáveis via checkout automático (Organização é venda manual). */
export function tierToPriceId(tier: Tier): string | undefined {
  switch (tier) {
    case "estudante":
      return process.env.STRIPE_PRICE_ESTUDANTE;
    case "pro":
      return process.env.STRIPE_PRICE_PRO;
    default:
      return undefined;
  }
}

export function priceIdToTier(priceId: string | undefined | null): Tier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ESTUDANTE) return "estudante";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

function formEncode(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function stripePost(path: string, body: Record<string, string>) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe não configurado");
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formEncode(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface CheckoutParams {
  tier: Tier;
  userId: number;
  openId: string;
  email?: string | null;
  customerId?: string | null;
}

/**
 * Cria uma sessão de checkout (assinatura recorrente) e retorna a URL para a
 * qual o usuário deve ser redirecionado.
 */
export async function createCheckoutSession(
  params: CheckoutParams,
): Promise<{ url: string }> {
  const priceId = tierToPriceId(params.tier);
  if (!priceId) {
    throw new Error(`Plano "${params.tier}" não disponível para checkout automático`);
  }
  const base = process.env.APP_BASE_URL || "";

  const body: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${base}/planos?status=sucesso`,
    cancel_url: `${base}/planos?status=cancelado`,
    "metadata[userId]": String(params.userId),
    "metadata[openId]": params.openId,
    "metadata[tier]": params.tier,
    // Repassa metadados para a própria assinatura (lidos no webhook).
    "subscription_data[metadata][userId]": String(params.userId),
    "subscription_data[metadata][openId]": params.openId,
    "subscription_data[metadata][tier]": params.tier,
    client_reference_id: params.openId,
  };
  if (params.customerId) body.customer = params.customerId;
  else if (params.email) body.customer_email = params.email;

  const session = (await stripePost("/checkout/sessions", body)) as {
    url?: string;
  };
  if (!session.url) throw new Error("Stripe não retornou URL de checkout");
  return { url: session.url };
}

/**
 * Verifica a assinatura de um webhook do Stripe (esquema `t=...,v1=...`).
 * Implementa o mesmo HMAC-SHA256 que o SDK oficial, sem dependências.
 */
export function verifyStripeSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  secret: string,
  toleranceSeconds = 300,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const expected = parts["v1"];
  if (!timestamp || !expected) return false;

  // Proteção contra replay.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > toleranceSeconds) {
    return false;
  }

  const payload = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const signedPayload = `${timestamp}.${payload}`;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  // Comparação em tempo constante.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
