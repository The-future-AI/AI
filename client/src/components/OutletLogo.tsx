import { useState } from "react";
import { outletLogo } from "@/lib/spectrum";

/**
 * Logo de um veículo com tooltip elegante ao hover/tap.
 * Tenta o favicon do site; se falhar, mostra um círculo com a inicial.
 */
export function OutletLogo({
  name,
  siteUrl,
  spectrumColor = "#888888",
  spectrumLabel,
  size = 18,
}: {
  name: string;
  siteUrl?: string | null;
  spectrumColor?: string;
  spectrumLabel?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const src = outletLogo(siteUrl, 64);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  const tooltipContent = (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: "50%",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        borderRadius: "6px",
        padding: "6px 10px",
        fontSize: "11px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 200,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        opacity: showTooltip ? 1 : 0,
        transform: showTooltip
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(4px) scale(0.95)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
      }}
    >
      <span>{name}</span>
      {spectrumLabel && (
        <>
          <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 4px" }}>·</span>
          <span style={{ color: spectrumColor, fontWeight: 600 }}>{spectrumLabel}</span>
        </>
      )}
      {/* Arrow */}
      <div style={{
        position: "absolute",
        top: "100%", left: "50%",
        transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "5px solid #1a1a1a",
      }} />
    </div>
  );

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    flexShrink: 0,
    cursor: "default",
  };

  const handlers = {
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
    onTouchStart: () => setShowTooltip((v) => !v),
    onBlur: () => setShowTooltip(false),
  };

  if (!src || failed) {
    return (
      <span style={wrapperStyle} {...handlers}>
        {tooltipContent}
        <span
          aria-label={name}
          style={{
            width: size, height: size, borderRadius: "50%",
            backgroundColor: spectrumColor, color: "#ffffff",
            fontSize: Math.round(size * 0.55), fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            display: "inline-flex", alignItems: "center",
            justifyContent: "center", lineHeight: 1,
          }}
        >
          {initial}
        </span>
      </span>
    );
  }

  return (
    <span style={wrapperStyle} {...handlers}>
      {tooltipContent}
      <img
        src={src}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          width: size, height: size, borderRadius: "4px",
          objectFit: "contain", background: "#ffffff",
          display: "block",
        }}
      />
    </span>
  );
}

export default OutletLogo;
