import "dotenv/config";
import { seedOutlets } from "./seed";

seedOutlets()
  .then(({ upserted }) => {
    console.log(`[Seed] ${upserted} veículos inseridos/atualizados.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Seed] Erro:", err);
    process.exit(1);
  });
