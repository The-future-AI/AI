import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Newspaper, Building2, Users, RefreshCw, AlertTriangle, CheckCircle2, Play, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SPECTRUM_COLORS, SPECTRUM_LABELS, SPECTRUM_ORDER } from "@/lib/spectrum";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

/* ── Tab type ─────────────────────────────────────────────────────────────────── */
type Tab = "topics" | "outlets" | "newsletter" | "scraper";

/* ── Card wrapper ────────────────────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e3df",
      borderRadius: "6px",
      padding: "clamp(14px, 4vw, 24px)",
      marginBottom: "16px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Topics tab ──────────────────────────────────────────────────────────────── */
function TopicsTab() {
  const { data, isLoading } = trpc.topics.list.useQuery({ limit: 50, offset: 0 });
  const topics = data?.items || [];

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} style={{ height: 60, borderRadius: 4 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif", marginBottom: "16px" }}>
        {topics.length} tópicos carregados
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {topics.map((t) => {
          const publishedAt = t.publishedAt instanceof Date ? t.publishedAt : new Date(t.publishedAt);
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 14px",
              backgroundColor: "#ffffff", border: "1px solid #e5e3df",
              borderRadius: "4px",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.05em", color: "#888888", fontFamily: "'Inter', sans-serif",
                  }}>
                    #{t.id}
                  </span>
                  {t.isBlindspot && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "#f39c12",
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      ● Ponto Cego
                    </span>
                  )}
                  <span style={{ fontSize: "11px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
                    {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
                  </span>
                  <span style={{ fontSize: "11px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
                    · {t.totalSources} fontes
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "14px", fontWeight: 600, color: "#111111",
                  margin: 0, lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {t.title}
                </p>
              </div>
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {SPECTRUM_ORDER.map((s) => {
                  const pct = s === "esquerda" ? t.leftPct
                    : s === "centro-esquerda" ? t.centerLeftPct
                    : s === "centro" ? t.centerPct
                    : s === "centro-direita" ? t.centerRightPct
                    : t.rightPct;
                  if (!pct) return null;
                  return (
                    <span key={s} style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 5px",
                      borderRadius: "2px", color: SPECTRUM_COLORS[s],
                      backgroundColor: SPECTRUM_COLORS[s] + "15",
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {SPECTRUM_LABELS[s]} {Math.round(pct)}%
                    </span>
                  );
                })}
              </div>
              <Link href={`/topico/${t.id}`}>
                <button style={{
                  padding: "5px 10px", borderRadius: "3px",
                  border: "1px solid #e5e3df", backgroundColor: "#ffffff",
                  fontSize: "11px", fontFamily: "'Inter', sans-serif",
                  cursor: "pointer", color: "#666666",
                }}>
                  Ver
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Outlets tab ─────────────────────────────────────────────────────────────── */
function OutletsTab() {
  const { data: outlets, isLoading } = trpc.outlets.list.useQuery();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} style={{ height: 60, borderRadius: 4 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif", marginBottom: "16px" }}>
        {outlets?.length || 0} veículos cadastrados
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {outlets?.map((outlet) => (
          <div key={outlet.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 14px",
            backgroundColor: "#ffffff", border: "1px solid #e5e3df",
            borderRadius: "4px",
            borderLeft: `4px solid ${SPECTRUM_COLORS[outlet.spectrum || "centro"] || "#888"}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <span style={{
                  fontSize: "14px", fontWeight: 700, color: "#111111",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {outlet.name}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: SPECTRUM_COLORS[outlet.spectrum || "centro"],
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {SPECTRUM_LABELS[outlet.spectrum || "centro"]}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
                {outlet.slug} · {outlet.ownership || "—"} · {outlet.foundedYear || "—"}
              </div>
            </div>
            <Link href={`/veiculo/${outlet.slug}`}>
              <button style={{
                padding: "5px 10px", borderRadius: "3px",
                border: "1px solid #e5e3df", backgroundColor: "#ffffff",
                fontSize: "11px", fontFamily: "'Inter', sans-serif",
                cursor: "pointer", color: "#666666",
              }}>
                Ver perfil
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Scraper tab ─────────────────────────────────────────────────────────────── */
function ScraperTab() {
  const { data: status, isLoading, refetch } = trpc.scraper.status.useQuery();
  const runMutation = trpc.scraper.run.useMutation({
    onSuccess: () => { refetch(); },
  });

  return (
    <div>
      <Card>
        <p style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
          marginBottom: "14px",
        }}>
          Status do scraper
        </p>

        {isLoading ? (
          <Skeleton style={{ height: 60, borderRadius: 4 }} />
        ) : status ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {status.status === "completed" ? (
                <CheckCircle2 size={18} style={{ color: "#1a7a4a" }} />
              ) : status.status === "running" ? (
                <RefreshCw size={18} style={{ color: "#2563a8", animation: "spin 1s linear infinite" }} />
              ) : (
                <AlertTriangle size={18} style={{ color: "#e05c3a" }} />
              )}
              <span style={{
                fontSize: "14px", fontWeight: 600, color: "#111111",
                fontFamily: "'Inter', sans-serif",
              }}>
                {status.status === "completed" ? "Concluído" : status.status === "running" ? "Em execução" : "Erro"}
              </span>
            </div>
            {status.startedAt && (
              <div style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
                <Clock size={11} style={{ display: "inline", marginRight: "4px" }} />
                Iniciado {formatDistanceToNow(new Date(status.startedAt), { addSuffix: true, locale: ptBR })}
              </div>
            )}
            {status.articlesScraped !== null && status.articlesScraped !== undefined && (
              <div style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
                {status.articlesScraped} artigos coletados · {status.topicsCreated} tópicos criados
              </div>
            )}
            {status.errorMessage && (
              <div style={{
                fontSize: "12px", color: "#e05c3a", fontFamily: "'Inter', sans-serif",
                backgroundColor: "#fff5f5", padding: "8px 12px", borderRadius: "4px",
                border: "1px solid #fecaca",
              }}>
                {status.errorMessage}
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
            Nenhum job de scraping registrado.
          </p>
        )}

        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending || status?.status === "running"}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "4px",
              backgroundColor: "#111111", color: "#ffffff",
              border: "none", cursor: runMutation.isPending ? "default" : "pointer",
              fontSize: "13px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
              opacity: runMutation.isPending ? 0.6 : 1,
            }}
          >
            <Play size={13} />
            {runMutation.isPending ? "Iniciando..." : "Executar pipeline agora"}
          </button>
          <button
            onClick={() => refetch()}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "4px",
              backgroundColor: "#ffffff", color: "#666666",
              border: "1px solid #e5e3df", cursor: "pointer",
              fontSize: "13px", fontFamily: "'Inter', sans-serif",
            }}
          >
            <RefreshCw size={13} />
            Atualizar status
          </button>
        </div>
      </Card>

      <div style={{
        padding: "14px 18px",
        backgroundColor: "#fffbea", border: "1px solid #f0c040",
        borderRadius: "6px",
      }}>
        <p style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: "#a07000" }}>Atenção:</strong>{" "}
          Executar o pipeline consome créditos de LLM para classificação e agrupamento de notícias.
          O pipeline já é executado automaticamente a cada hora via heartbeat.
        </p>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("topics");
  const { user, loading } = useAuth();

  useDocumentMeta({
    title: "Admin — Contextual News",
  });

  // Auth gate
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
        <Navbar />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 1.5rem" }}>
          <Skeleton style={{ height: 32, width: "40%", marginBottom: 24, borderRadius: 3 }} />
          <Skeleton style={{ height: 200, borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
        <Navbar />
        <div style={{ textAlign: "center", paddingTop: "80px", padding: "80px 20px" }}>
          <AlertTriangle size={48} style={{ color: "#f39c12", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "#333" }}>
            Acesso restrito
          </h2>
          <p style={{ fontSize: "14px", color: "#888888", fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}>
            Você precisa estar autenticado para acessar o painel de administração.
          </p>
          <a href={getLoginUrl()} style={{
            display: "inline-block", padding: "10px 24px",
            backgroundColor: "#111111", color: "#ffffff",
            borderRadius: "5px", textDecoration: "none",
            fontSize: "13px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
          }}>
            Entrar com Manus
          </a>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "topics", label: "Tópicos", icon: <Newspaper size={14} /> },
    { id: "outlets", label: "Veículos", icon: <Building2 size={14} /> },
    { id: "scraper", label: "Scraper", icon: <RefreshCw size={14} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Back */}
        <Link href="/">
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "13px", color: "#888888", backgroundColor: "transparent",
            border: "none", cursor: "pointer", marginBottom: "20px", padding: 0,
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
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(20px, 4vw, 26px)",
            fontWeight: 700, color: "#111111", marginBottom: "4px",
          }}>
            Painel de Administração
          </h1>
          <p style={{ fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
            Bem-vindo, {user.name || user.openId}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "4px", marginBottom: "20px",
          borderBottom: "1px solid #e5e3df", paddingBottom: "0",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 16px",
                border: "none", borderBottom: activeTab === tab.id ? "2px solid #111111" : "2px solid transparent",
                backgroundColor: "transparent",
                fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 500,
                fontFamily: "'Inter', sans-serif",
                color: activeTab === tab.id ? "#111111" : "#888888",
                cursor: "pointer", transition: "all 0.15s ease",
                marginBottom: "-1px",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "topics" && <TopicsTab />}
        {activeTab === "outlets" && <OutletsTab />}
        {activeTab === "scraper" && <ScraperTab />}
      </div>
    </div>
  );
}
