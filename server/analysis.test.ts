import { describe, expect, it } from "vitest";
import {
  computeSpectrumStats,
  detectBlindspot,
  overallLean,
  leanLabel,
  SPECTRUM_ORDER,
} from "./analysis";

describe("computeSpectrumStats", () => {
  it("computes correct percentages for balanced coverage", () => {
    const result = computeSpectrumStats([
      "esquerda",
      "esquerda",
      "centro",
      "centro",
      "direita",
      "direita",
    ]);
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

  it("ignores null and unknown values", () => {
    const result = computeSpectrumStats(["esquerda", null, "direita", "xyz" as never]);
    expect(result.total).toBe(2);
    expect(result.counts.esquerda).toBe(1);
    expect(result.counts.direita).toBe(1);
  });

  it("computes 100% for single spectrum", () => {
    const result = computeSpectrumStats(["centro", "centro", "centro"]);
    expect(result.pcts.centro).toBe(100);
    expect(result.pcts.esquerda).toBe(0);
  });

  it("handles all five spectrum categories", () => {
    const result = computeSpectrumStats(SPECTRUM_ORDER);
    expect(result.total).toBe(5);
    expect(result.counts["centro-esquerda"]).toBe(1);
    expect(result.counts["centro-direita"]).toBe(1);
  });
});

describe("detectBlindspot", () => {
  it("detects left blindspot and names the under-reporting side", () => {
    const result = detectBlindspot({
      esquerda: 80,
      "centro-esquerda": 0,
      centro: 10,
      "centro-direita": 5,
      direita: 5,
    });
    expect(result.isBlindspot).toBe(true);
    expect(result.spectrum).toBe("esquerda");
    expect(result.underReportedBy).toBe("direita");
    expect(result.severity).toBe(80);
  });

  it("detects right blindspot from combined right coverage", () => {
    const result = detectBlindspot({
      esquerda: 5,
      "centro-esquerda": 5,
      centro: 10,
      "centro-direita": 40,
      direita: 40,
    });
    expect(result.isBlindspot).toBe(true);
    expect(result.spectrum).toBe("direita");
    expect(result.underReportedBy).toBe("esquerda");
    expect(result.severity).toBe(80);
  });

  it("does not flag balanced coverage", () => {
    const result = detectBlindspot({
      esquerda: 25,
      "centro-esquerda": 15,
      centro: 20,
      "centro-direita": 25,
      direita: 15,
    });
    expect(result.isBlindspot).toBe(false);
  });

  it("does not flag a center-dominated story as a blindspot", () => {
    const result = detectBlindspot({
      esquerda: 10,
      "centro-esquerda": 10,
      centro: 75,
      "centro-direita": 5,
      direita: 0,
    });
    expect(result.isBlindspot).toBe(false);
  });
});

describe("overallLean", () => {
  it("is zero for empty coverage", () => {
    expect(overallLean(computeSpectrumStats([]))).toBe(0);
  });

  it("is -100 when everything is hard left", () => {
    expect(overallLean(computeSpectrumStats(["esquerda", "esquerda"]))).toBe(-100);
  });

  it("is +100 when everything is hard right", () => {
    expect(overallLean(computeSpectrumStats(["direita", "direita"]))).toBe(100);
  });

  it("is roughly centered for symmetric coverage", () => {
    expect(
      overallLean(computeSpectrumStats(["esquerda", "centro", "direita"])),
    ).toBe(0);
  });
});

describe("leanLabel", () => {
  it("maps lean scores to spectrum labels", () => {
    expect(leanLabel(-100)).toBe("esquerda");
    expect(leanLabel(-40)).toBe("centro-esquerda");
    expect(leanLabel(0)).toBe("centro");
    expect(leanLabel(40)).toBe("centro-direita");
    expect(leanLabel(100)).toBe("direita");
  });
});
