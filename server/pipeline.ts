import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import {
  articles,
  topics,
  scrapeJobs,
  mediaOutlets,
} from "../drizzle/schema";
import { eq, and, isNull, inArray, desc } from "drizzle-orm";
import { scrapeAllOutlets } from "./scraper";

type Spectrum =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";
type Category =
  | "politica"
  | "economia"
  | "internacional"
  | "esporte"
  | "tecnologia"
  | "geral";

interface ArticleForProcessing {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  outletId: number;
  spectrum: string | null;
  publishedAt: Date;
}

interface ClassificationResult {
  spectrum: Spectrum;
  category: Category;
  confidence: number;
}

interface TopicGroup {
  title: string;
  summary: string;
  category: Category;
  articleIndices: number[];
}

async function classifyArticles(
  articleBatch: ArticleForProcessing[]
): Promise<ClassificationResult[]> {
  const articlesText = articleBatch
    .map(
      (a, i) =>
        `[${i}] Título: "${a.title}"\nResumo: "${a.summary || "N/A"}"`
    )
    .join("\n\n");

  const prompt = `Você é um especialista em mídia brasileira e análise política. Analise os seguintes artigos de notícias brasileiras e classifique cada um.

Para cada artigo, forneça:
1. spectrum: classificação no espectro político ("esquerda", "centro-esquerda", "centro", "centro-direita", "direita") - baseado no conteúdo e enquadramento da notícia
2. category: categoria temática ("politica", "economia", "internacional", "esporte", "tecnologia", "geral")
3. confidence: confiança na classificação de 0 a 1

Artigos:
${articlesText}

Responda APENAS com JSON válido no formato:
{"results": [{"spectrum": "...", "category": "...", "confidence": 0.0}, ...]}

Classifique todos os ${articleBatch.length} artigos na mesma ordem.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um analista político especializado em mídia brasileira. Responda apenas com JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "classification_results",
          strict: true,
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    spectrum: {
                      type: "string",
                      enum: [
                        "esquerda",
                        "centro-esquerda",
                        "centro",
                        "centro-direita",
                        "direita",
                      ],
                    },
                    category: {
                      type: "string",
                      enum: [
                        "politica",
                        "economia",
                        "internacional",
                        "esporte",
                        "tecnologia",
                        "geral",
                      ],
                    },
                    confidence: { type: "number" },
                  },
                  required: ["spectrum", "category", "confidence"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(content);
    return parsed.results as ClassificationResult[];
  } catch (error) {
    console.error("[Pipeline] Classification error:", error);
    // Return defaults on error
    return articleBatch.map((a) => ({
      spectrum: (a.spectrum as Spectrum) || "centro",
      category: "geral" as Category,
      confidence: 0.5,
    }));
  }
}

async function groupArticlesIntoTopics(
  articleBatch: ArticleForProcessing[]
): Promise<TopicGroup[]> {
  const articlesText = articleBatch
    .map(
      (a, i) =>
        `[${i}] "${a.title}" (${a.summary?.substring(0, 150) || ""})`
    )
    .join("\n");

  const prompt = `Você é um editor de notícias brasileiro. Analise estes ${articleBatch.length} artigos e agrupe os que cobrem o MESMO evento ou assunto.

Artigos:
${articlesText}

Crie grupos temáticos. Cada grupo deve:
- Ter um título claro e conciso em português
- Ter um resumo de 2-3 frases explicando o evento/assunto
- Incluir os índices dos artigos que pertencem ao grupo
- Ter uma categoria temática

Responda APENAS com JSON válido:
{"groups": [{"title": "...", "summary": "...", "category": "politica|economia|internacional|esporte|tecnologia|geral", "articleIndices": [0, 1, 2]}]}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um editor de notícias especializado em agrupar artigos por tema. Responda apenas com JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "topic_groups",
          strict: true,
          schema: {
            type: "object",
            properties: {
              groups: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: {
                      type: "string",
                      enum: [
                        "politica",
                        "economia",
                        "internacional",
                        "esporte",
                        "tecnologia",
                        "geral",
                      ],
                    },
                    articleIndices: {
                      type: "array",
                      items: { type: "number" },
                    },
                  },
                  required: ["title", "summary", "category", "articleIndices"],
                  additionalProperties: false,
                },
              },
            },
            required: ["groups"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(content);
    return parsed.groups as TopicGroup[];
  } catch (error) {
    console.error("[Pipeline] Grouping error:", error);
    // Fallback: each article is its own topic
    return articleBatch.map((a, i) => ({
      title: a.title,
      summary: a.summary || a.title,
      category: "geral" as Category,
      articleIndices: [i],
    }));
  }
}

