/**
 * Lógica pura de análise de viés — sem dependências de I/O.
 *
 * Mantida separada do pipeline para poder ser testada de forma isolada
 * (ver `server/analysis.test.ts`) e reutilizada no servidor e em scripts.
 */

export type Spectrum =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";

export const SPECTRUM_ORDER: Spectrum[] = [
  "esquerda",
  "centro-esquerda",
  "centro",
  "centro-direita",
  "direita",
];

export type SpectrumCounts = Record<Spectrum, number>;

export interface SpectrumStats {
  counts: SpectrumCounts;
  pcts: SpectrumCounts;
  total: number;
}

function emptyCounts(): SpectrumCounts {
  return {
    esquerda: 0,
    "centro-esquerda": 0,
    centro: 0,
    "centro-direita": 0,
    direita: 0,
  };
}

/** Conta e calcula a distribuição percentual da cobertura por espectro. */
export function computeSpectrumStats(
  spectrums: (Spectrum | string | null | undefined)[],
): SpectrumStats {
  const counts = emptyCounts();

  for (const s of spectrums) {
    if (s && s in counts) {
      counts[s as Spectrum]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return { counts, pcts: emptyCounts(), total: 0 };

  const pcts = emptyCounts();
  for (const key of SPECTRUM_ORDER) {
    pcts[key] = Math.round((counts[key] / total) * 100);
  }

  return { counts, pcts, total };
}

export interface BlindspotResult {
  isBlindspot: boolean;
  /** Lado que domina a cobertura, quando há ponto cego. */
  spectrum?: "esquerda" | "direita";
  /** Lado que praticamente ignorou a história. */
  underReportedBy?: "esquerda" | "direita";
  /** % combinado do lado dominante (0–100). */
  severity?: number;
}

const BLINDSPOT_THRESHOLD = 70;

/**
 * Detecta "ponto cego": quando um dos lados do espectro concentra a maior parte
 * da cobertura, indicando que o outro lado praticamente ignorou o assunto.
 *
 * O centro é neutro e não conta para nenhum dos lados.
 */
export function detectBlindspot(
  pcts: Partial<Record<Spectrum, number>>,
): BlindspotResult {
  const leftTotal = (pcts.esquerda || 0) + (pcts["centro-esquerda"] || 0);
  const rightTotal = (pcts["centro-direita"] || 0) + (pcts.direita || 0);

  if (leftTotal >= BLINDSPOT_THRESHOLD) {
    return {
      isBlindspot: true,
      spectrum: "esquerda",
      underReportedBy: "direita",
      severity: leftTotal,
    };
  }
  if (rightTotal >= BLINDSPOT_THRESHOLD) {
    return {
      isBlindspot: true,
      spectrum: "direita",
      underReportedBy: "esquerda",
      severity: rightTotal,
    };
  }

  return { isBlindspot: false };
}

/**
 * Inclinação líquida da cobertura, de -100 (toda à esquerda) a +100 (toda à
 * direita). Pesos: esquerda −2, centro-esquerda −1, centro 0, centro-direita
 * +1, direita +2, normalizados pelo total. Útil para ordenar/rotular o viés
 * agregado de um tópico (estilo "Bias" do Ground.news).
 */
export function overallLean(stats: SpectrumStats): number {
  if (stats.total === 0) return 0;
  const { counts, total } = stats;
  const weighted =
    counts.esquerda * -2 +
    counts["centro-esquerda"] * -1 +
    counts.centro * 0 +
    counts["centro-direita"] * 1 +
    counts.direita * 2;
  return Math.round((weighted / (total * 2)) * 100);
}

export type LeanLabel =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";

/** Converte a inclinação líquida (-100..100) em um rótulo de espectro. */
export function leanLabel(lean: number): LeanLabel {
  if (lean <= -60) return "esquerda";
  if (lean <= -20) return "centro-esquerda";
  if (lean < 20) return "centro";
  if (lean < 60) return "centro-direita";
  return "direita";
}

/**
 * Termos que sinalizam conteúdo eleitoral. Usados como fallback/​reforço da
 * detecção feita pelo LLM, para marcar tópicos da seção "Eleições".
 * Mantidos em minúsculas e sem acento problemático para casar por prefixo.
 */
export const ELECTION_KEYWORDS = [
  "elei", // eleição, eleições, eleitoral, eleitor
  "candidat", // candidato, candidatura
  "urna",
  "tse",
  "tre ", // tribunal regional eleitoral
  "voto",
  "votação",
  "votacao",
  "segundo turno",
  "primeiro turno",
  "propaganda eleitoral",
  "campanha eleitoral",
  "pesquisa eleitoral",
  "boca de urna",
  "coligação",
  "coligacao",
  "ficha limpa",
  "registro de candidatura",
];

/**
 * Detecta se um texto trata de eleições, por casamento de palavras-chave.
 * É proposital​mente abrangente — a curadoria fina fica para o admin.
 */
export function isElectionRelated(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return ELECTION_KEYWORDS.some((kw) => t.includes(kw));
}
