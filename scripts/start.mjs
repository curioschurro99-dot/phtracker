import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (process.env.DATABASE_URL) {
    console.log("[start] Running database migrations...");
    try {
      const migrationsFolder = resolve(__dirname, "..", "drizzle");
      const sql = postgres(process.env.DATABASE_URL, { max: 1 });
      const db = drizzle(sql);
      await migrate(db, { migrationsFolder });
      await sql.end();
      console.log("[start] Migrations complete.");
    } catch (err) {
      console.error("[start] Migration failed:", err);
    }
  }

  console.log("[start] Starting server...");
  await import("../.output/server/index.mjs");
}

main().catch((err) => {
  console.error("[start] Fatal error:", err);
  process.exit(1);
});