function computeSpectrumStats(spectrums: (Spectrum | null)[]) {
  const counts = {
    esquerda: 0,
    "centro-esquerda": 0,
    centro: 0,
    "centro-direita": 0,
    direita: 0,
  };

  for (const s of spectrums) {
    if (s && s in counts) {
      counts[s as keyof typeof counts]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return { counts, pcts: { ...counts }, total: 0 };

  const pcts = {
    esquerda: Math.round((counts.esquerda / total) * 100),
    "centro-esquerda": Math.round((counts["centro-esquerda"] / total) * 100),
    centro: Math.round((counts.centro / total) * 100),
    "centro-direita": Math.round((counts["centro-direita"] / total) * 100),
    direita: Math.round((counts.direita / total) * 100),
  };

  return { counts, pcts, total };
}

function detectBlindspot(pcts: Record<string, number>): {
  isBlindspot: boolean;
  spectrum?: string;
} {
  const BLINDSPOT_THRESHOLD = 70;

  // Check if one side dominates
  const leftTotal = (pcts.esquerda || 0) + (pcts["centro-esquerda"] || 0);
  const rightTotal = (pcts["centro-direita"] || 0) + (pcts.direita || 0);

  if (leftTotal >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "esquerda" };
  }
  if (rightTotal >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "direita" };
  }
  if ((pcts.esquerda || 0) >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "esquerda" };
  }
  if ((pcts.direita || 0) >= BLINDSPOT_THRESHOLD) {
    return { isBlindspot: true, spectrum: "direita" };
  }

  return { isBlindspot: false };
}

