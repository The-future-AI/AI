import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

/**
 * Botões de compartilhamento. WhatsApp aparece primeiro por ser o canal
 * dominante de distribuição de notícias no Brasil. Usa a Web Share API
 * nativa quando disponível (mobile) e cai para links diretos no desktop.
 */
export function ShareButtons({
  title,
  url,
}: {
  title: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(title);

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // usuário cancelou — sem ação
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — sem ação
    }
  };

  const targets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      bg: "#25D366",
      fg: "#ffffff",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      bg: "#000000",
      fg: "#ffffff",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: "#1877F2",
      fg: "#ffffff",
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.06em", color: "#888888", fontFamily: "'Inter', sans-serif",
      }}>
        <Share2 size={12} />
        Compartilhar
      </span>

      {canNativeShare ? (
        <button
          onClick={handleNativeShare}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 12px", fontSize: "12px", fontWeight: 600,
            fontFamily: "'Inter', sans-serif", color: "#ffffff",
            backgroundColor: "#c0392b", border: "none", borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Share2 size={13} />
          Compartilhar
        </button>
      ) : (
        targets.map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "6px 12px", fontSize: "12px", fontWeight: 600,
              fontFamily: "'Inter', sans-serif", color: t.fg,
              backgroundColor: t.bg, borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            {t.label}
          </a>
        ))
      )}

      <button
        onClick={handleCopy}
        title="Copiar link"
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", fontSize: "12px", fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          color: copied ? "#1a7a4a" : "#555555",
          backgroundColor: "#ffffff",
          border: `1px solid ${copied ? "#1a7a4a" : "#d8d5cf"}`,
          borderRadius: "4px", cursor: "pointer",
        }}
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  );
}
