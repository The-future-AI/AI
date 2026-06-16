import { Link } from "wouter";
import { ArrowLeft, Check, Lock, Zap, Users, Building2, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/* ── Plan data ──────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: null,
    priceNote: "Sempre grátis",
    icon: <Star size={22} />,
    color: "#888888",
    bg: "#f8f8f8",
    border: "#e5e3df",
    highlight: false,
    features: [
      "Feed de notícias com análise de espectro",
      "Até 5 análises detalhadas por dia",
      "Seção Ponto Cego",
      "Busca por palavra-chave",
      "Perfis dos veículos monitorados",
      "Metodologia transparente",
    ],
    limitations: [
      "Sem análise jornalística completa por IA",
      "Sem alertas de ponto cego por e-mail",
      "Sem acesso ao histórico completo",
    ],
  },
  {
    id: "estudante",
    name: "Estudante",
    price: "R$ 9,90",
    priceNote: "por mês · com comprovante",
    icon: <Zap size={22} />,
    color: "#2563a8",
    bg: "#e8f1f8",
    border: "#2563a820",
    highlight: false,
    badge: "Em breve",
    features: [
      "Tudo do plano Gratuito",
      "Análises jornalísticas ilimitadas por IA",
      "Alertas semanais de ponto cego por e-mail",
      "Histórico de cobertura (últimos 90 dias)",
      "Exportação de análises em PDF",
      "Desconto de 50% com comprovante de matrícula",
    ],
    limitations: [],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 19,90",
    priceNote: "por mês",
    icon: <Lock size={22} />,
    color: "#1a7a4a",
    bg: "#e8f5ee",
    border: "#1a7a4a20",
    highlight: true,
    badge: "Em breve",
    features: [
      "Tudo do plano Estudante",
      "Alertas diários personalizados por tema",
      "Histórico completo (desde o início)",
      "API de acesso aos dados (rate limit generoso)",
      "Dashboard pessoal de acompanhamento",
      "Suporte prioritário por e-mail",
    ],
    limitations: [],
  },
  {
    id: "organizacao",
    name: "Organização",
    price: "Sob consulta",
    priceNote: "para equipes e redações",
    icon: <Building2 size={22} />,
    color: "#7c3aed",
    bg: "#f3e8ff",
    border: "#7c3aed20",
    highlight: false,
    badge: "Em breve",
    features: [
      "Tudo do plano Pro",
      "Múltiplos usuários (até 20 assentos)",
      "API sem rate limit",
      "Relatórios mensais de cobertura",
      "Integração com ferramentas de redação",
      "SLA e suporte dedicado",
      "Treinamento para equipes",
    ],
    limitations: [],
  },
];

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function Planos() {
  useDocumentMeta({
    title: "Planos — Contextual News",
    description: "Escolha o plano ideal para acompanhar a cobertura jornalística brasileira com análise de espectro político.",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Back */}
        <Link href="/">
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "13px", color: "#888888", backgroundColor: "transparent",
            border: "none", cursor: "pointer", marginBottom: "32px", padding: 0,
            fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888888"; }}
          >
            <ArrowLeft size={14} />
            Voltar ao feed
          </button>
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700, lineHeight: 1.2, color: "#111111", marginBottom: "12px",
          }}>
            Jornalismo sem bolha
          </h1>
          <p style={{
            fontSize: "16px", color: "#666666", lineHeight: 1.6,
            fontFamily: "'Inter', sans-serif", maxWidth: "520px", margin: "0 auto",
          }}>
            Escolha o plano que melhor se adapta à sua necessidade de acompanhar a cobertura política brasileira com contexto e transparência.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }} className="plans-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: "#ffffff",
                border: plan.highlight ? `2px solid ${plan.color}` : "1px solid #e5e3df",
                borderRadius: "8px",
                padding: "24px 20px",
                position: "relative",
                boxShadow: plan.highlight ? `0 4px 24px ${plan.color}20` : "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Highlight badge */}
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  backgroundColor: plan.color, color: "#ffffff",
                  fontSize: "11px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap",
                }}>
                  Mais popular
                </div>
              )}

              {/* Coming soon badge */}
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  backgroundColor: "#f0f0f0", color: "#888888",
                  fontSize: "10px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "3px 8px", borderRadius: "3px",
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "8px",
                  backgroundColor: plan.bg, border: `1px solid ${plan.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: plan.color,
                }}>
                  {plan.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: "16px", fontWeight: 700, color: "#111111",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {plan.name}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  fontSize: plan.price ? "26px" : "20px",
                  fontWeight: 900, color: plan.color,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  lineHeight: 1,
                }}>
                  {plan.price || "Grátis"}
                </div>
                <div style={{
                  fontSize: "11px", color: "#aaaaaa",
                  fontFamily: "'Inter', sans-serif", marginTop: "4px",
                }}>
                  {plan.priceNote}
                </div>
              </div>

              {/* Features */}
              <ul style={{ margin: 0, padding: 0, listStyle: "none", flex: 1, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "13px", color: "#444444", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                style={{
                  width: "100%", padding: "10px 16px",
                  borderRadius: "5px", cursor: plan.id === "free" ? "pointer" : "default",
                  fontSize: "13px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  border: plan.highlight ? "none" : `1px solid ${plan.color}40`,
                  backgroundColor: plan.highlight ? plan.color : plan.bg,
                  color: plan.highlight ? "#ffffff" : plan.color,
                  transition: "opacity 0.15s ease",
                  opacity: plan.id === "free" ? 1 : 0.7,
                }}
                onClick={() => {
                  if (plan.id === "free") {
                    window.location.href = "/";
                  }
                }}
              >
                {plan.id === "free" ? "Começar agora" : "Em breve"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(16px, 4vw, 28px)",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px", fontWeight: 700, color: "#111111",
            marginBottom: "20px",
          }}>
            Perguntas frequentes
          </h2>

          {[
            {
              q: "O plano gratuito é realmente gratuito?",
              a: "Sim. O plano gratuito nunca terá prazo de expiração. Nosso modelo de negócio é baseado em assinaturas pagas, não em publicidade ou venda de dados.",
            },
            {
              q: "Como funciona o desconto para estudantes?",
              a: "Ao assinar o plano Estudante, você precisará enviar um comprovante de matrícula válido em instituição de ensino superior. O desconto é de 50% sobre o preço regular.",
            },
            {
              q: "Os dados são vendidos para terceiros?",
              a: "Não. Nunca vendemos dados de usuários. Nossa receita vem exclusivamente de assinaturas.",
            },
            {
              q: "Quando os planos pagos estarão disponíveis?",
              a: "Estamos em fase de desenvolvimento. Cadastre-se na nossa newsletter para ser avisado em primeira mão quando os planos pagos forem lançados.",
            },
          ].map((item, i) => (
            <div key={i} style={{
              paddingBottom: "16px",
              marginBottom: "16px",
              borderBottom: i < 3 ? "1px solid #f0ede8" : "none",
            }}>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px", fontWeight: 700, color: "#111111",
                marginBottom: "6px",
              }}>
                {item.q}
              </h3>
              <p style={{
                fontSize: "13px", color: "#666666", lineHeight: 1.6,
                fontFamily: "'Inter', sans-serif", margin: 0,
              }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div style={{
          backgroundColor: "#111111",
          borderRadius: "8px",
          padding: "28px",
          textAlign: "center",
          color: "#ffffff",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px", fontWeight: 700, marginBottom: "8px",
          }}>
            Seja avisado quando os planos forem lançados
          </h2>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.7)",
            fontFamily: "'Inter', sans-serif", marginBottom: "20px",
          }}>
            Cadastre-se na nossa newsletter e receba um resumo semanal de ponto cego gratuitamente.
          </p>
          <Link href="/">
            <button style={{
              padding: "10px 24px", borderRadius: "5px",
              backgroundColor: "#ffffff", color: "#111111",
              fontSize: "13px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
              border: "none", cursor: "pointer",
            }}>
              Ir para o feed e se cadastrar
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
