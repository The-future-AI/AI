import { useState } from "react";
import { Eye, Newspaper, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { TopicCard } from "@/components/TopicCard";
import type { TopicCardTopic } from "@/components/TopicCard";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { getDominantSpectrum } from "@/components/SpectrumBar";
import type { SpectrumData } from "@/components/SpectrumBar";
import { OutletLogo } from "@/components/OutletLogo";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SPECTRUM_COLORS, SPECTRUM_LABELS } from "@/lib/spectrum";
import { OUTLETS } from "../../../server/outlets.config";

/* ── Skeletons ────────────────────────────────────────────────────────────── */
function TopStorySkeleton() {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #e5e3df" }}>
      <Skeleton style={{ height: 13, width: "100%", marginBottom: 4, borderRadius: 2 }} />
      <Skeleton style={{ height: 13, width: "80%", marginBottom: 8, borderRadius: 2 }} />
      <Skeleton style={{ height: 5, width: "100%", borderRadius: 2 }} />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid #e5e3df" }}>
      <div style={{ flex: 1 }}>
        <Skeleton style={{ height: 10, width: 60, marginBottom: 8, borderRadius: 2 }} />
        <Skeleton style={{ height: 14, width: "100%", marginBottom: 4, borderRadius: 2 }} />
        <Skeleton style={{ height: 14, width: "85%", marginBottom: 10, borderRadius: 2 }} />
        <Skeleton style={{ height: 6, width: "100%", borderRadius: 2 }} />
      </div>
      <Skeleton style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 3 }} />
    </div>
  );
}

type Topic = TopicCardTopic;

