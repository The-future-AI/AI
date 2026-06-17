import { eq, desc, and, or, like, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  topics,
  articles,
  mediaOutlets,
  scrapeJobs,
  newsletterSubscribers,
  subscriptions,
  type StructuredAnalysis,
} from "../drizzle/schema";
import type { Tier } from "@shared/entitlements";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Subscriptions / billing ───────────────────────────────────────────────────

/** Atualiza o plano e situação de assinatura de um usuário. */
export async function setUserSubscription(
  openId: string,
  data: {
    tier: Tier;
    status: "none" | "active" | "canceled" | "past_due";
    expiresAt?: Date | null;
    stripeCustomerId?: string | null;
  },
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const set: Record<string, unknown> = {
    subscriptionTier: data.tier,
    subscriptionStatus: data.status,
  };
  if (data.expiresAt !== undefined) set.subscriptionExpiresAt = data.expiresAt;
  if (data.stripeCustomerId !== undefined)
    set.stripeCustomerId = data.stripeCustomerId;
  await db.update(users).set(set).where(eq(users.openId, openId));
  return true;
}

/** Registra (ou atualiza) o vínculo com a assinatura no provedor. */
export async function recordSubscription(data: {
  userId: number;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  tier: Tier;
  status: string;
  currentPeriodEnd?: Date | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values({
    userId: data.userId,
    provider: "stripe",
    providerCustomerId: data.providerCustomerId ?? null,
    providerSubscriptionId: data.providerSubscriptionId ?? null,
    tier: data.tier,
    status: data.status,
    currentPeriodEnd: data.currentPeriodEnd ?? null,
  });
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export async function getTopics(opts: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (opts.category && opts.category !== "todos") {
    conditions.push(
      eq(
        topics.category,
        opts.category as
          | "politica"
          | "economia"
          | "internacional"
          | "esporte"
          | "tecnologia"
          | "geral"
      )
    );
  }
  if (opts.search) {
    conditions.push(like(topics.title, `%${opts.search}%`));
  }

  const query = db
    .select()
    .from(topics)
    .orderBy(desc(topics.totalSources), desc(topics.publishedAt))
    .limit(opts.limit || 20)
    .offset(opts.offset || 0);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function getTopicById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);
  return result[0] || null;
}

/** Persiste o cache da análise estruturada de um tópico. */
export async function saveTopicAnalysis(
  topicId: number,
  analysis: StructuredAnalysis
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(topics)
    .set({ structuredAnalysis: analysis })
    .where(eq(topics.id, topicId));
}

export async function getBlindspotTopics(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topics)
    .where(eq(topics.isBlindspot, true))
    .orderBy(desc(topics.publishedAt))
    .limit(limit);
}

export async function getTrendingTopics(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topics)
    .where(eq(topics.trending, true))
    .orderBy(desc(topics.publishedAt))
    .limit(limit);
}

/** Tópicos marcados como eleitorais — alimenta a seção "Eleições" da home. */
export async function getElectionTopics(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topics)
    .where(eq(topics.isElection, true))
    .orderBy(desc(topics.totalSources), desc(topics.publishedAt))
    .limit(limit);
}

/**
 * Linha do tempo de um tópico: cada artigo em ordem cronológica crescente,
 * com veículo e espectro — "como a história se desenvolveu". Recurso pago.
 */
export async function getTopicTimeline(topicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      title: articles.title,
      url: articles.url,
      spectrum: articles.spectrum,
      publishedAt: articles.publishedAt,
      outletName: mediaOutlets.name,
      outletSlug: mediaOutlets.slug,
    })
    .from(articles)
    .leftJoin(mediaOutlets, eq(articles.outletId, mediaOutlets.id))
    .where(eq(articles.topicId, topicId))
    .orderBy(articles.publishedAt);
}

// ─── Articles ────────────────────────────────────────────────────────────────

export async function getArticlesByTopic(topicId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      imageUrl: articles.imageUrl,
      spectrum: articles.spectrum,
      category: articles.category,
      publishedAt: articles.publishedAt,
      outletId: articles.outletId,
      outletName: mediaOutlets.name,
      outletSlug: mediaOutlets.slug,
      outletUrl: mediaOutlets.url,
      outletOwnership: mediaOutlets.ownership,
      outletFactuality: mediaOutlets.factuality,
    })
    .from(articles)
    .leftJoin(mediaOutlets, eq(articles.outletId, mediaOutlets.id))
    .where(eq(articles.topicId, topicId))
    .orderBy(desc(articles.publishedAt));
}

