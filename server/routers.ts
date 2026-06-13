import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getTopics,
  getTopicById,
  getBlindspotTopics,
  getTrendingTopics,
  getArticlesByTopic,
  searchArticles,
  getAllOutlets,
  getLatestScrapeJob,
  getTopicsCount,
  getTopicsWithSources,
} from "./db";
import { runPipeline } from "./pipeline";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  topics: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getTopicsWithSources({
          category: input.category,
          limit: input.limit,
          offset: input.offset,
          search: input.search,
        });
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const topic = await getTopicById(input.id);
        if (!topic) return null;
        const articles = await getArticlesByTopic(input.id);
        return { topic, articles };
      }),

    blindspot: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(6) }))
      .query(async ({ input }) => {
        return getBlindspotTopics(input.limit);
      }),

    trending: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
      .query(async ({ input }) => {
        return getTrendingTopics(input.limit);
      }),
  }),

  articles: router({
    search: publicProcedure
      .input(z.object({ query: z.string().min(2), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return searchArticles(input.query, input.limit);
      }),
  }),

  outlets: router({
    list: publicProcedure.query(async () => {
      return getAllOutlets();
    }),
  }),

  scraper: router({
    status: publicProcedure.query(async () => {
      return getLatestScrapeJob();
    }),

    run: protectedProcedure.mutation(async () => {
      // Run pipeline in background (non-blocking)
      runPipeline().catch((err) =>
        console.error("[Scraper] Background pipeline error:", err)
      );
      return { started: true, message: "Pipeline iniciado em segundo plano" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
