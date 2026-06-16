import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Calendar, Building2, Rss, AlertCircle, Newspaper } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { OutletLogo } from "@/components/OutletLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SPECTRUM_COLORS, SPECTRUM_BG, SPECTRUM_LABELS_FULL, SPECTRUM_ORDER, CATEGORY_LABELS } from "@/lib/spectrum";
import { OUTLETS } from "../../../server/outlets.config";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
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

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
      marginBottom: "14px", margin: "0 0 14px 0",
    }}>
      {label}
    </p>
  );
}

function SpectrumPill({ spectrum }: { spectrum: string }) {
  const color = SPECTRUM_COLORS[spectrum] || "#888";
  const bg = SPECTRUM_BG[spectrum] || "#f5f5f5";
  const label = SPECTRUM_LABELS_FULL[spectrum] || spectrum;
  return (
    <span style={{
      display: "inline-block", padding: "5px 14px",
      borderRadius: "20px", fontSize: "13px", fontWeight: 700,
      fontFamily: "'Inter', sans-serif", color,
      backgroundColor: bg, border: `1px solid ${color}40`,
    }}>
      {label}
    </span>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function OutletProfile() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  // First try to get static data from config (always available)
  const staticOutlet = OUTLETS.find((o) => o.slug === slug);

  // Then try DB data (may not be seeded yet)
  const { data, isLoading } = trpc.outlets.bySlug.useQuery({ slug }, { enabled: !!slug });

  useDocumentMeta({
    title: staticOutlet?.name ? `${staticOutlet.name} — Contextual News` : undefined,
    description: staticOutlet?.description,
  });

  const outletName = data?.outlet?.name || staticOutlet?.name || slug;
  const spectrum = data?.outlet?.spectrum || staticOutlet?.spectrum || "centro";
  const spectrumColor = SPECTRUM_COLORS[spectrum] || "#888";

  if (!staticOutlet && !isLoading && !data) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
        <Navbar />
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <AlertCircle size={48} style={{ color: "#cccccc", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "#333" }}>
            Veículo não encontrado
          </h2>
          <Link href="/metodologia">
            <button style={{
              marginTop: "16px", padding: "8px 20px",
              border: "1px solid #e5e3df", borderRadius: "4px",
              backgroundColor: "#ffffff", cursor: "pointer",
              fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "#333333",
            }}>
              ← Ver todos os veículos
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const recentArticles = data?.recentArticles || [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f2" }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 1.5rem 60px" }}>

        {/* Back */}
        <Link href="/metodologia">
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
            Ver todos os veículos
          </button>
        </Link>

        {/* ── Header card ── */}
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
            {/* Logo */}
            <div style={{
              width: 72, height: 72, borderRadius: "12px",
              border: `2px solid ${spectrumColor}30`,
              overflow: "hidden", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: SPECTRUM_BG[spectrum],
            }}>
              <OutletLogo
                name={outletName}
                siteUrl={staticOutlet?.url || data?.outlet?.url}
                spectrumColor={spectrumColor}
                size={56}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(22px, 5vw, 30px)",
                fontWeight: 700, lineHeight: 1.2, color: "#111111", marginBottom: "8px",
              }}>
                {outletName}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                <SpectrumPill spectrum={spectrum} />
                {staticOutlet?.url && (
                  <a
                    href={staticOutlet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: "12px", color: "#888888", textDecoration: "none",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888888"; }}
                  >
                    <ExternalLink size={12} />
                    {staticOutlet.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>

              {staticOutlet?.description && (
                <p style={{
                  fontSize: "15px", color: "#444444", lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif", margin: 0,
                }}>
                  {staticOutlet.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ── Metadata grid ── */}
        <Card>
          <SectionLabel label="Sobre o veículo" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            {staticOutlet?.foundedYear && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Calendar size={16} style={{ color: "#888888", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaaaaa", fontFamily: "'Inter', sans-serif", marginBottom: "2px" }}>
                    Fundado em
                  </div>
                  <div style={{ fontSize: "14px", color: "#222222", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    {staticOutlet.foundedYear}
                  </div>
                </div>
              </div>
            )}

            {staticOutlet?.ownership && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Building2 size={16} style={{ color: "#888888", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaaaaa", fontFamily: "'Inter', sans-serif", marginBottom: "2px" }}>
                    Propriedade
                  </div>
                  <div style={{ fontSize: "14px", color: "#222222", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    {staticOutlet.ownership}
                  </div>
                </div>
              </div>
            )}

            {staticOutlet?.feeds && staticOutlet.feeds.length > 0 && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Rss size={16} style={{ color: "#888888", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaaaaa", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
                    Feeds RSS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {staticOutlet.feeds.map((feed, i) => (
                      <a
                        key={i}
                        href={feed}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif",
                          textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888888"; }}
                      >
                        <ExternalLink size={10} />
                        Feed {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Spectrum context ── */}
        <Card>
          <SectionLabel label="Posicionamento editorial" />
          <div style={{
            padding: "16px",
            borderLeft: `4px solid ${spectrumColor}`,
            backgroundColor: SPECTRUM_BG[spectrum],
            borderRadius: "0 4px 4px 0",
          }}>
            <div style={{
              fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color: spectrumColor, fontFamily: "'Inter', sans-serif",
              marginBottom: "8px",
            }}>
              {SPECTRUM_LABELS_FULL[spectrum]}
            </div>
            <p style={{
              fontSize: "13px", color: "#555555", lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif", margin: 0,
            }}>
              Esta classificação é baseada em análises de terceiros (Manchetômetro, Media Bias/Fact Check,
              Reuters Institute) e é revisada periodicamente. Trata-se de uma simplificação analítica — leia
              nossa <Link href="/metodologia" style={{ color: spectrumColor, textDecoration: "underline" }}>Metodologia</Link> para entender os critérios.
            </p>
          </div>
          {staticOutlet?.factuality && staticOutlet?.factualitySource && (
            <div style={{
              marginTop: "12px", padding: "12px 14px",
              backgroundColor: "#f8f8f8", borderRadius: "4px",
              border: "1px solid #eeeeee",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaaaaa", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
                Avaliação de factualidade (terceiros)
              </div>
              <div style={{ fontSize: "13px", color: "#444444", fontFamily: "'Inter', sans-serif" }}>
                <strong>{staticOutlet.factuality === "muito-alta" ? "Muito Alta" : staticOutlet.factuality === "alta" ? "Alta" : "Mista"}</strong>
                {" "}segundo {staticOutlet.factualitySource}
              </div>
            </div>
          )}
        </Card>

        {/* ── Recent articles ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Newspaper size={14} style={{ color: "#888888" }} />
            <p style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#888888", fontFamily: "'Inter', sans-serif",
              margin: 0,
            }}>
              Artigos recentes indexados
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} style={{ height: 80, borderRadius: 4 }} />
              ))}
            </div>
          ) : recentArticles.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              backgroundColor: "#ffffff", border: "1px solid #e5e3df",
              borderRadius: "6px", color: "#aaaaaa",
            }}>
              <Newspaper size={36} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
                Nenhum artigo indexado ainda para este veículo.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentArticles.map((article) => {
                const artSpectrum = article.spectrum || spectrum;
                const artColor = SPECTRUM_COLORS[artSpectrum] || "#888";
                const publishedAt = article.publishedAt instanceof Date ? article.publishedAt : new Date(article.publishedAt);
                return (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", gap: "12px", padding: "14px 16px",
                      backgroundColor: "#ffffff", border: "1px solid #e5e3df",
                      borderLeft: `4px solid ${artColor}`, borderRadius: "4px",
                      textDecoration: "none", transition: "box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                        {article.category && (
                          <span style={{
                            fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.05em", color: "#888888", fontFamily: "'Inter', sans-serif",
                          }}>
                            {CATEGORY_LABELS[article.category] || article.category}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "#aaaaaa", fontFamily: "'Inter', sans-serif" }}>
                          {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
                        </span>
                        {article.topicId && (
                          <Link
                            href={`/topico/${article.topicId}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: "11px", color: artColor, fontFamily: "'Inter', sans-serif",
                              textDecoration: "underline", fontWeight: 600,
                            }}
                          >
                            Ver análise
                          </Link>
                        )}
                      </div>
                      <h4 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "15px", fontWeight: 700, lineHeight: 1.35, color: "#111111",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        margin: 0,
                      }}>
                        {article.title}
                      </h4>
                    </div>
                    <ExternalLink size={13} style={{ color: "#cccccc", flexShrink: 0, alignSelf: "flex-start", marginTop: "3px" }} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <div style={{
          marginTop: "28px", padding: "14px 18px",
          backgroundColor: "#fffbea", border: "1px solid #f0c040",
          borderRadius: "6px",
        }}>
          <p style={{ fontSize: "12px", color: "#888888", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#a07000" }}>Nota de transparência:</strong>{" "}
            As classificações de espectro político são baseadas em análises externas e revisadas periodicamente.
            Não representam julgamento de valor sobre a qualidade do jornalismo. Leia nossa{" "}
            <Link href="/metodologia" style={{ color: "#a07000" }}>Metodologia</Link> para mais detalhes.
          </p>
        </div>
      </div>
    </div>
  );
}
