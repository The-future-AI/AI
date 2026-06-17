import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute(
  "SELECT id, slug, name FROM media_outlets ORDER BY slug, id"
);
console.log("Total rows:", rows.length);

// Find duplicates
const slugMap = {};
for (const r of rows) {
  if (!slugMap[r.slug]) slugMap[r.slug] = [];
  slugMap[r.slug].push(r.id);
}
const dupes = Object.entries(slugMap).filter(([, ids]) => ids.length > 1);
console.log("Duplicate slugs:", dupes.length);
dupes.forEach(([slug, ids]) => console.log(" ", slug, ids));

// Delete older duplicates (keep highest id = most recent upsert)
for (const [slug, ids] of dupes) {
  const keepId = Math.max(...ids);
  const deleteIds = ids.filter((id) => id !== keepId);
  await conn.execute(
    `DELETE FROM media_outlets WHERE id IN (${deleteIds.join(",")})`,
  );
  console.log(`Deleted old ${slug} ids: ${deleteIds}`);
}

const [after] = await conn.execute(
  "SELECT COUNT(*) as total FROM media_outlets"
);
console.log("Final count:", after[0].total);
await conn.end();
process.exit(0);
