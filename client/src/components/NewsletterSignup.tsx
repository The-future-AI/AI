import { useState } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Captura de e-mail para a newsletter.
 * `variant="sidebar"` é o cartão compacto da home; `variant="banner"` é a
 * faixa larga usada ao fim das páginas de tópico.
 */
export function NewsletterSignup({
  source,
  variant = "sidebar",
}: {
  source: string;
  variant?: "sidebar" | "banner";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        setStatus("ok");
        setMessage(res.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message || "Não foi possível inscrever. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email: email.trim(), source });
  };

  const isBanner = variant === "banner";

  if (status === "ok") {
    return (
      <div style={{
        backgroundColor: isBanner ? "#1a1a1a" : "#ffffff",
        border: "1px solid #e5e3df",
        borderRadius: "4px",
        padding: isBanner ? "24px" : "16px",
        textAlign: "center",
      }}>
        <Check size={isBanner ? 28 : 22} style={{ color: "#1a7a4a", margin: "0 auto 8px" }} />
        <p style={{
          fontSize: isBanner ? "15px" : "13px",
          fontWeight: 600,
          color: isBanner ? "#ffffff" : "#111111",
          fontFamily: "'Inter', sans-serif",
          margin: 0,
        }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: isBanner ? "#1a1a1a" : "#ffffff",
      border: isBanner ? "none" : "1px solid #e5e3df",
      borderRadius: "4px",
      overflow: "hidden",
    }}>
      {!isBanner && (
        <div style={{
          backgroundColor: "#fafaf8",
          padding: "9px 16px",
          borderBottom: "1px solid #e5e3df",
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}>
          <Mail size={13} style={{ color: "#888888" }} />
          <span style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
          }}>
            Resumo Diário
          </span>
        </div>
      )}

      <div style={{ padding: isBanner ? "24px" : "14px 16px" }}>
        {isBanner && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Mail size={18} style={{ color: "#f39c12" }} />
            <span style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#f39c12", fontFamily: "'Inter', sans-serif",
            }}>
              Resumo Diário
            </span>
          </div>
        )}

        <p style={{
          fontSize: isBanner ? "15px" : "12.5px",
          fontWeight: isBanner ? 700 : 600,
          color: isBanner ? "#ffffff" : "#111111",
          fontFamily: isBanner ? "'Playfair Display', Georgia, serif" : "'Inter', sans-serif",
          lineHeight: 1.4,
          margin: "0 0 6px",
        }}>
          {isBanner
            ? "Receba os pontos cegos da semana no seu e-mail"
            : "As principais notícias e os pontos cegos do dia."}
        </p>
        <p style={{
          fontSize: isBanner ? "13px" : "11.5px",
          color: isBanner ? "rgba(255,255,255,0.6)" : "#888888",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.5,
          margin: "0 0 12px",
        }}>
          {isBanner
            ? "Um e-mail por dia, sem spam. Cancele quando quiser."
            : "Sem spam. Cancele quando quiser."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: isBanner ? "row" : "column", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
            placeholder="seu@email.com"
            disabled={subscribe.isPending}
            style={{
              flex: isBanner ? "1 1 220px" : "none",
              width: isBanner ? undefined : "100%",
              padding: "9px 12px",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              border: "1px solid #d8d5cf",
              borderRadius: "4px",
              backgroundColor: "#ffffff",
              color: "#111111",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            style={{
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: "#ffffff",
              backgroundColor: subscribe.isPending ? "#888888" : "#c0392b",
              border: "none",
              borderRadius: "4px",
              cursor: subscribe.isPending ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {subscribe.isPending ? "Enviando..." : "Inscrever"}
          </button>
        </form>

        {status === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "8px" }}>
            <AlertCircle size={12} style={{ color: "#c0392b", flexShrink: 0 }} />
            <span style={{ fontSize: "11.5px", color: "#c0392b", fontFamily: "'Inter', sans-serif" }}>
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
