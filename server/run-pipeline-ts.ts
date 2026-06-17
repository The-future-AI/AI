/**
 * Script de teste local — dispara o pipeline de scraping diretamente.
 * Uso: npx tsx server/run-pipeline-ts.ts
 */
import { runPipeline } from "./pipeline";

console.log("=".repeat(60));
console.log("[Pipeline] Iniciando execução manual...");
console.log("[Pipeline] Timestamp:", new Date().toISOString());
console.log("=".repeat(60));

runPipeline()
  .then((result) => {
    console.log("=".repeat(60));
    console.log("[Pipeline] Concluído com sucesso!");
    console.log("[Pipeline] Resultado:", JSON.stringify(result, null, 2));
    console.log("=".repeat(60));
    process.exit(0);
  })
  .catch((err) => {
    console.error("=".repeat(60));
    console.error("[Pipeline] ERRO:", err);
    console.error("=".repeat(60));
    process.exit(1);
  });
