import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Political spectrum enum
export const spectrumEnum = mysqlEnum("spectrum", [
  "esquerda",
  "centro-esquerda",
  "centro",
  "centro-direita",
  "direita",
]);

// News category enum
export const categoryEnum = mysqlEnum("category", [
  "politica",
  "economia",
  "internacional",
  "esporte",
  "tecnologia",
  "geral",
]);

// Media outlets table
export const mediaOutlets = mysqlTable("media_outlets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  url: varchar("url", { length: 512 }).notNull(),
  logoUrl: varchar("logoUrl", { length: 512 }),
  spectrum: mysqlEnum("spectrum", [
    "esquerda",
    "centro-esquerda",
    "centro",
    "centro-direita",
    "direita",
  ]).notNull(),
  country: varchar("country", { length: 8 }).default("BR").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaOutlet = typeof mediaOutlets.$inferSelect;
export type InsertMediaOutlet = typeof mediaOutlets.$inferInsert;

// News topics/events (grouped stories)
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary"),
  category: mysqlEnum("category", [
    "politica",
    "economia",
    "internacional",
    "esporte",
    "tecnologia",
    "geral",
  ])
    .default("geral")
    .notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  totalSources: int("totalSources").default(0).notNull(),
  leftCount: int("leftCount").default(0).notNull(),
  centerLeftCount: int("centerLeftCount").default(0).notNull(),
  centerCount: int("centerCount").default(0).notNull(),
  centerRightCount: int("centerRightCount").default(0).notNull(),
  rightCount: int("rightCount").default(0).notNull(),
  leftPct: float("leftPct").default(0).notNull(),
  centerLeftPct: float("centerLeftPct").default(0).notNull(),
  centerPct: float("centerPct").default(0).notNull(),
  centerRightPct: float("centerRightPct").default(0).notNull(),
  rightPct: float("rightPct").default(0).notNull(),
  isBlindspot: boolean("isBlindspot").default(false).notNull(),
  blindspotSpectrum: varchar("blindspotSpectrum", { length: 32 }),
  trending: boolean("trending").default(false).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

// Individual articles
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId"),
  outletId: int("outletId").notNull(),
  title: varchar("title", { length: 1024 }).notNull(),
  summary: text("summary"),
  url: varchar("url", { length: 2048 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 2048 }),
  spectrum: mysqlEnum("spectrum", [
    "esquerda",
    "centro-esquerda",
    "centro",
    "centro-direita",
    "direita",
  ]),
  category: mysqlEnum("category", [
    "politica",
    "economia",
    "internacional",
    "esporte",
    "tecnologia",
    "geral",
  ]).default("geral"),
  spectrumConfidence: float("spectrumConfidence").default(0),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// Scrape job logs
export const scrapeJobs = mysqlTable("scrape_jobs", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["running", "completed", "failed"])
    .default("running")
    .notNull(),
  articlesScraped: int("articlesScraped").default(0).notNull(),
  articlesProcessed: int("articlesProcessed").default(0).notNull(),
  topicsCreated: int("topicsCreated").default(0).notNull(),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type InsertScrapeJob = typeof scrapeJobs.$inferInsert;
