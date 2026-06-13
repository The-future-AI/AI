import axios from "axios";
import { getDb } from "./db";
import { articles, mediaOutlets, scrapeJobs } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

// RSS feed URLs for Brazilian media outlets
const RSS_FEEDS: Record<string, string[]> = {
  g1: [
    "https://g1.globo.com/rss/g1/",
    "https://g1.globo.com/rss/g1/politica/",
    "https://g1.globo.com/rss/g1/economia/",
  ],
  folha: [
    "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml",
    "https://feeds.folha.uol.com.br/poder/rss091.xml",
    "https://feeds.folha.uol.com.br/mercado/rss091.xml",
  ],
  oglobo: [
    "https://oglobo.globo.com/rss.xml",
    "https://oglobo.globo.com/politica/rss.xml",
  ],
  uol: [
    "https://rss.uol.com.br/feed/noticias.xml",
    "https://rss.uol.com.br/feed/politica.xml",
    "https://rss.uol.com.br/feed/economia.xml",
  ],
  estadao: [
    "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/politica/",
    "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/economia/",
    "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/brasil/",
    "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/internacional/",
    "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/esportes/",
  ],
  r7: [
    "https://noticias.r7.com/feed.xml",
    "https://noticias.r7.com/brasil/feed.xml",
  ],
  cartacapital: [
    "https://www.cartacapital.com.br/feed/",
    "https://www.cartacapital.com.br/politica/feed/",
  ],
  veja: [
    "https://veja.abril.com.br/feed/",
    "https://veja.abril.com.br/politica/feed/",
  ],
  brasildefato: [
    "https://www.brasildefato.com.br/rss.xml",
    "https://www.brasildefato.com.br/nacional/rss.xml",
  ],
};

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
}

function parseRSSDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch {
    return new Date();
  }
}

function extractImageFromItem(item: RSSItem): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.$?.url) return item["media:content"].$?.url;
  if (item["media:thumbnail"]?.$?.url) return item["media:thumbnail"].$?.url;
  return undefined;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsBiasBot/1.0; +https://noticiasbrasil.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    const xml = response.data as string;
    const items: RSSItem[] = [];

    // Simple XML parsing without external library
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const itemXml = itemMatch[1];

      const getTag = (tag: string): string => {
        const match = itemXml.match(
          new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i")
        );
        return match ? match[1].trim() : "";
      };

      const getAttr = (tag: string, attr: string): string => {
        const match = itemXml.match(
          new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i")
        );
        return match ? match[1].trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link") || getTag("guid");
      if (!title || !link) continue;

      const description = getTag("description") || getTag("summary");
      const pubDate = getTag("pubDate") || getTag("published") || getTag("dc:date");
      const enclosureUrl = getAttr("enclosure", "url");
      const mediaUrl =
        getAttr("media:content", "url") || getAttr("media:thumbnail", "url");

      items.push({
        title: stripHtml(title),
        link: link.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim(),
        description: description ? stripHtml(description) : undefined,
        pubDate: pubDate || undefined,
        enclosure: enclosureUrl ? { url: enclosureUrl } : undefined,
        "media:content": mediaUrl ? { $: { url: mediaUrl } } : undefined,
      });
    }

    return items;
  } catch (error) {
    console.error(`[Scraper] Failed to fetch RSS ${url}:`, error);
    return [];
  }
}

export async function scrapeAllOutlets(): Promise<{
  scraped: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const outlets = await db
    .select()
    .from(mediaOutlets)
    .where(eq(mediaOutlets.active, true));

  let totalScraped = 0;
  const errors: string[] = [];

  for (const outlet of outlets) {
    const feeds = RSS_FEEDS[outlet.slug] || [];
    if (feeds.length === 0) {
      console.log(`[Scraper] No RSS feeds configured for ${outlet.slug}`);
      continue;
    }

    for (const feedUrl of feeds) {
      try {
        const items = await fetchRSSFeed(feedUrl);
        console.log(
          `[Scraper] ${outlet.name}: fetched ${items.length} items from ${feedUrl}`
        );

        for (const item of items) {
          if (!item.link || !item.title) continue;

          // Normalize URL
          const url = item.link.startsWith("http")
            ? item.link
            : `${outlet.url}${item.link}`;

          try {
            await db
              .insert(articles)
              .values({
                outletId: outlet.id,
                title: item.title.substring(0, 1000),
                summary: item.description
                  ? item.description.substring(0, 2000)
                  : null,
                url: url.substring(0, 2000),
                imageUrl: extractImageFromItem(item)?.substring(0, 2000),
                publishedAt: parseRSSDate(item.pubDate),
                processed: false,
                spectrum: outlet.spectrum,
              })
              .onDuplicateKeyUpdate({
                set: { scrapedAt: new Date() },
              });
            totalScraped++;
          } catch (insertErr) {
            // Duplicate URL is expected, skip silently
          }
        }
      } catch (feedErr) {
        const msg = `Failed to scrape ${outlet.name} (${feedUrl}): ${feedErr}`;
        errors.push(msg);
        console.error(`[Scraper] ${msg}`);
      }
    }
  }

  return { scraped: totalScraped, errors };
}

export async function getUnprocessedArticles(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      outletId: articles.outletId,
      spectrum: articles.spectrum,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.processed, false), isNull(articles.topicId)))
    .limit(limit);
}
