import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { Search, X, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import SpectrumBar from "@/components/SpectrumBar";
import type { SpectrumData } from "@/components/SpectrumBar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SPECTRUM_ORDER = ["esquerda", "centro-esquerda", "centro", "centro-direita", "direita"];
const SPECTRUM_LABELS: Record<string, string> = {
  esquerda: "Esquerda",
  "centro-esquerda": "C-Esquerda",
  centro: "Centro",
  "centro-direita": "C-Direita",
  direita: "Direita",
};
const SPECTRUM_COLORS: Record<string, string> = {
  esquerda: "#c0392b",
  "centro-esquerda": "#e05c3a",
  centro: "#888888",
  "centro-direita": "#2980b9",
  direita: "#1565c0",
};
const SPECTRUM_BG: Record<string, string> = {
  esquerda: "#fdf0ee",
  "centro-esquerda": "#fef3ef",
  centro: "#f5f5f5",
  "centro-direita": "#e8f4fd",
  direita: "#e3f0ff",
};

const CATEGORY_LABELS: Record<string, string> = {
  politica: "Política",
  economia: "Economia",
  internacional: "Internacional",
  esporte: "Esporte",
  tecnologia: "Tecnologia",
  geral: "Geral",
};

function getDominantSpectrum(topic: {
  leftPct: number; centerLeftPct: number; centerPct: number;
  centerRightPct: number; rightPct: number;
}) {
  const items = [
    { key: "esquerda", pct: topic.leftPct },
    { key: "centro-esquerda", pct: topic.centerLeftPct },
    { key: "centro", pct: topic.centerPct },
    { key: "centro-direita", pct: topic.centerRightPct },
    { key: "direita", pct: topic.rightPct },
  ];
  return items.reduce((a, b) => (a.pct >= b.pct ? a : b));
}

export default function Busca() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(searchString);
  const initialQuery = params.get("q") || "";
  const initialSpectrum = params.get("espectro") || "todos";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeSpectrum, setActiveSpectrum] = useState(initialSpectrum);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  // Update URL when filters change
  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (activeSpectrum !== "todos") p.set("espectro", activeSpectrum);
    const newSearch = p.toString();
    navigate(`/busca${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  }, [query, activeSpectrum]);

  const { data: topicsData, isLoading } = trpc.topics.list.useQuery({
    search: query || undefined,
    limit: LIMIT,
    offset: page * LIMIT,
  }, {
    enabled: query.length >= 2 || query.length === 0,
  });

  const allTopics = topicsData?.items || [];
  const totalTopics = topicsData?.total || 0;

  // Filter by spectrum client-side (since backend doesn't support spectrum filter yet)
  const filteredTopics = activeSpectrum === "todos"
    ? allTopics
    : allTopics.filter((t) => {
        const dom = getDominantSpectrum(t);
        return dom.key === activeSpectrum;
      });

  const hasMore = (page + 1) * LIMIT < totalTopics;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue.trim());
    setPage(0);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Search header */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "20px 24px",
          marginBottom: "16px",
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px", fontWeight: 700, color: "#111111",
            marginBottom: "14px",
          }}>
            Buscar Notícias
          </h1>

          {/* Search input */}
          <form onSubmit={handleSearch} style={{ marginBottom: "16px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              border: "1.5px solid #e5e3df", borderRadius: "6px",
              padding: "10px 14px", backgroundColor: "#fafafa",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e3df"; }}
            >
              <Search size={16} style={{ color: "#888888", flexShrink: 0 }} />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Buscar por assunto, pessoa, evento..."
                autoFocus
                style={{
                  flex: 1, border: "none", outline: "none",
                  fontSize: "15px", fontFamily: "'Inter', sans-serif",
                  color: "#111111", backgroundColor: "transparent",
                }}
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(""); setQuery(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}>
                  <X size={15} />
                </button>
              )}
              <button type="submit" style={{
                padding: "6px 14px", borderRadius: "4px",
                backgroundColor: "#111111", color: "#ffffff",
                border: "none", cursor: "pointer",
                fontSize: "13px", fontFamily: "'Inter', sans-serif",
                fontWeight: 600, flexShrink: 0,
              }}>
                Buscar
              </button>
            </div>
          </form>

          {/* Spectrum filter */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px",
            }}>
              <Filter size={12} style={{ color: "#888888" }} />
              <span style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.06em", color: "#888888", fontFamily: "'Inter', sans-serif",
              }}>
                Filtrar por espectro político
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={() => { setActiveSpectrum("todos"); setPage(0); }}
                style={{
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  border: activeSpectrum === "todos" ? "1.5px solid #111" : "1.5px solid #e5e3df",
                  backgroundColor: activeSpectrum === "todos" ? "#111111" : "#ffffff",
                  color: activeSpectrum === "todos" ? "#ffffff" : "#555555",
                  transition: "all 0.15s ease",
                }}
              >
                Todos
              </button>
              {SPECTRUM_ORDER.map((s) => {
                const isActive = activeSpectrum === s;
                return (
                  <button
                    key={s}
                    onClick={() => { setActiveSpectrum(s); setPage(0); }}
                    style={{
                      padding: "6px 12px", borderRadius: "4px", cursor: "pointer",
                      fontSize: "12px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      border: isActive ? `1.5px solid ${SPECTRUM_COLORS[s]}` : "1.5px solid #e5e3df",
                      backgroundColor: isActive ? SPECTRUM_COLORS[s] : "#ffffff",
                      color: isActive ? "#ffffff" : SPECTRUM_COLORS[s],
                      transition: "all 0.15s ease",
                    }}
                  >
                    {SPECTRUM_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {query.length >= 2 || query.length === 0 ? (
          <>
            {/* Results header */}
            {!isLoading && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "12px",
              }}>
                <p style={{
                  fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif",
                }}>
                  {query
                    ? `${filteredTopics.length} resultado${filteredTopics.length !== 1 ? "s" : ""} para "${query}"${activeSpectrum !== "todos" ? ` · ${SPECTRUM_LABELS[activeSpectrum]}` : ""}`
                    : `${filteredTopics.length} tópico${filteredTopics.length !== 1 ? "s" : ""}${activeSpectrum !== "todos" ? ` · ${SPECTRUM_LABELS[activeSpectrum]}` : ""}`}
                </p>
              </div>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    backgroundColor: "#ffffff", border: "1px solid #e5e3df",
                    borderRadius: "6px", padding: "16px 20px",
                  }}>
                    <Skeleton style={{ height: 10, width: 80, marginBottom: 8, borderRadius: 2 }} />
                    <Skeleton style={{ height: 18, width: "80%", marginBottom: 6, borderRadius: 2 }} />
                    <Skeleton style={{ height: 7, width: "100%", borderRadius: 2 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Results list */}
            {!isLoading && filteredTopics.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredTopics.map((topic) => {
                  const sd: SpectrumData = {
                    leftPct: topic.leftPct,
                    centerLeftPct: topic.centerLeftPct,
                    centerPct: topic.centerPct,
                    centerRightPct: topic.centerRightPct,
                    rightPct: topic.rightPct,
                    totalSources: topic.totalSources,
                  };
                  const dom = getDominantSpectrum(topic);
                  const publishedAt = topic.publishedAt instanceof Date
                    ? topic.publishedAt : new Date(topic.publishedAt);

                  return (
                    <Link key={topic.id} href={`/topico/${topic.id}`}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e3df",
                        borderLeft: `4px solid ${SPECTRUM_COLORS[dom.key] || "#888"}`,
                        borderRadius: "6px",
                        padding: "14px 18px",
                        cursor: "pointer",
                        transition: "box-shadow 0.15s ease",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                      >
                        {/* Meta */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          marginBottom: "6px", flexWrap: "wrap",
                        }}>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 8px", borderRadius: "3px",
                            fontSize: "10px", fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            color: SPECTRUM_COLORS[dom.key],
                            backgroundColor: SPECTRUM_BG[dom.key],
                            border: `1px solid ${SPECTRUM_COLORS[dom.key]}40`,
                          }}>
                            {SPECTRUM_LABELS[dom.key]}
                          </span>
                          {topic.category && (
                            <span style={{
                              fontSize: "11px", color: "#888888",
                              fontFamily: "'Inter', sans-serif",
                            }}>
                              {CATEGORY_LABELS[topic.category] || topic.category}
                            </span>
                          )}
                          <span style={{
                            fontSize: "11px", color: "#aaaaaa",
                            fontFamily: "'Inter', sans-serif", marginLeft: "auto",
                          }}>
                            {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "16px", fontWeight: 700, lineHeight: 1.3,
                          color: "#111111", marginBottom: "10px",
                        }}>
                          {topic.title}
                        </h3>

                        {/* Spectrum bar */}
                        <SpectrumBar data={sd} size="sm" showLabels={false} showCoverage={false} />

                        {/* Sources count */}
                        <p style={{
                          fontSize: "11px", color: "#aaaaaa",
                          fontFamily: "'Inter', sans-serif", marginTop: "6px",
                        }}>
                          {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"} cobrindo esta notícia
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredTopics.length === 0 && (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                backgroundColor: "#ffffff", border: "1px solid #e5e3df",
                borderRadius: "6px",
              }}>
                <Search size={36} style={{ color: "#cccccc", margin: "0 auto 12px" }} />
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#333",
                }}>
                  {query ? "Nenhum resultado encontrado" : "Digite algo para buscar"}
                </h3>
                <p style={{
                  fontSize: "13px", color: "#888888",
                  maxWidth: "300px", margin: "0 auto",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {query
                    ? `Tente outros termos ou remova o filtro de espectro.`
                    : "Busque por assunto, pessoa, evento ou tema político."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredTopics.length > 0 && (
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: "16px",
              }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    fontSize: "12px", padding: "7px 14px",
                    border: "1px solid #e5e3df", borderRadius: "4px",
                    backgroundColor: page === 0 ? "#f5f5f5" : "#ffffff",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    color: page === 0 ? "#aaaaaa" : "#333333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
                  Pág. {page + 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  style={{
                    fontSize: "12px", padding: "7px 14px",
                    border: "1px solid #e5e3df", borderRadius: "4px",
                    backgroundColor: !hasMore ? "#f5f5f5" : "#ffffff",
                    cursor: !hasMore ? "not-allowed" : "pointer",
                    color: !hasMore ? "#aaaaaa" : "#333333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            backgroundColor: "#ffffff", border: "1px solid #e5e3df",
            borderRadius: "6px",
          }}>
            <p style={{ fontSize: "13px", color: "#888888", fontFamily: "'Inter', sans-serif" }}>
              Digite pelo menos 2 caracteres para buscar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
