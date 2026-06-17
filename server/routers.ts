import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getTopics,
  getTopicById,
  saveTopicAnalysis,
  getBlindspotTopics,
  getTrendingTopics,
  getArticlesByTopic,
  searchArticles,
  getAllOutlets,
  getOutletBySlug,
  getRecentArticlesByOutlet,
  getLatestScrapeJob,
  getTopicsCount,
  getTopicsWithSources,
  addNewsletterSubscriber,
} from "./db";
import { runPipeline } from "./pipeline";
import { invokeLLM } from "./_core/llm";

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

    getStructuredAnalysis: publicProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ input }) => {
        const topic = await getTopicById(input.topicId);
        if (!topic) return null;

        // Cache: análise é determinística por tópico — gera uma vez e reaproveita,
        // evitando uma chamada de LLM a cada visualização da página.
        if (topic.structuredAnalysis) {
          return topic.structuredAnalysis;
        }

        const articles = await getArticlesByTopic(input.topicId);
        if (articles.length === 0) return null;

        // Build article summaries for LLM
        const articleSummaries = articles
          .slice(0, 20)
          .map((a) => `- [${a.outletName} / ${a.spectrum}] ${a.title}${a.summary ? ": " + a.summary.slice(0, 200) : ""}`)
          .join("\n");

        const prompt = `Você é um jornalista analítico neutro. Analise as seguintes manchetes e resumos sobre o mesmo tópico publicados por diferentes veículos brasileiros com diferentes posições políticas.

TÓPICO: ${topic.title}

ARTIGOS:
${articleSummaries}

Gere uma análise estruturada em JSON com exatamente estes campos:
{
  "neutralSummary": "Resumo neutro de 2-3 frases do que aconteceu, sem julgamento político",
  "commonFacts": ["Fato 1 confirmado por múltiplas fontes", "Fato 2..."],
  "framingDifferences": [
    {"outlet": "Nome do veículo", "spectrum": "espectro", "framing": "Como este veículo enquadrou a notícia em 1 frase"}
  ],
  "context": "1-2 frases de contexto histórico ou legal relevante",
  "blindspotNote": "Nota sobre o que algum espectro ignorou ou enfatizou demais (ou null se não houver)"
}

Responda APENAS com o JSON, sem markdown.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Você é um analista de mídia neutro especializado em jornalismo brasileiro." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          });
          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : null;
          if (!content) return null;
          const analysis = JSON.parse(content) as {
            neutralSummary: string;
            commonFacts: string[];
            framingDifferences: { outlet: string; spectrum: string; framing: string }[];
            context: string;
            blindspotNote: string | null;
          };
          // Grava no cache para as próximas visualizações (best-effort).
          await saveTopicAnalysis(input.topicId, analysis);
          return analysis;
        } catch (e) {
          console.error("[LLM] Structured analysis error:", e);
          return null;
        }
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

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const outlet = await getOutletBySlug(input.slug);
        if (!outlet) return null;
        const recentArticles = await getRecentArticlesByOutlet(input.slug, 20);
        return { outlet, recentArticles };
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("E-mail inválido").max(320),
          source: z.string().max(64).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const ok = await addNewsletterSubscriber(
          input.email.trim().toLowerCase(),
          input.source
        );
        if (!ok) {
          return {
            success: false as const,
            message: "Serviço de inscrição indisponível no momento.",
          };
        }
        return {
          success: true as const,
          message: "Inscrição confirmada! Você receberá nosso resumo.",
        };
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
