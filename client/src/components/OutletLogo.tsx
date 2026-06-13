import { useState } from "react";
import { outletLogo } from "@/lib/spectrum";

/**
 * Logo de um veículo (item 1). Tenta o favicon do site; se falhar, mostra um
 * círculo com a inicial do nome, na cor do espectro — assim a marca nunca
 * "some" e a fonte continua identificável.
 */
export function OutletLogo({
  name,
  siteUrl,
  spectrumColor = "#888888",
  size = 18,
}: {
  name: string;
  siteUrl?: string | null;
  spectrumColor?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = outletLogo(siteUrl, 64);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: spectrumColor,
          color: "#ffffff",
          fontSize: Math.round(size * 0.55),
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo ${name}`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "4px",
        objectFit: "contain",
        flexShrink: 0,
        background: "#ffffff",
      }}
    />
  );
}

export default OutletLogo;
