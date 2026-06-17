/**
 * Desativa outlets legados (ids < 30000 e slugs com hífen que são duplicatas
 * dos slugs canônicos do config de 46) para que o sistema exiba apenas os
 * 46 outlets canônicos.
 *
 * Slugs canônicos do outlets.config.ts (46 total) — slugs sem hífen.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const CANONICAL_SLUGS = [
  "brasildefato","cartacapital","intercept","brasil247","revistaforum","dcm",
  "folha","oglobo","apublica","nexo","elpaisbrasil","congressoemfoco","g1",
  "uol","bbcbrasil","metropoles","cnnbrasil","istoe","correiobraziliense",
  "gzh","estadodeminas","opovo","dwbrasil","brazilianreport","estadao","veja",
  "poder360","exame","infomoney","jota","r7","gazetadopovo","jovempan",
  "oantagonista","revistaoeste","plenonews","aosfatos","lupa","comprova",
  "afpchecamos","fatooufake","boatos","agenciabrasil","agenciasenado",
  "agenciacamara","tse",
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Deactivate all non-canonical outlets
const [all] = await conn.execute(
  "SELECT id, slug FROM media_outlets"
);

let deactivated = 0;
for (const row of all) {
  if (!CANONICAL_SLUGS.includes(row.slug)) {
    await conn.execute(
      "UPDATE media_outlets SET active = 0 WHERE id = ?",
      [row.id]
    );
    console.log(`Deactivated: ${row.slug} (id ${row.id})`);
    deactivated++;
  }
}

const [count] = await conn.execute(
  "SELECT COUNT(*) as total FROM media_outlets WHERE active = 1"
);
console.log(`\nDeactivated ${deactivated} legacy outlets.`);
console.log(`Active outlets: ${count[0].total}`);
await conn.end();
process.exit(0);
