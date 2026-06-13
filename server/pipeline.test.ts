import { describe, expect, it } from "vitest";

// Test the spectrum stats computation logic (extracted for testing)
function computeSpectrumStats(spectrums: (string | null)[]) {
  const counts = {
    esquerda: 0,
    "centro-esquerda": 0,
    centro: 0,
    "centro-direita": 0,
    direita: 0,
  };

  for (const s of spectrums) {
    if (s && s in counts) {
      counts[s as keyof typeof counts]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return { counts, pcts: { ...counts }, total: 0 };

  const pcts = {
    esquerda: Math.round((counts.esquerda / total) * 100),
    "centro-esquerda": Math.round((counts["centro-esquerda"] / total) * 100),
    centro: Math.round((counts.centro / total) * 100),
    "centro-direita": Math.round((counts["centro-direita"] / total) * 100),
    direita: Math.round((counts.direita / total) * 100),
  };

  return { counts, pcts, total };
}

function detectBlindspot(pcts: Record<string, number>): {
  isBlindspot: boolean;
  spectrum?: string;
} {
  const BLINDSPOT_THRESHOLD = 70;
  const leftTotal = (pcts.esquerda || 0) + (pcts["centro-esquerda"] || 0);
  const rightTotal = (pcts["centro-direita"] || 0) + (pcts.direita || 0);

  if (leftTotal >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "esquerda" };
  }
  if (rightTotal >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "direita" };
  }
  if ((pcts.esquerda || 0) >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "esquerda" };
  }
  if ((pcts.direita || 0) >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "direita" };
  }

  return { isBlindspot: false };
}

describe("computeSpectrumStats", () => {
  it("computes correct percentages for balanced coverage", () => {
    const spectrums = [
      "esquerda",
      "esquerda",
      "centro",
      "centro",
      "direita",
      "direita",
    ];
    const result = computeSpectrumStats(spectrums);
    expect(result.total).toBe(6);
    expect(result.counts.esquerda).toBe(2);
    expect(result.counts.centro).toBe(2);
    expect(result.counts.direita).toBe(2);
    expect(result.pcts.esquerda).toBe(33);
    expect(result.pcts.centro).toBe(33);
    expect(result.pcts.direita).toBe(33);
  });

  it("handles empty spectrum array", () => {
    const result = computeSpectrumStats([]);
    expect(result.total).toBe(0);
    expect(result.pcts.esquerda).toBe(0);
  });

  it("handles null values in spectrum array", () => {
    const spectrums = ["esquerda", null, "direita", null];
    const result = computeSpectrumStats(spectrums);
    expect(result.total).toBe(2);
    expect(result.counts.esquerda).toBe(1);
    expect(result.counts.direita).toBe(1);
  });

  it("computes 100% for single spectrum", () => {
    const spectrums = ["centro", "centro", "centro"];
    const result = computeSpectrumStats(spectrums);
    expect(result.pcts.centro).toBe(100);
    expect(result.pcts.esquerda).toBe(0);
  });

  it("handles all five spectrum categories", () => {
    const spectrums = [
      "esquerda",
      "centro-esquerda",
      "centro",
      "centro-direita",
      "direita",
    ];
    const result = computeSpectrumStats(spectrums);
    expect(result.total).toBe(5);
    expect(result.counts["centro-esquerda"]).toBe(1);
    expect(result.counts["centro-direita"]).toBe(1);
  });
});

describe("detectBlindspot", () => {
  it("detects left blindspot when left coverage >= 70%", () => {
    const pcts = {
      esquerda: 80,
      "centro-esquerda": 0,
      centro: 10,
      "centro-direita": 5,
      direita: 5,
    };
    const result = detectBlindspot(pcts);
    expect(result.isBlindspot).toBe(true);
    expect(result.spectrum).toBe("esquerda");
  });

  it("detects right blindspot when right coverage >= 70%", () => {
    const pcts = {
      esquerda: 5,
      "centro-esquerda": 5,
      centro: 10,
      "centro-direita": 40,
      direita: 40,
    };
    const result = detectBlindspot(pcts);
    expect(result.isBlindspot).toBe(true);
    expect(result.spectrum).toBe("direita");
  });

  it("does not flag balanced coverage as blindspot", () => {
    const pcts = {
      esquerda: 25,
      "centro-esquerda": 15,
      centro: 20,
      "centro-direita": 25,
      direita: 15,
    };
    const result = detectBlindspot(pcts);
    expect(result.isBlindspot).toBe(false);
  });

  it("detects combined left+center-left blindspot", () => {
    const pcts = {
      esquerda: 40,
      "centro-esquerda": 35,
      centro: 15,
      "centro-direita": 5,
      direita: 5,
    };
    const result = detectBlindspot(pcts);
    expect(result.isBlindspot).toBe(true);
    expect(result.spectrum).toBe("esquerda");
  });
});

describe("spectrum categories", () => {
  it("validates all five spectrum values", () => {
    const validSpectrums = [
      "esquerda",
      "centro-esquerda",
      "centro",
      "centro-direita",
      "direita",
    ];
    expect(validSpectrums).toHaveLength(5);
    expect(validSpectrums[0]).toBe("esquerda");
    expect(validSpectrums[4]).toBe("direita");
  });

  it("validates all category values", () => {
    const validCategories = [
      "politica",
      "economia",
      "internacional",
      "esporte",
      "tecnologia",
      "geral",
    ];
    expect(validCategories).toHaveLength(6);
    expect(validCategories).toContain("politica");
    expect(validCategories).toContain("economia");
  });
});
