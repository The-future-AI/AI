import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Eye, Clock, Newspaper, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import SpectrumBar from "@/components/SpectrumBar";
import type { SpectrumData } from "@/components/SpectrumBar";
import { OutletLogo } from "@/components/OutletLogo";
import {
  SPECTRUM_ORDER,
  SPECTRUM_COLORS,
  SPECTRUM_BG,
  SPECTRUM_LABELS,
  SPECTRUM_LABELS_FULL,
  CATEGORY_LABELS,
} from "@/lib/spectrum";
import { FACTUALITY_RATINGS } from "../../../server/outlets.config";
import { ShareButtons } from "@/components/ShareButtons";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ── Factuality badge (avaliação de terceiros) ──────────────────────────────── */
const FACTUALITY_LABELS: Record<string, string> = {
  "muito-alta": "Fact. muito alta",
  "alta": "Fact. alta",
  "mista": "Fact. mista",
};
const FACTUALITY_STYLE: Record<string, { color: string; bg: string }> = {
  "muito-alta": { color: "#1a7a4a", bg: "#e8f5ee" },
  "alta": { color: "#2563a8", bg: "#e8f1f8" },
  "mista": { color: "#b45309", bg: "#fdf0d8" },
};

function FactualityBadge({ slug }: { slug: string }) {
  const entry = FACTUALITY_RATINGS[slug];
  if (!entry) return null;
  const label = FACTUALITY_LABELS[entry.rating] || entry.rating;
  const style = FACTUALITY_STYLE[entry.rating] || { color: "#666", bg: "#f5f5f5" };
  const abbrev = entry.source === "Media Bias/Fact Check" ? "MBFC" : entry.source;
  return (
    <span
      title={`Avaliação de factualidade segundo: ${entry.source}`}
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: "3px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.color}30`,
        cursor: "help",
        whiteSpace: "nowrap",
      }}
    >
      {label} · {abbrev}
    </span>
  );
}

