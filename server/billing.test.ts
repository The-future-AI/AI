import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  hasFeature,
  isPaidTier,
  effectiveTier,
} from "@shared/entitlements";
import { verifyStripeSignature, priceIdToTier } from "./payments";

describe("entitlements", () => {
  it("free tier has no paid features", () => {
    expect(hasFeature("free", "framingAnalysis")).toBe(false);
    expect(hasFeature("free", "contextSection")).toBe(false);
    expect(isPaidTier("free")).toBe(false);
  });

  it("estudante unlocks framing/context but not export", () => {
    expect(hasFeature("estudante", "framingAnalysis")).toBe(true);
    expect(hasFeature("estudante", "contextSection")).toBe(true);
    expect(hasFeature("estudante", "export")).toBe(false);
    expect(isPaidTier("estudante")).toBe(true);
  });

  it("pro unlocks everything including export", () => {
    expect(hasFeature("pro", "framingAnalysis")).toBe(true);
    expect(hasFeature("pro", "export")).toBe(true);
  });

  it("effectiveTier downgrades to free when subscription is not active", () => {
    expect(effectiveTier(null)).toBe("free");
    expect(
      effectiveTier({ subscriptionTier: "pro", subscriptionStatus: "canceled" }),
    ).toBe("free");
    expect(
      effectiveTier({ subscriptionTier: "pro", subscriptionStatus: "past_due" }),
    ).toBe("free");
    expect(
      effectiveTier({ subscriptionTier: "pro", subscriptionStatus: "active" }),
    ).toBe("pro");
    expect(
      effectiveTier({ subscriptionTier: "free", subscriptionStatus: "none" }),
    ).toBe("free");
  });
});

describe("verifyStripeSignature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

  function sign(ts: number, body: string, withSecret = secret) {
    const signedPayload = `${ts}.${body}`;
    const v1 = crypto
      .createHmac("sha256", withSecret)
      .update(signedPayload, "utf8")
      .digest("hex");
    return `t=${ts},v1=${v1}`;
  }

  it("accepts a valid signature within tolerance", () => {
    const now = Math.floor(Date.now() / 1000);
    const header = sign(now, payload);
    expect(verifyStripeSignature(payload, header, secret, 300, now)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const now = Math.floor(Date.now() / 1000);
    const header = sign(now, payload);
    expect(
      verifyStripeSignature(payload + "x", header, secret, 300, now),
    ).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const now = Math.floor(Date.now() / 1000);
    const header = sign(now, payload, "whsec_wrong");
    expect(verifyStripeSignature(payload, header, secret, 300, now)).toBe(false);
  });

  it("rejects a stale timestamp (replay)", () => {
    const now = Math.floor(Date.now() / 1000);
    const old = now - 10_000;
    const header = sign(old, payload);
    expect(verifyStripeSignature(payload, header, secret, 300, now)).toBe(false);
  });

  it("rejects missing/garbage header", () => {
    expect(verifyStripeSignature(payload, undefined, secret)).toBe(false);
    expect(verifyStripeSignature(payload, "garbage", secret)).toBe(false);
  });
});

describe("priceIdToTier", () => {
  it("maps configured price ids to tiers", () => {
    process.env.STRIPE_PRICE_ESTUDANTE = "price_est_123";
    process.env.STRIPE_PRICE_PRO = "price_pro_456";
    expect(priceIdToTier("price_est_123")).toBe("estudante");
    expect(priceIdToTier("price_pro_456")).toBe("pro");
    expect(priceIdToTier("price_unknown")).toBe(null);
    expect(priceIdToTier(null)).toBe(null);
  });
});
