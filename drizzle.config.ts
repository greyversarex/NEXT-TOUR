import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Таблица "session" создаётся автоматически пакетом connect-pg-simple
  // для хранения Express-сессий. Drizzle не должен её трогать.
  tablesFilter: ["!session"],
});