/* ── Blindspot sidebar item ──────────────────────────────────────────────── */
function BlindspotItem({ topic }: { topic: Topic }) {
  const sd: SpectrumData = {
    leftPct: topic.leftPct,
    centerLeftPct: topic.centerLeftPct,
    centerPct: topic.centerPct,
    centerRightPct: topic.centerRightPct,
    rightPct: topic.rightPct,
    totalSources: topic.totalSources,
  };
  const dominant = getDominantSpectrum(sd);
  const sourcesBySpectrum = topic.sourcesBySpectrum || {};
  return (
    <Link href={`/topico/${topic.id}`}>
      <div
        style={{
          padding: "11px 16px",
          borderBottom: "1px solid #f0ede8",
          cursor: "pointer",
          transition: "background 0.1s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: dominant.color, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", color: dominant.color,
            fontFamily: "'Inter', sans-serif",
          }}>
            {dominant.label} {Math.round(dominant.pct)}%
          </span>
          <span style={{ fontSize: 10, color: "#bbb", fontFamily: "'Inter', sans-serif", marginLeft: "auto" }}>
            {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"}
          </span>
        </div>
        <p style={{
          fontSize: "12.5px",
          fontWeight: 600,
          color: "#111111",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.35,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {topic.title}
        </p>
      </div>
    </Link>
  );
}

/* ── Sidebar component (extracted for reuse) ─────────────────────────────── */
function Sidebar({ blindspotTopics }: { blindspotTopics: Topic[] | undefined }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* PONTO CEGO widget */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e3df",
        borderRadius: "4px",
        overflow: "hidden",
      }}>
        <div style={{
          backgroundColor: "#1a1a1a",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Eye size={13} color="#ffffff" />
            <span style={{
              color: "#ffffff", fontWeight: 700, fontSize: "11px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
            }}>
              Ponto Cego
            </span>
          </div>
          <Link href="/ponto-cego">
            <span style={{
              fontSize: "11px", color: "rgba(255,255,255,0.5)",
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
            }}>
              Ver todos →
            </span>
          </Link>
        </div>

        <div style={{
          backgroundColor: "#fafaf8",
          padding: "9px 16px",
          borderBottom: "1px solid #e5e3df",
        }}>
          <p style={{
            fontSize: "11.5px", color: "#666666", lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif", margin: 0,
          }}>
            Notícias cobertas predominantemente por um lado do espectro político, ignoradas pelo outro.
          </p>
        </div>

        <div>
          {blindspotTopics && blindspotTopics.length > 0 ? (
            blindspotTopics.map((t) => <BlindspotItem key={t.id} topic={t} />)
          ) : (
            <div style={{ padding: "20px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
                Nenhum ponto cego detectado hoje.
              </p>
            </div>
          )}
        </div>

        <Link href="/ponto-cego">
          <div style={{
            backgroundColor: "#1a1a1a", padding: "10px 16px",
            textAlign: "center", cursor: "pointer",
            transition: "background 0.1s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#333")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1a1a1a")}
          >
            <span style={{
              color: "#ffffff", fontSize: "12px", fontWeight: 600,
              fontFamily: "'Inter', sans-serif", letterSpacing: "0.02em",
            }}>
              Ver Feed Ponto Cego →
            </span>
          </div>
        </Link>
      </div>

      {/* Espectro político legend */}
      <div style={{
        backgroundColor: "#ffffff", border: "1px solid #e5e3df",
        borderRadius: "4px", overflow: "hidden",
      }}>
        <div style={{
          backgroundColor: "#fafaf8", padding: "9px 16px",
          borderBottom: "1px solid #e5e3df",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
          }}>
            Espectro Político
          </span>
        </div>
        <div style={{ padding: "12px 16px" }}>
          {[
            { label: "Esquerda", color: "#c0392b", example: "Brasil de Fato, Carta Capital" },
            { label: "Centro-Esquerda", color: "#e05c3a", example: "Folha, O Globo, Ag. Pública" },
            { label: "Centro", color: "#888888", example: "G1, UOL" },
            { label: "Centro-Direita", color: "#2980b9", example: "Estadão, Veja" },
            { label: "Direita", color: "#1565c0", example: "R7, Jovem Pan" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "flex-start",
              gap: "10px", marginBottom: "10px",
            }}>
              <div style={{
                width: "9px", height: "9px", borderRadius: "50%",
                backgroundColor: item.color, flexShrink: 0, marginTop: "3px",
              }} />
              <div>
                <div style={{
                  fontSize: "12px", fontWeight: 600, color: item.color,
                  fontFamily: "'Inter', sans-serif", marginBottom: "1px",
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "11px", color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                  {item.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mídias monitoradas */}
      <div style={{
        backgroundColor: "#ffffff", border: "1px solid #e5e3df",
        borderRadius: "4px", overflow: "hidden",
      }}>
        <div style={{
          backgroundColor: "#fafaf8", padding: "9px 16px",
          borderBottom: "1px solid #e5e3df",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
          }}>
            Mídias Monitoradas
          </span>
        </div>
        <div style={{ padding: "10px 16px" }}>
          {OUTLETS.map((m) => (
            <div key={m.name} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "7px", gap: "8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                <OutletLogo
                  name={m.name}
                  siteUrl={m.url}
                  spectrumColor={SPECTRUM_COLORS[m.spectrum] || "#888"}
                  size={16}
                />
                <span style={{
                  fontSize: "12px", color: "#333333", fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {m.name}
                </span>
              </div>
              <span style={{
                fontSize: "10px",
                color: SPECTRUM_COLORS[m.spectrum] || "#888",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {SPECTRUM_LABELS[m.spectrum]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Home() {
  useDocumentMeta({});
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 30;

  const { data: topicsData, isLoading, refetch, isFetching } = trpc.topics.list.useQuery({
    category: activeCategory === "todos" ? undefined : activeCategory,
    limit: LIMIT,
    offset: page * LIMIT,
    search: searchQuery || undefined,
  });

  const { data: blindspotTopics } = trpc.topics.blindspot.useQuery({ limit: 8 });

  const topics = topicsData?.items || [];
  const totalTopics = topicsData?.total || 0;
  const hasMore = (page + 1) * LIMIT < totalTopics;

  const featuredTopic = topics[0] ?? null;
  const topStories = topics.slice(1, 8);
  const gridTopics = topics.slice(8);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(0);
    setSearchQuery("");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f4f0" }}>
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSearch={(q) => { setSearchQuery(q); setPage(0); }}
        searchQuery={searchQuery}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0 14px",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(18px, 4vw, 26px)",
              fontWeight: 700,
              color: "#111111",
              lineHeight: 1.2,
              marginBottom: "2px",
            }}>
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : activeCategory === "todos"
                ? "Notícias do Brasil"
                : ({ politica: "Política", economia: "Economia", internacional: "Internacional", esporte: "Esporte", tecnologia: "Tecnologia" } as Record<string, string>)[activeCategory] || activeCategory}
            </h1>
            <p style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
              {isLoading ? "Carregando..." : `${totalTopics} tópicos · Atualizado a cada hora`}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", fontFamily: "'Inter', sans-serif",
              color: "#555555", backgroundColor: "#ffffff",
              border: "1px solid #e5e3df", borderRadius: "4px",
              padding: "7px 12px", cursor: isFetching ? "not-allowed" : "pointer",
              opacity: isFetching ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            <RefreshCw size={13} style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
            Atualizar
          </button>
        </div>

        {/* ── Responsive 2-column layout: main + sidebar ──────────────────── */}
        <div style={{
          display: "grid",

          gap: "24px",
          alignItems: "start",
        }}
        className="home-grid"
        >

          {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
          <div>
            {/* Featured card */}
            {isLoading ? (
              <div style={{ borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
                <Skeleton style={{ height: 220, width: "100%", borderRadius: 4, marginBottom: 12 }} />
                <Skeleton style={{ height: 10, width: 80, marginBottom: 8, borderRadius: 2 }} />
                <Skeleton style={{ height: 22, width: "100%", marginBottom: 4, borderRadius: 2 }} />
                <Skeleton style={{ height: 22, width: "75%", marginBottom: 12, borderRadius: 2 }} />
                <Skeleton style={{ height: 7, width: "100%", borderRadius: 2 }} />
              </div>
            ) : featuredTopic ? (
              <TopicCard topic={featuredTopic} variant="featured" />
            ) : null}

            {/* Top stories row */}
            {!isLoading && topStories.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e3df",
                borderRadius: "4px",
                marginBottom: "20px",
                overflow: "hidden",
              }}>
                {topStories.map((t, i) => (
                  <div key={t.id} style={{
                    padding: "12px 14px",
                    borderRight: i < topStories.length - 1 ? "1px solid #e5e3df" : "none",
                    borderBottom: 0,
                  }}>
                    <TopicCard topic={t} variant="top-story" />
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                backgroundColor: "#ffffff", border: "1px solid #e5e3df",
                borderRadius: "4px", marginBottom: "20px", overflow: "hidden",
              }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid #e5e3df" : "none" }}>
                    <TopStorySkeleton />
                  </div>
                ))}
              </div>
            )}

            {/* Section divider */}
            {!isLoading && gridTopics.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "#888888",
                  fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                }}>
                  Mais notícias
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e3df" }} />
              </div>
            )}

            {/* Grid of remaining topics */}
            <div style={{
              backgroundColor: "#ffffff", border: "1px solid #e5e3df",
              borderRadius: "4px", overflow: "hidden",
            }}>
              {isLoading ? (
                <div style={{ padding: "0 16px" }}>
                  {Array.from({ length: 6 }).map((_, i) => <GridSkeleton key={i} />)}
                </div>
              ) : gridTopics.length === 0 && topics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <Newspaper size={36} style={{ color: "#cccccc", margin: "0 auto 12px" }} />
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "#333",
                  }}>
                    Nenhuma notícia encontrada
                  </h3>
                  <p style={{ fontSize: "13px", color: "#888888", maxWidth: "300px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
                    O scraping automático roda a cada hora. Aguarde ou clique em Atualizar.
                  </p>
                </div>
              ) : (
                gridTopics.map((t, i) => (
                  <div key={t.id} style={{
                    padding: "0 16px",
                    borderBottom: i < gridTopics.length - 1 ? "1px solid #f0ede8" : "none",
                  }}>
                    <TopicCard topic={t} variant="grid" />
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && topics.length > 0 && (
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: "16px", marginBottom: "8px",
              }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    fontSize: "12px", padding: "7px 14px",
                    border: "1px solid #e5e3df", borderRadius: "4px",
                    backgroundColor: page === 0 ? "#f5f4f0" : "#ffffff",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    color: page === 0 ? "#aaaaaa" : "#333333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
                  Pág. {page + 1} · {totalTopics} tópicos
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  style={{
                    fontSize: "12px", padding: "7px 14px",
                    border: "1px solid #e5e3df", borderRadius: "4px",
                    backgroundColor: !hasMore ? "#f5f4f0" : "#ffffff",
                    cursor: !hasMore ? "not-allowed" : "pointer",
                    color: !hasMore ? "#aaaaaa" : "#333333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (desktop) ──────────────────────────────────── */}
          <div
            className="home-sidebar"
            style={{ position: "sticky", top: "16px" }}
          >
            <Sidebar blindspotTopics={blindspotTopics} />
          </div>
        </div>

        {/* ── MOBILE SIDEBAR (below feed on small screens) ─────────────── */}
        <div className="home-sidebar-mobile" style={{ display: "none", paddingBottom: "32px" }}>
          <div style={{ height: "1px", backgroundColor: "#e5e3df", margin: "16px 0" }} />
          <Sidebar blindspotTopics={blindspotTopics} />
        </div>

      </div>
    </div>
  );
}
