import {
  SPECTRUM_ORDER,
  SPECTRUM_COLORS,
  SPECTRUM_BG,
  SPECTRUM_TEXT,
  SPECTRUM_LABELS,
  SPECTRUM_ABBR,
  getDominantSpectrum,
  type SpectrumData,
} from "@/lib/spectrum";

// Re-exported for backwards compatibility with existing imports.
export { getDominantSpectrum };
export type { SpectrumData };

interface SpectrumBarProps {
  data: SpectrumData;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showCoverage?: boolean;
}

const PCT_BY_KEY = (data: SpectrumData): Record<string, number> => ({
  esquerda: data.leftPct,
  "centro-esquerda": data.centerLeftPct,
  centro: data.centerPct,
  "centro-direita": data.centerRightPct,
  direita: data.rightPct,
});

export default function SpectrumBar({
  data,
  size = "md",
  showLabels = true,
  showCoverage = true,
}: SpectrumBarProps) {
  const height = size === "sm" ? 5 : size === "lg" ? 12 : 7;
  const fontSize = size === "sm" ? "10px" : "11px";

  const byKey = PCT_BY_KEY(data);
  const total = SPECTRUM_ORDER.reduce((sum, k) => sum + byKey[k], 0);
  const norm = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const segments = SPECTRUM_ORDER.map((key) => ({
    key,
    color: SPECTRUM_COLORS[key],
    pct: norm(byKey[key]),
    raw: byKey[key],
    label: SPECTRUM_LABELS[key],
    abbr: SPECTRUM_ABBR[key],
  }));

  const dominant = getDominantSpectrum(data);
  const hasData = total > 0;

  // Text alternative so the distribution is conveyed without relying on color.
  const ariaLabel = hasData
    ? "Distribuição da cobertura: " +
      segments
        .filter((s) => s.raw > 0)
        .map((s) => `${s.label} ${Math.round(s.raw)}%`)
        .join(", ")
    : "Sem cobertura registrada";

  return (
    <div style={{ width: "100%" }}>
      {showCoverage && hasData && (
        <p style={{ fontSize, color: "#888", marginBottom: "4px", lineHeight: 1.4 }}>
          <strong style={{ color: dominant.color, fontWeight: 700 }}>
            {Math.round(dominant.pct)}% {dominant.label}
          </strong>
          {" · "}
          <span style={{ color: "#aaa" }}>
            {data.totalSources} {data.totalSources === 1 ? "fonte" : "fontes"}
          </span>
        </p>
      )}

      {/* Segmented bar — wide enough segments show an abbreviation so the
          spectrum is legible without color (acessibilidade / daltonismo). */}
      <div
        role="img"
        aria-label={ariaLabel}
        style={{
          display: "flex",
          height: `${height}px`,
          width: "100%",
          borderRadius: "3px",
          overflow: "hidden",
          gap: "1px",
          backgroundColor: "#e5e3df",
        }}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {size === "lg" && seg.pct >= 10 && (
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {seg.abbr}
                  </span>
                )}
              </div>
            ) : null,
          )
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#e5e3df" }} />
        )}
      </div>

      {showLabels && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", marginTop: "5px" }}>
          {segments
            .map((seg) => {
              const isDominant = hasData && seg.raw === dominant.pct && seg.raw > 0;
              const isZero = seg.raw === 0;
              return (
                <span
                  key={seg.key}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "10.5px",
                    fontWeight: isDominant ? 700 : 500,
                    color: isDominant ? seg.color : isZero ? "#cccccc" : "#888888",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: isZero ? "#dddddd" : seg.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {seg.label} {Math.round(seg.raw)}%
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
}

/** Small inline badge showing an outlet's spectrum (label + color). */
export function SpectrumBadge({ spectrum }: { spectrum: string }) {
  const color = SPECTRUM_TEXT[spectrum] || "#555";
  const bg = SPECTRUM_BG[spectrum] || "#f5f5f5";
  const label = SPECTRUM_LABELS[spectrum] || spectrum;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "10.5px",
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: "3px",
        backgroundColor: bg,
        color,
        border: `1px solid ${color}30`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