export async function runPipeline(): Promise<{
  scraped: number;
  processed: number;
  topicsCreated: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create scrape job record
  const [jobResult] = await db.insert(scrapeJobs).values({
    status: "running",
    startedAt: new Date(),
  });
  const jobId = (jobResult as any).insertId as number;

  let totalScraped = 0;
  let totalProcessed = 0;
  let totalTopicsCreated = 0;
  const errors: string[] = [];

  try {
    // Step 1: Scrape all outlets
    console.log("[Pipeline] Starting scraping...");
    const scrapeResult = await scrapeAllOutlets();
    totalScraped = scrapeResult.scraped;
    errors.push(...scrapeResult.errors);
    console.log(`[Pipeline] Scraped ${totalScraped} articles`);

    // Step 2: Get unprocessed articles
    const unprocessed = await db
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
      .where(eq(articles.processed, false))
      .limit(100);

    if (unprocessed.length === 0) {
      console.log("[Pipeline] No unprocessed articles found");
      await db
        .update(scrapeJobs)
        .set({
          status: "completed",
          articlesScraped: totalScraped,
          articlesProcessed: 0,
          topicsCreated: 0,
          completedAt: new Date(),
        })
        .where(eq(scrapeJobs.id, jobId));
      return { scraped: totalScraped, processed: 0, topicsCreated: 0, errors };
    }

    console.log(
      `[Pipeline] Processing ${unprocessed.length} articles with AI...`
    );

    // Step 3: Get outlet spectrums (fixed classification per outlet — like Ground.news)
    // The spectrum of each article is determined by its outlet's fixed political classification,
    // NOT by the article content. This is the Ground.news model.
    const outletRows = await db.select({
      id: mediaOutlets.id,
      spectrum: mediaOutlets.spectrum,
    }).from(mediaOutlets);
    const outletSpectrumMap = new Map<number, Spectrum>();
    for (const o of outletRows) {
      outletSpectrumMap.set(o.id, o.spectrum as Spectrum);
    }

    // Step 3b: Use LLM only for category classification (NOT spectrum)
    const BATCH_SIZE = 20;
    const classificationMap = new Map<number, ClassificationResult>();

    for (let i = 0; i < unprocessed.length; i += BATCH_SIZE) {
      const batch = unprocessed.slice(i, i + BATCH_SIZE);
      console.log(
        `[Pipeline] Classifying categories for batch ${Math.floor(i / BATCH_SIZE) + 1}...`
      );
      const results = await classifyArticles(batch);

      for (let j = 0; j < batch.length; j++) {
        const article = batch[j];
        const result = results[j];
        if (article && result) {
          // IMPORTANT: Override spectrum with outlet's fixed spectrum
          const outletSpectrum = outletSpectrumMap.get(article.outletId);
          classificationMap.set(article.id, {
            ...result,
            spectrum: outletSpectrum || (article.spectrum as Spectrum) || "centro",
          });
        }
      }
    }

    // Step 4: Group articles into topics
    console.log("[Pipeline] Grouping articles into topics...");
    const topicGroups = await groupArticlesIntoTopics(unprocessed);
    console.log(`[Pipeline] Created ${topicGroups.length} topic groups`);

    // Step 5: Save topics and update articles
    for (const group of topicGroups) {
      const groupArticles = group.articleIndices
        .map((i) => unprocessed[i])
        .filter(Boolean) as ArticleForProcessing[];

      if (groupArticles.length === 0) continue;

      // Get spectrum classifications for this group
      const spectrums = groupArticles.map((a) => {
        const cls = classificationMap.get(a.id);
        return (cls?.spectrum || a.spectrum) as Spectrum | null;
      });

      const stats = computeSpectrumStats(spectrums);
      const blindspot = detectBlindspot(stats.pcts);

      // Get image from first article that has one
      const imageArticle = groupArticles.find((a) => {
        // We'll check DB for image
        return false; // Will be populated from DB
      });

      // Insert topic
      const [topicResult] = await db.insert(topics).values({
        title: group.title.substring(0, 500),
        summary: group.summary,
        category: group.category,
        totalSources: stats.total,
        leftCount: stats.counts.esquerda,
        centerLeftCount: stats.counts["centro-esquerda"],
        centerCount: stats.counts.centro,
        centerRightCount: stats.counts["centro-direita"],
        rightCount: stats.counts.direita,
        leftPct: stats.pcts.esquerda,
        centerLeftPct: stats.pcts["centro-esquerda"],
        centerPct: stats.pcts.centro,
        centerRightPct: stats.pcts["centro-direita"],
        rightPct: stats.pcts.direita,
        isBlindspot: blindspot.isBlindspot,
        blindspotSpectrum: blindspot.spectrum || null,
        trending: stats.total >= 3,
        publishedAt: groupArticles[0]?.publishedAt || new Date(),
      });

      const topicId = (topicResult as any).insertId as number;
      totalTopicsCreated++;

      // Update articles with topicId and classification
      // Spectrum comes from outlet's fixed classification (Ground.news model)
      for (const article of groupArticles) {
        const cls = classificationMap.get(article.id);
        // Use outlet's fixed spectrum (already set in classificationMap from outletSpectrumMap)
        const finalSpectrum = cls?.spectrum || outletSpectrumMap.get(article.outletId) || (article.spectrum as Spectrum) || "centro";
        await db
          .update(articles)
          .set({
            topicId,
            spectrum: finalSpectrum,
            category: cls?.category || "geral",
            spectrumConfidence: 1.0, // 100% confidence since it's outlet-fixed
            processed: true,
          })
          .where(eq(articles.id, article.id));
        totalProcessed++;
      }
    }

    // Update job as completed
    await db
      .update(scrapeJobs)
      .set({
        status: "completed",
        articlesScraped: totalScraped,
        articlesProcessed: totalProcessed,
        topicsCreated: totalTopicsCreated,
        completedAt: new Date(),
      })
      .where(eq(scrapeJobs.id, jobId));

    console.log(
      `[Pipeline] Done. Scraped: ${totalScraped}, Processed: ${totalProcessed}, Topics: ${totalTopicsCreated}`
    );
    return {
      scraped: totalScraped,
      processed: totalProcessed,
      topicsCreated: totalTopicsCreated,
      errors,
    };
  } catch (error) {
    const msg = `Pipeline error: ${error}`;
    console.error(`[Pipeline] ${msg}`);
    errors.push(msg);

    await db
      .update(scrapeJobs)
      .set({
        status: "failed",
        errorMessage: msg,
        completedAt: new Date(),
      })
      .where(eq(scrapeJobs.id, jobId));

    return {
      scraped: totalScraped,
      processed: totalProcessed,
      topicsCreated: totalTopicsCreated,
      errors,
    };
  }
}
