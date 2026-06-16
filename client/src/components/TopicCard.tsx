import { Link } from "wouter";
import { Eye } from "lucide-react";
import SpectrumBar, { getDominantSpectrum } from "./SpectrumBar";
import type { SpectrumData } from "./SpectrumBar";
import { OutletLogo } from "./OutletLogo";
import {
  SPECTRUM_ORDER,
  SPECTRUM_COLORS,
  SPECTRUM_LABELS,
  SPECTRUM_ABBR,
  SPECTRUM_BG,
  CATEGORY_LABELS,
} from "@/lib/spectrum";

import { OUTLETS } from "../../../server/outlets.config";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Lookup nome do veículo → site, para exibir o logo nas fontes.
const OUTLET_URL_BY_NAME: Record<string, string> = Object.fromEntries(
  OUTLETS.map((o) => [o.name, o.url]),
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TopicCardTopic {
  id: number;
  title: string;
  summary?: string | null;
  category: string;
  totalSources: number;
  leftPct: number;
  centerLeftPct: number;
  centerPct: number;
  centerRightPct: number;
  rightPct: number;
  isBlindspot?: boolean | null;
  blindspotSpectrum?: string | null;
  publishedAt: Date | string;
  imageUrl?: string | null;
  sourcesBySpectrum?: Record<string, string[]>;
}

// ─── Compact 5-badge spectrum row ─────────────────────────────────────────────
// Shows all 5 spectra as small inline badges with percentage only.
// Logos are shown separately below in SourcesLogos.
function SpectrumBadges({ spectrumData }: { spectrumData: SpectrumData }) {
  const pcts: Record<string, number> = {
    esquerda:          spectrumData.leftPct,
    "centro-esquerda": spectrumData.centerLeftPct,
    centro:            spectrumData.centerPct,
    "centro-direita":  spectrumData.centerRightPct,
    direita:           spectrumData.rightPct,
  };
  const maxPct = Math.max(...Object.values(pcts));

  return (
    <div style={{
      display: "flex",
      gap: "4px",
      flexWrap: "wrap",
      marginTop: "6px",
    }}>
      {SPECTRUM_ORDER.map((spectrum) => {
        const pct = Math.round(pcts[spectrum]);
        const isDominant = pcts[spectrum] === maxPct && pcts[spectrum] > 0;
        const color = SPECTRUM_COLORS[spectrum];
        const bg = SPECTRUM_BG[spectrum];
        const abbr = SPECTRUM_ABBR[spectrum];
        const isEmpty = pct === 0;

        return (
          <span key={spectrum} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            backgroundColor: isDominant ? color : (isEmpty ? "#f5f5f5" : bg),
            color: isDominant ? "#ffffff" : (isEmpty ? "#cccccc" : color),
            border: `1px solid ${isDominant ? color : (isEmpty ? "#e0e0e0" : color + "50")}`,
            borderRadius: "3px",
            padding: "2px 6px",
            fontWeight: 700,
            fontSize: "10px",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              backgroundColor: isDominant ? "rgba(255,255,255,0.8)" : (isEmpty ? "#cccccc" : color),
              display: "inline-block", flexShrink: 0,
            }} />
            {pct}% {abbr}
          </span>
        );
      })}
    </div>
  );
}

// ─── Source logos row (compact, grouped by spectrum) ──────────────────────────
// Shows outlet logos grouped by spectrum, clean and separate from percentages.
function SourcesLogos({
  sourcesBySpectrum,
  maxLogos = 7,
}: {
  sourcesBySpectrum: Record<string, string[]>;
  maxLogos?: number;
}) {
  const hasAnySources = SPECTRUM_ORDER.some(
    (s) => (sourcesBySpectrum[s] || []).length > 0,
  );
  if (!hasAnySources) return null;

  // Collect all sources with their spectrum color and label
  const allSources: { name: string; color: string; label: string }[] = [];
  SPECTRUM_ORDER.forEach((spectrum) => {
    const sources = sourcesBySpectrum[spectrum] || [];
    sources.forEach((name) => {
      allSources.push({
        name,
        color: SPECTRUM_COLORS[spectrum],
        label: SPECTRUM_LABELS[spectrum],
      });
    });
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "3px",
      marginTop: "7px",
      flexWrap: "wrap",
    }}>
      {allSources.slice(0, maxLogos).map(({ name, color, label }) => (
        <OutletLogo
          key={name}
          name={name}
          siteUrl={OUTLET_URL_BY_NAME[name]}
          spectrumColor={color}
          spectrumLabel={label}
          size={18}
        />
      ))}
      {allSources.length > maxLogos && (
        <span style={{
          fontSize: "10px", color: "#aaa",
          fontFamily: "'Inter', sans-serif",
          padding: "0 2px",
        }}>
          +{allSources.length - maxLogos}
        </span>
      )}
    </div>
  );
}

