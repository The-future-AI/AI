import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from "./_core/trpc";
import {
  getTopics,
  getTopicById,
  saveTopicAnalysis,
  getBlindspotTopics,
  getTrendingTopics,
  getElectionTopics,
  getTopicTimeline,
  getArticlesByTopic,
  searchArticles,
  getAllOutlets,
  getOutletBySlug,
  getRecentArticlesByOutlet,
  getLatestScrapeJob,
  getTopicsCount,
  getTopicsWithSources,
  addNewsletterSubscriber,
  setUserSubscription,
} from "./db";
import { runPipeline } from "./pipeline";
import {
  effectiveTier,
  hasFeature,
  type Tier,
  type Feature,
} from "@shared/entitlements";
import {
  isBillingConfigured,
  createCheckoutSession,
  tierToPriceId,
} from "./payments";
import type { StructuredAnalysis } from "../drizzle/schema";

/** Tipo retornado ao cliente: análise com bloqueios por plano aplicados. */
export type GatedAnalysis = StructuredAnalysis & {
  locked: Record<Feature, boolean>;
  tier: Tier;
};

/**
 * Remove da resposta os campos pagos quando o plano do usuário não dá direito,
 * e informa quais recursos estão bloqueados (para o cliente exibir paywall).
 * O servidor é a autoridade — dados pagos nunca chegam ao cliente sem direito.
 */
function gateAnalysis(full: StructuredAnalysis, tier: Tier): GatedAnalysis {
  const canFraming = hasFeature(tier, "framingAnalysis");
  const canContext = hasFeature(tier, "contextSection");
  return {
    neutralSummary: full.neutralSummary,
    commonFacts: full.commonFacts,
    framingDifferences: canFraming ? full.framingDifferences : [],
    context: canContext ? full.context : "",
    blindspotNote: full.blindspotNote,
    locked: {
      framingAnalysis: !canFraming,
      contextSection: !canContext,
      timeline: !hasFeature(tier, "timeline"),
      export: !hasFeature(tier, "export"),
      alerts: !hasFeature(tier, "alerts"),
      topicTracking: !hasFeature(tier, "topicTracking"),
    },
    tier,
  };
}
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
      .query(async ({ input, ctx }) => {
        const tier = effectiveTier(ctx.user);
        const topic = await getTopicById(input.topicId);
        if (!topic) return null;

        // Cache: análise é determinística por tópico — gera uma vez e reaproveita,
        // evitando uma chamada de LLM a cada visualização da página.
        if (topic.structuredAnalysis) {
          return gateAnalysis(topic.structuredAnalysis, tier);
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
          return gateAnalysis(analysis, tier);
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

    election: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(30).default(8) }))
      .query(async ({ input }) => {
        return getElectionTopics(input.limit);
      }),

    /** Linha do tempo da história. Recurso pago — gated por plano no servidor. */
    getTimeline: publicProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tier = effectiveTier(ctx.user);
        if (!hasFeature(tier, "timeline")) {
          return { locked: true as const, tier, items: [] };
        }
        const items = await getTopicTimeline(input.topicId);
        return { locked: false as const, tier, items };
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

  billing: router({
    /** Situação atual de billing + plano do usuário logado. */
    status: publicProcedure.query(({ ctx }) => {
      return {
        configured: isBillingConfigured(),
        tier: effectiveTier(ctx.user),
        rawTier: (ctx.user?.subscriptionTier as Tier) ?? "free",
        subscriptionStatus: ctx.user?.subscriptionStatus ?? "none",
      };
    }),

    /** Cria uma sessão de checkout para um plano vendável (estudante/pro). */
    createCheckout: protectedProcedure
      .input(z.object({ tier: z.enum(["estudante", "pro"]) }))
      .mutation(async ({ input, ctx }) => {
        if (!isBillingConfigured() || !tierToPriceId(input.tier)) {
          return {
            configured: false as const,
            message:
              "Pagamentos ainda não estão configurados. Em breve você poderá assinar — ou fale conosco para planos institucionais.",
          };
        }
        try {
          const { url } = await createCheckoutSession({
            tier: input.tier,
            userId: ctx.user.id,
            openId: ctx.user.openId,
            email: ctx.user.email,
            customerId: ctx.user.stripeCustomerId,
          });
          return { configured: true as const, url };
        } catch (e) {
          console.error("[Billing] createCheckout error:", e);
          return {
            configured: true as const,
            url: null,
            message: "Não foi possível iniciar o checkout. Tente novamente.",
          };
        }
      }),

    /**
     * Concessão manual de plano (admin) — usado para clientes institucionais e
     * beta testers antes da cobrança automática estar 100% ativa.
     */
    grantTier: adminProcedure
      .input(
        z.object({
          openId: z.string().min(1),
          tier: z.enum(["free", "estudante", "pro", "organizacao"]),
          status: z.enum(["none", "active", "canceled", "past_due"]).default("active"),
        })
      )
      .mutation(async ({ input }) => {
        const ok = await setUserSubscription(input.openId, {
          tier: input.tier,
          status: input.tier === "free" ? "none" : input.status,
        });
        return { success: ok };
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