export async function searchArticles(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: topics.id,
      title: topics.title,
      summary: topics.summary,
      category: topics.category,
      totalSources: topics.totalSources,
      publishedAt: topics.publishedAt,
      isBlindspot: topics.isBlindspot,
      leftPct: topics.leftPct,
      centerLeftPct: topics.centerLeftPct,
      centerPct: topics.centerPct,
      centerRightPct: topics.centerRightPct,
      rightPct: topics.rightPct,
    })
    .from(topics)
    .where(like(topics.title, `%${query}%`))
    .orderBy(desc(topics.publishedAt))
    .limit(limit);
}

// ─── Media Outlets ────────────────────────────────────────────────────────────

export async function getAllOutlets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaOutlets).where(eq(mediaOutlets.active, true));
}

// ─── Topics with Sources ────────────────────────────────────────────────────

export async function getTopicsWithSources(opts: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  // Get topics first
  const topicList = await getTopics(opts);
  const total = await getTopicsCount({ category: opts.category, search: opts.search });
  if (topicList.length === 0) return { items: [], total };

  const topicIds = topicList.map((t) => t.id);

  // Get all articles for these topics with outlet info
  const rows = await db
    .select({
      topicId: articles.topicId,
      outletName: mediaOutlets.name,
      outletSlug: mediaOutlets.slug,
      spectrum: articles.spectrum,
    })
    .from(articles)
    .leftJoin(mediaOutlets, eq(articles.outletId, mediaOutlets.id))
    .where(
      topicIds.length === 1
        ? eq(articles.topicId, topicIds[0])
        : sql`${articles.topicId} IN (${sql.join(topicIds.map(id => sql`${id}`), sql`, `)})`
    );

  // Group sources by topicId and spectrum
  const sourcesByTopic: Record<number, Record<string, string[]>> = {};
  for (const row of rows) {
    if (!row.topicId || !row.spectrum || !row.outletName) continue;
    if (!sourcesByTopic[row.topicId]) sourcesByTopic[row.topicId] = {};
    if (!sourcesByTopic[row.topicId][row.spectrum]) sourcesByTopic[row.topicId][row.spectrum] = [];
    const name = row.outletName;
    if (!sourcesByTopic[row.topicId][row.spectrum].includes(name)) {
      sourcesByTopic[row.topicId][row.spectrum].push(name);
    }
  }

  const items = topicList.map((t) => ({
    ...t,
    sourcesBySpectrum: sourcesByTopic[t.id] || {},
  }));

  return { items, total };
}

// ─── Scrape Jobs ─────────────────────────────────────────────────────────────

export async function getLatestScrapeJob() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(scrapeJobs)
    .orderBy(desc(scrapeJobs.startedAt))
    .limit(1);
  return result[0] || null;
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

/**
 * Registra um e-mail na newsletter. Idempotente: reinscrever um e-mail já
 * existente reativa a inscrição em vez de gerar erro de chave duplicada.
 * Retorna `false` quando o banco está indisponível.
 */
export async function addNewsletterSubscriber(
  email: string,
  source?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .insert(newsletterSubscribers)
    .values({ email, source: source ?? null, active: true })
    .onDuplicateKeyUpdate({ set: { active: true } });
  return true;
}

export async function getTopicsCount(opts?: { category?: string; search?: string }) {
  const db = await getDb();
  if (!db) return 0;

  const conditions = [];
  if (opts?.category && opts.category !== "todos") {
    conditions.push(
      eq(
        topics.category,
        opts.category as
          | "politica"
          | "economia"
          | "internacional"
          | "esporte"
          | "tecnologia"
          | "geral"
      )
    );
  }
  if (opts?.search) {
    conditions.push(like(topics.title, `%${opts.search}%`));
  }

  const query = db.select({ count: sql<number>`count(*)` }).from(topics);
  const result = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;
  return Number(result[0]?.count || 0);
}

// ─── Outlet by slug ──────────────────────────────────────────────────────────

export async function getOutletBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(mediaOutlets)
    .where(eq(mediaOutlets.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getRecentArticlesByOutlet(outletSlug: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      imageUrl: articles.imageUrl,
      spectrum: articles.spectrum,
      category: articles.category,
      publishedAt: articles.publishedAt,
      topicId: articles.topicId,
    })
    .from(articles)
    .leftJoin(mediaOutlets, eq(articles.outletId, mediaOutlets.id))
    .where(eq(mediaOutlets.slug, outletSlug))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}
