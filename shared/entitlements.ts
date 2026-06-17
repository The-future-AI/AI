/**
 * Modelo de direitos de acesso (entitlements) por plano.
 *
 * Fonte única compartilhada entre cliente e servidor para decidir o que cada
 * plano vê. O SERVIDOR é a autoridade — recursos pagos são removidos da
 * resposta da API para usuários sem direito (ver `topics.getStructuredAnalysis`).
 * O cliente usa o mesmo mapa apenas para exibir paywalls e estados de bloqueio.
 */

export type Tier = "free" | "estudante" | "pro" | "organizacao";

export const TIER_LABELS: Record<Tier, string> = {
  free: "Gratuito",
  estudante: "Estudante",
  pro: "Pro",
  organizacao: "Organização",
};

/** Recursos controlados por plano. */
export type Feature =
  | "framingAnalysis" // Diferenças de enquadramento entre veículos
  | "contextSection" // Bloco de contexto histórico/legal
  | "timeline" // Linha do tempo da história
  | "export" // Exportar/compartilhar relatório
  | "alerts" // Alertas de tópicos
  | "topicTracking"; // Acompanhar tópicos salvos

const ALL_FEATURES: Feature[] = [
  "framingAnalysis",
  "contextSection",
  "timeline",
  "export",
  "alerts",
  "topicTracking",
];

function featureSet(features: Feature[]): Record<Feature, boolean> {
  return ALL_FEATURES.reduce(
    (acc, f) => ({ ...acc, [f]: features.includes(f) }),
    {} as Record<Feature, boolean>,
  );
}

export const TIER_FEATURES: Record<Tier, Record<Feature, boolean>> = {
  // Gratuito: resumo neutro, lista de fontes, espectro básico e fatos em comum.
  free: featureSet([]),
  // Estudante: análise aprofundada, alertas e acompanhamento (sem exportação).
  estudante: featureSet([
    "framingAnalysis",
    "contextSection",
    "timeline",
    "alerts",
    "topicTracking",
  ]),
  // Pro e Organização: todos os recursos.
  pro: featureSet(ALL_FEATURES),
  organizacao: featureSet(ALL_FEATURES),
};

export function hasFeature(tier: Tier, feature: Feature): boolean {
  return TIER_FEATURES[tier]?.[feature] ?? false;
}

export function isPaidTier(tier: Tier): boolean {
  return tier !== "free";
}

/**
 * Plano efetivo de um usuário: só vale o plano pago se a assinatura estiver
 * ativa. Caso contrário, cai para "free". Aceita o registro de usuário (ou
 * null para anônimo).
 */
export function effectiveTier(
  user:
    | { subscriptionTier?: string | null; subscriptionStatus?: string | null }
    | null
    | undefined,
): Tier {
  if (!user) return "free";
  const tier = (user.subscriptionTier as Tier) || "free";
  if (tier === "free") return "free";
  return user.subscriptionStatus === "active" ? tier : "free";
}
