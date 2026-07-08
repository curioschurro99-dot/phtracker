import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "..", ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file not found, skip
}

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
