import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// All outlets
const [all] = await conn.execute(
  "SELECT id, slug, name, active FROM media_outlets ORDER BY id"
);
console.log("Total:", all.length);
all.forEach((r) => console.log(r.id, r.slug, r.name, r.active ? "active" : "inactive"));

await conn.end();
process.exit(0);