// ─── FEATURED card ────────────────────────────────────────────────────────────
function FeaturedCard({ topic }: { topic: TopicCardTopic }) {
  const publishedAt = topic.publishedAt instanceof Date ? topic.publishedAt : new Date(topic.publishedAt);
  const spectrumData: SpectrumData = {
    leftPct: topic.leftPct, centerLeftPct: topic.centerLeftPct,
    centerPct: topic.centerPct, centerRightPct: topic.centerRightPct,
    rightPct: topic.rightPct, totalSources: topic.totalSources,
  };
  const dominant = getDominantSpectrum(spectrumData);
  const sourcesBySpectrum = topic.sourcesBySpectrum || {};

  return (
    <Link href={`/topico/${topic.id}`}>
      <div style={{
        cursor: "pointer", marginBottom: "16px",
        background: "#ffffff", border: "1px solid #e5e3df",
        borderRadius: "5px", overflow: "hidden",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
      >
        {/* Spectrum accent bar */}
        <div style={{ height: "4px", background: dominant.color }} />

        {/* Image */}
        {topic.imageUrl && (
          <img
            src={topic.imageUrl}
            alt={topic.title}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        <div style={{ padding: "18px 20px 20px" }}>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#888",
              fontFamily: "'Inter', sans-serif",
            }}>
              {CATEGORY_LABELS[topic.category] || topic.category}
            </span>
            {topic.isBlindspot && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 9, fontWeight: 700, color: "#f39c12",
                fontFamily: "'Inter', sans-serif",
                background: "rgba(243,156,18,0.1)", padding: "2px 6px", borderRadius: 2,
              }}>
                <Eye size={8} /> PONTO CEGO
              </span>
            )}
            <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Inter', sans-serif" }}>
              {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
            </span>
            <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Inter', sans-serif" }}>
              · {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22px", fontWeight: 700, lineHeight: 1.25,
            color: "#111111", marginBottom: "10px",
          }}>
            {topic.title}
          </h2>

          {/* Summary */}
          {topic.summary && (
            <p style={{
              fontSize: "14px", lineHeight: 1.6, color: "#555555",
              fontFamily: "'Inter', sans-serif", marginBottom: "14px",
              display: "-webkit-box", WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {topic.summary}
            </p>
          )}

          {/* Spectrum bar */}
          <SpectrumBar data={spectrumData} size="md" showLabels={false} showCoverage={false} />

          {/* 5 badges */}
          <SpectrumBadges spectrumData={spectrumData} />

          {/* Source logos */}
          <SourcesLogos sourcesBySpectrum={sourcesBySpectrum} />
        </div>
      </div>
    </Link>
  );
}

// ─── TOP STORY card (left column) ─────────────────────────────────────────────
function TopStoryCard({ topic, rank }: { topic: TopicCardTopic; rank: number }) {
  const publishedAt = topic.publishedAt instanceof Date ? topic.publishedAt : new Date(topic.publishedAt);
  const spectrumData: SpectrumData = {
    leftPct: topic.leftPct, centerLeftPct: topic.centerLeftPct,
    centerPct: topic.centerPct, centerRightPct: topic.centerRightPct,
    rightPct: topic.rightPct, totalSources: topic.totalSources,
  };
  const sourcesBySpectrum = topic.sourcesBySpectrum || {};

  return (
    <Link href={`/topico/${topic.id}`}>
      <div style={{
        display: "flex", gap: "10px", padding: "12px 0",
        borderBottom: "1px solid #f0eeea", cursor: "pointer",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <span style={{
          flexShrink: 0, width: "20px", fontSize: "13px",
          fontWeight: 700, color: "#cccccc",
          fontFamily: "'Playfair Display', Georgia, serif",
          lineHeight: 1.3, paddingTop: "1px",
        }}>
          {rank}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {topic.isBlindspot && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#f39c12",
              fontFamily: "'Inter', sans-serif", marginBottom: 4,
            }}>
              <Eye size={8} /> PONTO CEGO
            </div>
          )}
          <h4 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "13.5px", fontWeight: 700, lineHeight: 1.3,
            color: "#111111", marginBottom: "7px",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {topic.title}
          </h4>
          {/* Spectrum bar */}
          <SpectrumBar data={spectrumData} size="sm" showLabels={false} showCoverage={false} />
          {/* 5 compact badges */}
          <SpectrumBadges spectrumData={spectrumData} />
          {/* Logos row */}
          <SourcesLogos sourcesBySpectrum={sourcesBySpectrum} />
          <p style={{ fontSize: "10px", color: "#aaa", fontFamily: "'Inter', sans-serif", marginTop: "5px" }}>
            {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"} · {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── GRID card (main feed) ────────────────────────────────────────────────────
function GridCard({ topic }: { topic: TopicCardTopic }) {
  const publishedAt = topic.publishedAt instanceof Date ? topic.publishedAt : new Date(topic.publishedAt);
  const spectrumData: SpectrumData = {
    leftPct: topic.leftPct, centerLeftPct: topic.centerLeftPct,
    centerPct: topic.centerPct, centerRightPct: topic.centerRightPct,
    rightPct: topic.rightPct, totalSources: topic.totalSources,
  };
  const dominant = getDominantSpectrum(spectrumData);
  const sourcesBySpectrum = topic.sourcesBySpectrum || {};

  return (
    <Link href={`/topico/${topic.id}`}>
      <div style={{
        display: "flex", gap: "14px", padding: "14px 0",
        cursor: "pointer", transition: "opacity 0.15s ease",
        borderBottom: "1px solid #f0eeea",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", color: "#888",
              fontFamily: "'Inter', sans-serif",
            }}>
              {CATEGORY_LABELS[topic.category] || topic.category}
            </span>
            {topic.isBlindspot && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                fontSize: 9, fontWeight: 700, color: "#f39c12",
                fontFamily: "'Inter', sans-serif",
              }}>
                <Eye size={7} /> PONTO CEGO
              </span>
            )}
            <span style={{ fontSize: 10, color: "#bbb", fontFamily: "'Inter', sans-serif", marginLeft: "auto" }}>
              {formatDistanceToNow(publishedAt, { addSuffix: true, locale: ptBR })}
            </span>
          </div>

          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "15.5px", fontWeight: 700, lineHeight: 1.3,
            color: "#111111", marginBottom: "9px",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {topic.title}
          </h3>

          {/* Spectrum bar */}
          <SpectrumBar data={spectrumData} size="sm" showLabels={false} showCoverage={false} />

          {/* 5 compact badges */}
          <SpectrumBadges spectrumData={spectrumData} />

          {/* Logos + source names */}
          <SourcesLogos sourcesBySpectrum={sourcesBySpectrum} />

          <p style={{ fontSize: "10px", color: "#aaa", fontFamily: "'Inter', sans-serif", marginTop: "5px" }}>
            {topic.totalSources} {topic.totalSources === 1 ? "fonte" : "fontes"}
          </p>
        </div>

        {/* Thumbnail */}
        {topic.imageUrl ? (
          <img
            src={topic.imageUrl}
            alt={topic.title}
            className="grid-card-thumb"
            style={{
              width: "88px", height: "88px", objectFit: "cover",
              borderRadius: "4px", flexShrink: 0, background: "#e5e3df",
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div
            className="grid-card-thumb"
            style={{
              width: "88px", height: "88px", borderRadius: "4px",
              flexShrink: 0, background: "#e8e6e1",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <div style={{ width: 24, height: 3, background: dominant.color, borderRadius: 2, opacity: 0.5 }} />
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── BLINDSPOT card (sidebar) ─────────────────────────────────────────────────
function BlindspotCard({ topic }: { topic: TopicCardTopic }) {
  const dominant = topic.blindspotSpectrum || "centro";
  const color = SPECTRUM_COLORS[dominant] || "#888888";
  const label = SPECTRUM_LABELS[dominant] || dominant;
  const bg = SPECTRUM_BG[dominant] || "#f5f5f5";

  return (
    <Link href={`/topico/${topic.id}`}>
      <div style={{
        display: "flex", gap: "10px", padding: "10px 0",
        borderBottom: "1px solid #f0eeea", cursor: "pointer",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <div style={{
          flexShrink: 0, width: "4px", borderRadius: "2px",
          backgroundColor: color, alignSelf: "stretch", minHeight: "40px",
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "inline-block", fontSize: "9.5px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: color, backgroundColor: bg,
            border: `1px solid ${color}40`, borderRadius: "2px",
            padding: "1px 5px", fontFamily: "'Inter', sans-serif", marginBottom: "4px",
          }}>
            {label}
          </span>
          <p style={{
            fontSize: "12.5px", fontWeight: 600,
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#111111", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {topic.title}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Public exports ───────────────────────────────────────────────────────────
export { FeaturedCard, TopStoryCard, GridCard, BlindspotCard };

export function TopicCard({ topic, variant = "grid", rank }: {
  topic: TopicCardTopic;
  variant?: "featured" | "top-story" | "grid" | "blindspot";
  rank?: number;
}) {
  if (variant === "featured") return <FeaturedCard topic={topic} />;
  if (variant === "top-story") return <TopStoryCard topic={topic} rank={rank ?? 1} />;
  if (variant === "blindspot") return <BlindspotCard topic={topic} />;
  return <GridCard topic={topic} />;
}