/* ── 5-box spectrum legend (Ground.news style) ─────────────────────────────── */
function SpectrumLegend({ data, sourcesBySpectrum }: {
  data: SpectrumData;
  sourcesBySpectrum?: Record<string, string[]>;
}) {
  const items = [
    { key: "esquerda", label: "Esquerda", pct: data.leftPct },
    { key: "centro-esquerda", label: "C-Esquerda", pct: data.centerLeftPct },
    { key: "centro", label: "Centro", pct: data.centerPct },
    { key: "centro-direita", label: "C-Direita", pct: data.centerRightPct },
    { key: "direita", label: "Direita", pct: data.rightPct },
  ];

  const maxPct = Math.max(...items.map((i) => i.pct));

  return (
    <div className="spectrum-legend-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginTop: "14px" }}>
      {items.map((item) => {
        const isDominant = item.pct === maxPct && item.pct > 0;
        const sources = sourcesBySpectrum?.[item.key] || [];
        return (
          <div
            key={item.key}
            style={{
              backgroundColor: isDominant ? SPECTRUM_COLORS[item.key] : SPECTRUM_BG[item.key],
              borderRadius: "4px",
              padding: "10px 8px",
              textAlign: "center",
              border: `1px solid ${isDominant ? SPECTRUM_COLORS[item.key] : SPECTRUM_COLORS[item.key] + "30"}`,
            }}
          >
            <div style={{
              fontSize: "22px",
              fontWeight: 900,
              fontFamily: "'Playfair Display', Georgia, serif",
              color: isDominant ? "#ffffff" : SPECTRUM_COLORS[item.key],
              lineHeight: 1,
              marginBottom: "3px",
            }}>
              {Math.round(item.pct)}%
            </div>
            <div style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: isDominant ? "rgba(255,255,255,0.85)" : SPECTRUM_COLORS[item.key],
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: sources.length > 0 ? "5px" : 0,
            }}>
              {item.label}
            </div>
            {sources.length > 0 && (
              <div style={{
                fontSize: "9px",
                color: isDominant ? "rgba(255,255,255,0.75)" : "#888888",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.3,
              }}>
                {sources.slice(0, 3).join(", ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Spectrum badge ─────────────────────────────────────────────────────────── */
function SpectrumBadge({ spectrum }: { spectrum: string }) {
  const color = SPECTRUM_COLORS[spectrum] || "#888";
  const bg = SPECTRUM_BG[spectrum] || "#f5f5f5";
  const label = SPECTRUM_LABELS[spectrum] || spectrum;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: "3px",
      fontSize: "10px",
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color,
      backgroundColor: bg,
      border: `1px solid ${color}40`,
    }}>
      {label}
    </span>
  );
}

/* ── Article source card ────────────────────────────────────────────────────── */
function ArticleCard({ article }: {
  article: {
    id: number;
    title: string;
    summary?: string | null;
    url: string;
    imageUrl?: string | null;
    spectrum?: string | null;
    publishedAt: Date | string;
    outletName?: string | null;
    outletSlug?: string | null;
    outletUrl?: string | null;
  };
}) {
  const publishedAt = article.publishedAt instanceof Date ? article.publishedAt : new Date(article.publishedAt);
  const spectrum = article.spectrum || "centro";
  const borderColor = SPECTRUM_COLORS[spectrum] || "#888";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        gap: "12px",
        padding: "14px 16px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e3df",
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "4px",
        textDecoration: "none",
        transition: "box-shadow 0.15s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Outlet logo + name + spectrum badge + time */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
          {article.outletName && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <OutletLogo
                name={article.outletName}
                siteUrl={article.outletUrl}
                spectrumColor={borderColor}
                size={18}
              />
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#111111",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "'Inter', sans-serif",
              }}>
                {article.outletName}
              </span>
            </span>
          )}
          <SpectrumBadge spectrum={spectrum} />
          {article.outletSlug && <FactualityBadge slug={article.outletSlug} />}
          <span style={{ fontSize: "11px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
            {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: 1.35,
          color: "#111111",
          marginBottom: article.summary ? "5px" : 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {article.title}
        </h4>

        {/* Summary */}
        {article.summary && (
          <p style={{
            fontSize: "13px",
            color: "#666666",
            lineHeight: 1.45,
            fontFamily: "'Inter', sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {article.summary}
          </p>
        )}
      </div>

      {article.imageUrl && (
        <div style={{ flexShrink: 0, width: 80, height: 70, overflow: "hidden", borderRadius: "3px" }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      )}
      <ExternalLink size={13} style={{ color: "#cccccc", flexShrink: 0, alignSelf: "flex-start", marginTop: "3px" }} />
    </a>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function TopicDetail() {
  const params = useParams<{ id: string }>();
  const topicId = parseInt(params.id || "0");
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const { data, isLoading, error } = trpc.topics.byId.useQuery({ id: topicId });

  useDocumentMeta({
    title: data?.topic?.title,
    description: data?.topic?.summary ?? undefined,
    image: data?.topic?.imageUrl,
    type: "article",
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f4f0" }}>
        <Navbar />
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 1.5rem" }}>
          <Skeleton style={{ height: 16, width: 100, marginBottom: 24, borderRadius: 3 }} />
          <Skeleton style={{ height: 32, width: "80%", marginBottom: 10, borderRadius: 3 }} />
          <Skeleton style={{ height: 16, width: "100%", marginBottom: 6, borderRadius: 3 }} />
          <Skeleton style={{ height: 16, width: "70%", marginBottom: 24, borderRadius: 3 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 28 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 80, borderRadius: 4 }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 80, marginBottom: 8, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f4f0" }}>
        <Navbar />
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <AlertCircle size={48} style={{ color: "#cccccc", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "#333" }}>
            Tópico não encontrado
          </h2>
          <Link href="/">
            <button style={{
              marginTop: "16px", padding: "8px 20px",
              border: "1px solid #e5e3df", borderRadius: "4px",
              backgroundColor: "#ffffff", cursor: "pointer",
              fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "#333333",
            }}>
              ← Voltar ao início
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { topic, articles } = data;
  const publishedAt = topic.publishedAt instanceof Date ? topic.publishedAt : new Date(topic.publishedAt);

  const spectrumData: SpectrumData = {
    leftPct: topic.leftPct,
    centerLeftPct: topic.centerLeftPct,
    centerPct: topic.centerPct,
    centerRightPct: topic.centerRightPct,
    rightPct: topic.rightPct,
    totalSources: topic.totalSources,
  };

  // Build sourcesBySpectrum from articles (group outlet names by spectrum)
  const sourcesBySpectrum: Record<string, string[]> = {};
  for (const article of articles) {
    const s = article.spectrum || "centro";
    if (!sourcesBySpectrum[s]) sourcesBySpectrum[s] = [];
    const name = article.outletName || "";
    if (name && !sourcesBySpectrum[s].includes(name)) {
      sourcesBySpectrum[s].push(name);
    }
  }

  // Count per spectrum
  const spectrumCounts: Record<string, number> = {};
  for (const s of SPECTRUM_ORDER) {
    spectrumCounts[s] = articles.filter((a) => a.spectrum === s).length;
  }
  const totalArticles = articles.length;

  // Filter articles
  const filteredArticles = activeFilter === "todos"
    ? articles
    : articles.filter((a) => a.spectrum === activeFilter);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f4f0" }}>
      <Navbar />

      <div className="topic-detail-container" style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Back button */}
        <Link href="/">
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "13px", color: "#888888", backgroundColor: "transparent",
            border: "none", cursor: "pointer", marginBottom: "24px", padding: 0,
            fontFamily: "'Inter', sans-serif", transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888888"; }}
          >
            <ArrowLeft size={14} />
            Voltar ao feed
          </button>
        </Link>

        {/* Topic header */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e3df",
          borderRadius: "6px",
          padding: "clamp(14px, 4vw, 28px)",
          marginBottom: "20px",
        }}>
          {/* Category + blindspot */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
            }}>
              {CATEGORY_LABELS[topic.category] || topic.category}
            </span>
            {topic.isBlindspot && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.05em", color: "#f39c12", fontFamily: "'Inter', sans-serif",
              }}>
                <Eye size={10} />
                Ponto Cego
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: 700, lineHeight: 1.2, color: "#111111", marginBottom: "12px",
          }}>
            {topic.title}
          </h1>

          {/* Summary */}
          {topic.summary && (
            <p style={{
              fontSize: "15px", color: "#555555", lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif", marginBottom: "14px",
            }}>
              {topic.summary}
            </p>
          )}

          {/* Meta info */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            fontSize: "12px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif",
            marginBottom: "20px", flexWrap: "wrap",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Newspaper size={12} />
              {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"} cobrindo esta notícia
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Clock size={12} />
              {format(publishedAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Spectrum bar */}
          <div>
            <p style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
              marginBottom: "10px",
            }}>
              Distribuição por espectro político
            </p>
            <SpectrumBar data={spectrumData} size="lg" showLabels={false} showCoverage={false} />
            <SpectrumLegend data={spectrumData} sourcesBySpectrum={sourcesBySpectrum} />
          </div>

          {/* Share row */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0ede8" }}>
            <ShareButtons title={topic.title} />
          </div>
        </div>

        {/* Blindspot alert */}
        {topic.isBlindspot && topic.blindspotSpectrum && (
          <div style={{
            display: "flex", gap: "12px",
            backgroundColor: "#fffbea", border: "1px solid #f0c040",
            borderRadius: "6px", padding: "14px 18px", marginBottom: "20px",
          }}>
            <Eye size={18} style={{ color: "#d4a017", flexShrink: 0, marginTop: "1px" }} />
            <div>
              <h3 style={{
                fontSize: "13px", fontWeight: 700, color: "#a07000",
                fontFamily: "'Inter', sans-serif", marginBottom: "4px",
              }}>
                Ponto Cego Detectado
              </h3>
              <p style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                Esta notícia foi coberta predominantemente pela{" "}
                <strong style={{ color: "#a07000" }}>
                  {SPECTRUM_LABELS_FULL[topic.blindspotSpectrum]}
                </strong>
                . Veículos de outros espectros políticos deram pouca ou nenhuma atenção a este assunto.
              </p>
            </div>
          </div>
        )}

        {/* Headline comparison section — unique feature vs Ground.news */}
        {articles.length >= 2 && (() => {
          // Build one representative article per spectrum (the first one)
          const headlinesBySpectrum: { spectrum: string; title: string; outletName: string; url: string }[] = [];
          for (const s of SPECTRUM_ORDER) {
            const art = articles.find((a) => a.spectrum === s);
            if (art) {
              headlinesBySpectrum.push({
                spectrum: s,
                title: art.title,
                outletName: art.outletName || "",
                url: art.url,
              });
            }
          }
          if (headlinesBySpectrum.length < 2) return null;
          return (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e3df",
              borderRadius: "6px",
              padding: "clamp(14px, 4vw, 22px)",
              marginBottom: "20px",
            }}>
              <p style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
                marginBottom: "14px",
              }}>
                Como cada lado titulou esta notícia
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(headlinesBySpectrum.length, 3)}, 1fr)`,
                gap: "10px",
              }} className="headline-comparison-grid">
                {headlinesBySpectrum.map((item) => (
                  <a
                    key={item.spectrum}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: "12px 14px",
                      borderTop: `3px solid ${SPECTRUM_COLORS[item.spectrum]}`,
                      backgroundColor: SPECTRUM_BG[item.spectrum],
                      borderRadius: "4px",
                      textDecoration: "none",
                      transition: "box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <div style={{
                      fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.06em", color: SPECTRUM_COLORS[item.spectrum],
                      fontFamily: "'Inter', sans-serif", marginBottom: "6px",
                    }}>
                      {SPECTRUM_LABELS_FULL[item.spectrum]}
                      {item.outletName && (
                        <span style={{ fontWeight: 400, color: "#999", marginLeft: "6px", textTransform: "none", letterSpacing: 0 }}>
                          · {item.outletName}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: "13px", fontWeight: 600, color: "#111111",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      lineHeight: 1.4, margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {item.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Articles section */}
        <div>
          {/* Section header + filter tabs — Ground.news style */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "10px", marginBottom: "14px",
          }}>
            <p style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
            }}>
              Cobertura por veículo
            </p>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {/* "Todos" tab */}
              <button
                onClick={() => setActiveFilter("todos")}
                style={{
                  padding: "5px 10px", borderRadius: "3px", cursor: "pointer",
                  fontSize: "11px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  border: activeFilter === "todos" ? "1px solid #333" : "1px solid #e5e3df",
                  backgroundColor: activeFilter === "todos" ? "#111111" : "#ffffff",
                  color: activeFilter === "todos" ? "#ffffff" : "#888888",
                  transition: "all 0.15s ease",
                }}
              >
                Todos ({totalArticles})
              </button>

              {/* Spectrum filter tabs */}
              {SPECTRUM_ORDER.map((s) => {
                const count = spectrumCounts[s] || 0;
                if (count === 0) return null;
                const isActive = activeFilter === s;
                const color = SPECTRUM_COLORS[s];
                return (
                  <button
                    key={s}
                    onClick={() => setActiveFilter(s)}
                    style={{
                      padding: "5px 10px", borderRadius: "3px", cursor: "pointer",
                      fontSize: "11px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      border: isActive ? `1px solid ${color}` : "1px solid #e5e3df",
                      backgroundColor: isActive ? color : "#ffffff",
                      color: isActive ? "#ffffff" : color,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {SPECTRUM_LABELS[s]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#aaaaaa" }}>
              <Newspaper size={36} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                Nenhum artigo encontrado para este filtro.
              </p>
            </div>
          )}
        </div>

        {/* Newsletter banner */}
        <div style={{ marginTop: "28px" }}>
          <NewsletterSignup source="topic-detail" variant="banner" />
        </div>
      </div>
    </div>
  );
}
