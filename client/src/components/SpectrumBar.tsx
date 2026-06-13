import React from "react";

export interface SpectrumData {
  leftPct: number;
  centerLeftPct: number;
  centerPct: number;
  centerRightPct: number;
  rightPct: number;
  totalSources: number;
}

interface SpectrumBarProps {
  data: SpectrumData;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showCoverage?: boolean;
}

// Cores do espectro político: Esquerda=vermelho, C-Esquerda=laranja, Centro=cinza, C-Direita=azul médio, Direita=azul vivo
export const SPECTRUM_COLORS = {
  esquerda:       { bar: "#c0392b", text: "#c0392b", label: "Esquerda",    short: "Esq.",   bg: "#fdf0ee" },
  centroEsquerda: { bar: "#e05c3a", text: "#e05c3a", label: "C-Esquerda",  short: "C-Esq.", bg: "#fef3ef" },
  centro:         { bar: "#888888", text: "#888888", label: "Centro",       short: "Centro", bg: "#f5f5f5" },
  centroDireita:  { bar: "#2980b9", text: "#2980b9", label: "C-Direita",   short: "C-Dir.", bg: "#e8f4fd" },
  direita:        { bar: "#1565c0", text: "#1565c0", label: "Direita",      short: "Dir.",   bg: "#e3f0ff" },
};

export function getDominantSpectrum(data: SpectrumData): { label: string; short: string; pct: number; color: string } {
  const entries = [
    { label: "Esquerda",   short: "Esq.",   pct: data.leftPct,        color: SPECTRUM_COLORS.esquerda.bar },
    { label: "C-Esquerda", short: "C-Esq.", pct: data.centerLeftPct,  color: SPECTRUM_COLORS.centroEsquerda.bar },
    { label: "Centro",     short: "Centro", pct: data.centerPct,      color: SPECTRUM_COLORS.centro.bar },
    { label: "C-Direita",  short: "C-Dir.", pct: data.centerRightPct, color: SPECTRUM_COLORS.centroDireita.bar },
    { label: "Direita",    short: "Dir.",   pct: data.rightPct,       color: SPECTRUM_COLORS.direita.bar },
  ];
  return entries.reduce((a, b) => (b.pct > a.pct ? b : a), entries[0]);
}

export default function SpectrumBar({
  data,
  size = "md",
  showLabels = true,
  showCoverage = true,
}: SpectrumBarProps) {
  const height = size === "sm" ? 5 : size === "lg" ? 10 : 7;
  const fontSize = size === "sm" ? "10px" : "11px";

  const total = data.leftPct + data.centerLeftPct + data.centerPct + data.centerRightPct + data.rightPct;
  const norm = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const segments = [
    { key: "esquerda",       color: SPECTRUM_COLORS.esquerda.bar,       pct: norm(data.leftPct),        raw: data.leftPct,        label: "Esquerda",   short: "Esq." },
    { key: "centro-esquerda",color: SPECTRUM_COLORS.centroEsquerda.bar, pct: norm(data.centerLeftPct),  raw: data.centerLeftPct,  label: "C-Esquerda", short: "C-Esq." },
    { key: "centro",         color: SPECTRUM_COLORS.centro.bar,         pct: norm(data.centerPct),      raw: data.centerPct,      label: "Centro",     short: "Centro" },
    { key: "centro-direita", color: SPECTRUM_COLORS.centroDireita.bar,  pct: norm(data.centerRightPct), raw: data.centerRightPct, label: "C-Direita",  short: "C-Dir." },
    { key: "direita",        color: SPECTRUM_COLORS.direita.bar,        pct: norm(data.rightPct),       raw: data.rightPct,       label: "Direita",    short: "Dir." },
  ];

  const dominant = getDominantSpectrum(data);
  const hasData = total > 0;

  return (
    <div style={{ width: "100%" }}>
      {/* Coverage summary: "42% Centro-Direita · 8 fontes" */}
      {showCoverage && hasData && (
        <p style={{
          fontSize: fontSize,
          fontFamily: "'Inter', sans-serif",
          color: "#888",
          marginBottom: "4px",
          lineHeight: 1.4,
        }}>
          <strong style={{ color: dominant.color, fontWeight: 700 }}>
            {Math.round(dominant.pct)}% {dominant.label}
          </strong>
          {" · "}
          <span style={{ color: "#aaa" }}>
            {data.totalSources} {data.totalSources === 1 ? "fonte" : "fontes"}
          </span>
        </p>
      )}

      {/* Segmented bar — all 5 segments always shown if they have data */}
      <div
        style={{
          display: "flex",
          height: `${height}px`,
          width: "100%",
          borderRadius: "3px",
          overflow: "hidden",
          gap: "1px",
          backgroundColor: "#e5e3df",
        }}
        title={`Esq. ${Math.round(data.leftPct)}% | C-Esq. ${Math.round(data.centerLeftPct)}% | Centro ${Math.round(data.centerPct)}% | C-Dir. ${Math.round(data.centerRightPct)}% | Dir. ${Math.round(data.rightPct)}%`}
      >
        {hasData ? (
          segments.map((seg) =>
            seg.pct > 0 ? (
              <div
                key={seg.key}
                style={{
                  backgroundColor: seg.color,
                  width: `${seg.pct}%`,
                  height: "100%",
                  minWidth: "2px",
                  flexShrink: 0,
                  transition: "width 0.3s ease",
                }}
              />
            ) : null
          )
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#e5e3df" }} />
        )}
      </div>

      {/* Labels row: "● Esquerda 29%  ● Centro 39%  ● Direita 32%" */}
      {showLabels && hasData && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 10px",
          marginTop: "5px",
        }}>
          {segments.filter(s => s.raw > 0).map((seg) => {
            const isDominant = seg.raw === dominant.pct;
            return (
              <span
                key={seg.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "10.5px",
                  fontWeight: isDominant ? 700 : 500,
                  fontFamily: "'Inter', sans-serif",
                  color: isDominant ? seg.color : "#888888",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: seg.color,
                  display: "inline-block",
                  flexShrink: 0,
                }} />
                {seg.label} {Math.round(seg.raw)}%
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Small inline badge showing outlet's spectrum */
export function SpectrumBadge({ spectrum }: { spectrum: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
  esquerda:         { label: "Esquerda",   color: "#7b241c", bg: "#fdf0ee" },
  "centro-esquerda":{ label: "C-Esquerda", color: "#8b3a22", bg: "#fef3ef" },
  centro:           { label: "Centro",     color: "#555555", bg: "#f5f5f5" },
  "centro-direita": { label: "C-Direita",  color: "#1a5276", bg: "#eef6fd" },
  direita:          { label: "Direita",    color: "#0f3460", bg: "#e8f0f8" },
  };
  const info = map[spectrum] || { label: spectrum, color: "#555", bg: "#f5f5f5" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: "10.5px",
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      letterSpacing: "0.03em",
      textTransform: "uppercase" as const,
      padding: "2px 7px",
      borderRadius: "3px",
      backgroundColor: info.bg,
      color: info.color,
      border: `1px solid ${info.color}30`,
      whiteSpace: "nowrap" as const,
    }}>
      {info.label}
    </span>
  );
}
