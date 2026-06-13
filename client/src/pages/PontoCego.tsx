import { Link } from "wouter";
import { Eye, ArrowLeft, Newspaper } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import SpectrumBar from "@/components/SpectrumBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const SPECTRUM_ORDER = ["direita", "centro-direita", "centro", "centro-esquerda", "esquerda"];

const BLINDSPOT_INFO: Record<string, { label: string; description: string; barColor: string; bgColor: string; textColor: string }> = {
  esquerda: {
    label: "Ponto Cego da Esquerda",
    description: "Notícias cobertas quase exclusivamente por veículos de esquerda. A direita e o centro ignoraram este assunto.",
    barColor: "#c0392b",
    bgColor: "#c0392b",
    textColor: "#ffffff",
  },
  "centro-esquerda": {
    label: "Ponto Cego Centro-Esquerda",
    description: "Notícias cobertas predominantemente por veículos de centro-esquerda.",
    barColor: "#e05c3a",
    bgColor: "#e05c3a",
    textColor: "#ffffff",
  },
  centro: {
    label: "Ponto Cego do Centro",
    description: "Notícias cobertas predominantemente por veículos de centro.",
    barColor: "#888888",
    bgColor: "#888888",
    textColor: "#ffffff",
  },
  "centro-direita": {
    label: "Ponto Cego Centro-Direita",
    description: "Notícias cobertas predominantemente por veículos de centro-direita.",
    barColor: "#2980b9",
    bgColor: "#2980b9",
    textColor: "#ffffff",
  },
  direita: {
    label: "Ponto Cego da Direita",
    description: "Notícias cobertas quase exclusivamente por veículos de direita. A esquerda e o centro ignoraram este assunto.",
    barColor: "#1565c0",
    bgColor: "#1565c0",
    textColor: "#ffffff",
  },
};

export default function PontoCego() {
  useDocumentMeta({
    title: "Ponto Cego",
    description:
      "Notícias cobertas predominantemente por um lado do espectro político e ignoradas pelo outro — os pontos cegos da imprensa brasileira.",
  });
  const { data: blindspotTopics, isLoading } = trpc.topics.blindspot.useQuery({ limit: 30 });

  const grouped = (blindspotTopics || []).reduce(
    (acc, topic) => {
      const key = topic.blindspotSpectrum || "geral";
      if (!acc[key]) acc[key] = [];
      acc[key].push(topic);
      return acc;
    },
    {} as Record<string, typeof blindspotTopics>
  );

  // Sort groups by spectrum order
  const sortedGroups = SPECTRUM_ORDER
    .filter(s => grouped[s] && (grouped[s]?.length ?? 0) > 0)
    .map(s => ({ spectrum: s, topics: grouped[s]! }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px" }}>
        {/* Back */}
        <Link href="/">
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#666", background: "none", border: "none",
            cursor: "pointer", marginBottom: 20, padding: 0,
          }}>
            <ArrowLeft size={14} />
            Voltar ao feed
          </button>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Eye size={18} style={{ color: "#f39c12" }} />
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#f39c12",
              fontFamily: "'Inter', sans-serif",
            }}>
              Ponto Cego <sup style={{ fontSize: 8, verticalAlign: "super" }}>TM</sup>
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 30, fontWeight: 900, color: "#111", marginBottom: 12,
          }}>
            Notícias Ignoradas por Um Lado
          </h1>
          <div style={{
            border: "1px solid #e5e0d8", borderRadius: 4,
            padding: "14px 16px", background: "#fff", maxWidth: 680,
          }}>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>
              O <strong>Ponto Cego</strong> identifica notícias cobertas predominantemente (mais de 70%)
              por apenas um lado do espectro político. Isso pode indicar que parte da mídia está
              ignorando deliberadamente certos assuntos — ou que a cobertura é ideologicamente seletiva.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 80, borderRadius: 4 }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!blindspotTopics || blindspotTopics.length === 0) && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <Newspaper size={40} style={{ color: "#aaa", margin: "0 auto 12px" }} />
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Nenhum ponto cego detectado hoje
            </h3>
            <p style={{ fontSize: 13, color: "#888", maxWidth: 320, margin: "0 auto" }}>
              Ainda não há notícias com cobertura predominantemente unilateral.
            </p>
          </div>
        )}

        {/* Grouped sections */}
        {!isLoading && sortedGroups.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {sortedGroups.map(({ spectrum, topics }) => {
              const info = BLINDSPOT_INFO[spectrum];
              if (!info) return null;

              return (
                <div key={spectrum}>
                  {/* Section header */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: info.bgColor, color: info.textColor,
                        fontSize: 11, fontWeight: 700, padding: "4px 10px",
                        borderRadius: 3, fontFamily: "'Inter', sans-serif",
                        letterSpacing: "0.04em", textTransform: "uppercase",
                      }}>
                        <Eye size={10} />
                        {info.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#888", fontFamily: "'Inter', sans-serif" }}>
                        {topics.length} {topics.length === 1 ? "notícia" : "notícias"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#888", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                      {info.description}
                    </p>
                    <div style={{ height: 2, background: info.barColor, marginTop: 10, borderRadius: 1 }} />
                  </div>

                  {/* Topic list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {topics.map((topic) => {
                      const spectrumData = {
                        leftPct: topic.leftPct,
                        centerLeftPct: topic.centerLeftPct,
                        centerPct: topic.centerPct,
                        centerRightPct: topic.centerRightPct,
                        rightPct: topic.rightPct,
                        totalSources: topic.totalSources,
                      };
                      return (
                        <Link key={topic.id} href={`/topico/${topic.id}`}>
                          <div style={{
                            padding: "14px 0",
                            borderBottom: "1px solid #e5e3df",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#fafaf9")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                                fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase", color: "#f39c12",
                                fontFamily: "'Inter', sans-serif", flexShrink: 0, paddingTop: 2,
                              }}>
                                <Eye size={8} />
                                PONTO CEGO
                              </span>
                              <h4 style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 15, fontWeight: 700, lineHeight: 1.35,
                                color: "#111111", margin: 0,
                              }}>
                                {topic.title}
                              </h4>
                            </div>
                            <SpectrumBar data={spectrumData} size="sm" showCoverage showLabels />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
