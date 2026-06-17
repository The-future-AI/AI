import { Link } from "wouter";
import { Lock, Sparkles } from "lucide-react";

/**
 * Cartão de bloqueio exibido onde um recurso é exclusivo de planos pagos.
 * O conteúdo real nunca é enviado ao cliente sem direito (o servidor remove);
 * este cartão apenas convida o usuário a assinar.
 */
export function PaywallCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        border: "1px dashed #d8b24a",
        backgroundColor: "#fffdf5",
        borderRadius: "6px",
        padding: "18px 20px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "8px",
          backgroundColor: "#fbf0cf",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Lock size={16} style={{ color: "#b8860b" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#b8860b",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Recurso de assinante
          </span>
        </div>
        <h4
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#111111",
            fontFamily: "'Playfair Display', Georgia, serif",
            margin: "0 0 4px",
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: "13px",
            color: "#666666",
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
            margin: "0 0 12px",
          }}
        >
          {description}
        </p>
        <Link href="/planos">
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: "#ffffff",
              backgroundColor: "#c0392b",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <Sparkles size={14} />
            Ver planos
          </button>
        </Link>
      </div>
    </div>
  );
}
