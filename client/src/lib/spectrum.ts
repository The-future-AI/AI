/**
 * Fonte única de verdade dos tokens visuais do espectro político no frontend.
 *
 * Antes estas cores/rótulos estavam copiados em SpectrumBar, TopicCard,
 * TopicDetail, Metodologia, Busca e Home. Centralizar aqui evita divergências
 * (item 7) e dá suporte a acessibilidade — as abreviações permitem distinguir
 * os espectros sem depender só da cor (item 3).
 *
 * As cores espelham as variáveis CSS em `client/src/index.css`.
 */

export type SpectrumKey =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";

export const SPECTRUM_ORDER: SpectrumKey[] = [
  "esquerda",
  "centro-esquerda",
  "centro",
  "centro-direita",
  "direita",
];

/** Cor sólida (barras, pontos, destaques). */
export const SPECTRUM_COLORS: Record<string, string> = {
  esquerda: "#c0392b",
  "centro-esquerda": "#e05c3a",
  centro: "#888888",
  "centro-direita": "#2980b9",
  direita: "#1565c0",
};

/** Fundo claro para badges/caixas. */
export const SPECTRUM_BG: Record<string, string> = {
  esquerda: "#fdf0ee",
  "centro-esquerda": "#fef3ef",
  centro: "#f5f5f5",
  "centro-direita": "#e8f4fd",
  direita: "#e3f0ff",
};

/** Cor de texto com contraste suficiente sobre o fundo claro. */
export const SPECTRUM_TEXT: Record<string, string> = {
  esquerda: "#7b241c",
  "centro-esquerda": "#8b3a22",
  centro: "#555555",
  "centro-direita": "#1a5276",
  direita: "#0d47a1",
};

/** Rótulo curto (usado em badges estreitos). */
export const SPECTRUM_LABELS: Record<string, string> = {
  esquerda: "Esquerda",
  "centro-esquerda": "C-Esquerda",
  centro: "Centro",
  "centro-direita": "C-Direita",
  direita: "Direita",
};

/** Rótulo completo (usado em legendas e títulos). */
export const SPECTRUM_LABELS_FULL: Record<string, string> = {
  esquerda: "Esquerda",
  "centro-esquerda": "Centro-Esquerda",
  centro: "Centro",
  "centro-direita": "Centro-Direita",
  direita: "Direita",
};

/**
 * Abreviação de 1–2 letras para diferenciar espectros sem depender de cor —
 * essencial para usuários com daltonismo (item de acessibilidade).
 */
export const SPECTRUM_ABBR: Record<string, string> = {
  esquerda: "E",
  "centro-esquerda": "CE",
  centro: "C",
  "centro-direita": "CD",
  direita: "D",
};

export const CATEGORY_LABELS: Record<string, string> = {
  politica: "Política",
  economia: "Economia",
  internacional: "Internacional",
  esporte: "Esporte",
  tecnologia: "Tecnologia",
  geral: "Geral",
};

export interface SpectrumData {
  leftPct: number;
  centerLeftPct: number;
  centerPct: number;
  centerRightPct: number;
  rightPct: number;
  totalSources: number;
}

export function getDominantSpectrum(data: SpectrumData): {
  label: string;
  short: string;
  pct: number;
  color: string;
} {
  const entries = [
    { label: "Esquerda", short: "Esq.", pct: data.leftPct, color: SPECTRUM_COLORS.esquerda },
    { label: "C-Esquerda", short: "C-Esq.", pct: data.centerLeftPct, color: SPECTRUM_COLORS["centro-esquerda"] },
    { label: "Centro", short: "Centro", pct: data.centerPct, color: SPECTRUM_COLORS.centro },
    { label: "C-Direita", short: "C-Dir.", pct: data.centerRightPct, color: SPECTRUM_COLORS["centro-direita"] },
    { label: "Direita", short: "Dir.", pct: data.rightPct, color: SPECTRUM_COLORS.direita },
  ];
  return entries.reduce((a, b) => (b.pct > a.pct ? b : a), entries[0]);
}

/**
 * URL do logo de um veículo a partir do endereço do site. Usa o serviço de
 * favicons do Google — confiável e sem necessidade de hospedar assets.
 */
export function outletLogo(siteUrl: string | null | undefined, size = 64): string | null {
  if (!siteUrl) return null;
  try {
    const host = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${host}`;
  } catch {
    return null;
  }
}
