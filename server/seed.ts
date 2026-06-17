/**
 * Popula a tabela `media_outlets` a partir da fonte única de verdade
 * (`server/outlets.config.ts`).
 *
 * Idempotente: usa upsert por `slug`, então pode rodar várias vezes com
 * segurança — útil ao adicionar novos veículos ou atualizar metadados.
 *
 * Uso:  pnpm db:seed
 */
import "dotenv/config";
import { getDb } from "./db";
import { mediaOutlets } from "../drizzle/schema";
import { OUTLETS } from "./outlets.config";

export async function seedOutlets(): Promise<{ upserted: number }> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível (DATABASE_URL ausente?)");

  let upserted = 0;
  for (const o of OUTLETS) {
    await db
      .insert(mediaOutlets)
      .values({
        name: o.name,
        slug: o.slug,
        url: o.url,
        spectrum: o.spectrum,
        factuality: o.factuality ?? "alta",
        ownership: o.ownership,
        foundedYear: o.foundedYear,
        description: o.description,
        category: o.category,
        region: o.region,
        language: o.language,
        paywall: o.paywall,
        country: "BR",
        active: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: o.name,
          url: o.url,
          spectrum: o.spectrum,
          factuality: o.factuality ?? "alta",
          ownership: o.ownership,
          foundedYear: o.foundedYear,
          description: o.description,
          category: o.category,
          region: o.region,
          language: o.language,
          paywall: o.paywall,
          active: true,
        },
      });
    upserted++;
  }

  return { upserted };
}

// Executa diretamente quando chamado via `pnpm db:seed` ou `npx tsx server/seed.ts`.
// tsx rewrites import.meta.url so we also check process.argv[1].
const argv1 = process.argv[1] ?? "";
const isMain =
  import.meta.url === `file://${argv1}` ||
  argv1.endsWith("seed.ts") ||
  argv1.endsWith("seed.js");

if (isMain) {
  seedOutlets()
    .then(({ upserted }) => {
      console.log(`[Seed] ${upserted} veículos inseridos/atualizados.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed] Erro:", err);
      process.exit(1);
    });
}
