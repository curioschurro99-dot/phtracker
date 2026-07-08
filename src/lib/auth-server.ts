import { betterAuth } from "better-auth";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

const sqlite = new DatabaseSync(path.join(DATA_DIR, "auth.db"));

sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA synchronous = normal");

export const auth = betterAuth({
  database: sqlite,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookie: {
      name: "phtracker.session",
    },
  },
});
