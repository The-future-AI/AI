import { useState } from "react";
import { Vote, TrendingUp, Users, Building2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { TopicCard } from "@/components/TopicCard";
import type { TopicCardTopic } from "@/components/TopicCard";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SPECTRUM_COLORS } from "@/lib/spectrum";

function SkeletonCard() {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #e5e3df" }}>
      <Skeleton style={{ height: 13, width: "100%", marginBottom: 4, borderRadius: 2 }} />
      <Skeleton style={{ height: 13, width: "80%", marginBottom: 8, borderRadius: 2 }} />
      <Skeleton style={{ height: 5, width: "100%", borderRadius: 2 }} />
    </div>
  );
}

function EntityPill({ label, type }: { label: string; type: "candidate" | "party" | "institution" }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    candidate: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    party:     { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    institution: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
  };
  const s = styles[type];
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      backgroundColor: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      marginRight: 6,
      marginBottom: 6,
    }}>
      {label}
    </span>
  );
}

export default function Eleicoes() {
  useDocumentMeta({
    title: "Eleições 2026 — Contextual News",
    description: "Acompanhe a cobertura das Eleições 2026 por todos os espectros políticos. Análise imparcial de como cada veículo cobre os candidatos e partidos.",
  });

  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const { data: electionTopics, isLoading, refetch, isFetching } = trpc.topics.list.useQuery({
    category: "eleicoes",
    limit: LIMIT,
    offset: page * LIMIT,
  });

  // Also fetch via the election-specific endpoint for the featured section
  const { data: featuredElection } = trpc.topics.election.useQuery({ limit: 30 });

  const topics: TopicCardTopic[] = (electionTopics?.items ?? featuredElection ?? []) as TopicCardTopic[];
  const total = electionTopics?.total ?? featuredElection?.length ?? 0;
  const hasMore = (page + 1) * LIMIT < total;

  // Extract entities from topics for the "Em destaque" sidebar
  const allCandidates = new Set<string>();
  const allParties = new Set<string>();
  const allInstitutions = new Set<string>();

  for (const t of topics) {
    const entities = (t as any).entities;
    if (entities) {
      (entities.candidates ?? []).forEach((c: string) => allCandidates.add(c));
      (entities.parties ?? []).forEach((p: string) => allParties.add(p));
      (entities.institutions ?? []).forEach((i: string) => allInstitutions.add(i));
    }
  }

  const spectrumStats = (() => {
    if (!topics.length) return null;
    const totals = { esquerda: 0, "centro-esquerda": 0, centro: 0, "centro-direita": 0, direita: 0 };
    for (const t of topics) {
      totals.esquerda += t.leftPct ?? 0;
      totals["centro-esquerda"] += t.centerLeftPct ?? 0;
      totals.centro += t.centerPct ?? 0;
      totals["centro-direita"] += t.centerRightPct ?? 0;
      totals.direita += t.rightPct ?? 0;
    }
    const n = topics.length;
    return {
      esquerda: Math.round(totals.esquerda / n),
      "centro-esquerda": Math.round(totals["centro-esquerda"] / n),
      centro: Math.round(totals.centro / n),
      "centro-direita": Math.round(totals["centro-direita"] / n),
      direita: Math.round(totals.direita / n),
    };
  })();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f4f0" }}>
      <Navbar />

      {/* Header */}
      <div style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e3df",
        padding: "20px 0 0",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Vote size={18} style={{ color: "#7c3aed" }} />
            <h1 style={{
              fontSize: "22px", fontWeight: 800, color: "#111",
              fontFamily: "'Georgia', serif", margin: 0,
            }}>
              Eleições 2026
            </h1>
          </div>
          <p style={{
            fontSize: "14px", color: "#666", fontFamily: "'Inter', sans-serif",
            margin: "0 0 16px",
          }}>
            Como cada espectro político está cobrindo a corrida eleitoral. Atualizado automaticamente a cada hora.
          </p>

          {/* Spectrum bar for election coverage */}
          {spectrumStats && (
            <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
              {[
                { key: "esquerda", pct: spectrumStats.esquerda },
                { key: "centro-esquerda", pct: spectrumStats["centro-esquerda"] },
                { key: "centro", pct: spectrumStats.centro },
                { key: "centro-direita", pct: spectrumStats["centro-direita"] },
                { key: "direita", pct: spectrumStats.direita },
              ].map(({ key, pct }) => pct > 0 ? (
                <div key={key} style={{
                  width: `${pct}%`,
                  backgroundColor: SPECTRUM_COLORS[key as keyof typeof SPECTRUM_COLORS] ?? "#ccc",
                }} />
              ) : null)}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 24,
          alignItems: "start",
        }}
          className="home-grid"
        >
          {/* Main feed */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <span style={{ fontSize: "13px", color: "#888", fontFamily: "'Inter', sans-serif" }}>
                {isLoading ? "Carregando..." : `${total} tópicos eleitorais`}
              </span>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: "12px", color: "#666", background: "none", border: "none",
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                }}
              >
                <RefreshCw size={12} style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                Atualizar
              </button>
            </div>

            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : topics.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "#888", fontFamily: "'Inter', sans-serif",
              }}>
                <Vote size={32} style={{ color: "#d1c4e9", marginBottom: 12 }} />
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>
                  Nenhum tópico eleitoral ainda
                </p>
                <p style={{ fontSize: "13px", marginTop: 6 }}>
                  Os tópicos sobre as Eleições 2026 aparecerão aqui conforme forem coletados.
                </p>
              </div>
            ) : (
              <>
                {topics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}

                {/* Pagination */}
                {(hasMore || page > 0) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
                    {page > 0 && (
                      <button
                        onClick={() => setPage(p => p - 1)}
                        style={{
                          padding: "8px 16px", borderRadius: 4, border: "1px solid #ddd",
                          background: "#fff", cursor: "pointer", fontSize: "13px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        ← Anterior
                      </button>
                    )}
                    {hasMore && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        style={{
                          padding: "8px 16px", borderRadius: 4, border: "1px solid #ddd",
                          background: "#fff", cursor: "pointer", fontSize: "13px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        Próxima →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Entities panel */}
            {(allCandidates.size > 0 || allParties.size > 0 || allInstitutions.size > 0) && (
              <div style={{
                backgroundColor: "#fff",
                border: "1px solid #e5e3df",
                borderRadius: 6,
                padding: "16px",
                marginBottom: 16,
              }}>
                <p style={{
                  fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "#888", marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Em destaque
                </p>

                {allCandidates.size > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <Users size={11} style={{ color: "#1d4ed8" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", fontFamily: "'Inter', sans-serif" }}>
                        Candidatos
                      </span>
                    </div>
                    <div>
                      {Array.from(allCandidates).slice(0, 8).map(c => (
                        <EntityPill key={c} label={c} type="candidate" />
                      ))}
                    </div>
                  </div>
                )}

                {allParties.size > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <Building2 size={11} style={{ color: "#166534" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", fontFamily: "'Inter', sans-serif" }}>
                        Partidos
                      </span>
                    </div>
                    <div>
                      {Array.from(allParties).slice(0, 8).map(p => (
                        <EntityPill key={p} label={p} type="party" />
                      ))}
                    </div>
                  </div>
                )}

                {allInstitutions.size > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <Building2 size={11} style={{ color: "#7c3aed" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", fontFamily: "'Inter', sans-serif" }}>
                        Instituições
                      </span>
                    </div>
                    <div>
                      {Array.from(allInstitutions).slice(0, 6).map(i => (
                        <EntityPill key={i} label={i} type="institution" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coverage stats */}
            <div style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e3df",
              borderRadius: 6,
              padding: "16px",
              marginBottom: 16,
            }}>
              <p style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "#888", marginBottom: 12,
                fontFamily: "'Inter', sans-serif",
              }}>
                Cobertura por espectro
              </p>
              {spectrumStats ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { key: "esquerda", label: "Esquerda", pct: spectrumStats.esquerda },
                    { key: "centro-esquerda", label: "C-Esquerda", pct: spectrumStats["centro-esquerda"] },
                    { key: "centro", label: "Centro", pct: spectrumStats.centro },
                    { key: "centro-direita", label: "C-Direita", pct: spectrumStats["centro-direita"] },
                    { key: "direita", label: "Direita", pct: spectrumStats.direita },
                  ].map(({ key, label, pct }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: "11px", color: "#666", fontFamily: "'Inter', sans-serif",
                        width: 80, flexShrink: 0,
                      }}>
                        {label}
                      </span>
                      <div style={{ flex: 1, height: 6, backgroundColor: "#f0f0f0", borderRadius: 3 }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 3,
                          backgroundColor: SPECTRUM_COLORS[key as keyof typeof SPECTRUM_COLORS] ?? "#ccc",
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      <span style={{
                        fontSize: "11px", color: "#888", fontFamily: "'Inter', sans-serif",
                        width: 28, textAlign: "right",
                      }}>
                        {pct}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#aaa", fontFamily: "'Inter', sans-serif" }}>
                  Aguardando dados...
                </p>
              )}
            </div>

            {/* Link back */}
            <div style={{
              backgroundColor: "#faf7ff",
              border: "1px solid #e4d8fb",
              borderRadius: 6,
              padding: "14px 16px",
            }}>
              <p style={{
                fontSize: "12px", color: "#7c3aed", fontFamily: "'Inter', sans-serif",
                fontWeight: 600, marginBottom: 6,
              }}>
                <TrendingUp size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                Todas as notícias
              </p>
              <Link href="/">
                <span style={{
                  fontSize: "13px", color: "#555", fontFamily: "'Inter', sans-serif",
                  cursor: "pointer", textDecoration: "underline",
                }}>
                  Ver feed completo →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
