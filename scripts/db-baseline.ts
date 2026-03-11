/**
 * db-baseline.ts
 *
 * Запусти ОДИН РАЗ на сервере где база уже существует (создана через db:push).
 * Регистрирует начальную миграцию как «уже применённую» — без выполнения SQL.
 * После этого все новые изменения схемы деплоятся через drizzle-kit migrate.
 *
 * Использование:
 *   npx tsx scripts/db-baseline.ts
 */

import { Pool } from "pg";
import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

async function baseline() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌  DATABASE_URL не задан");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // 1. Создаём схему и таблицу для отслеживания миграций (если нет)
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${MIGRATIONS_SCHEMA}"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (
        id        SERIAL PRIMARY KEY,
        hash      TEXT NOT NULL,
        created_at BIGINT
      )
    `);

    // 2. Читаем журнал миграций
    const journalPath = join(process.cwd(), "migrations", "meta", "_journal.json");
    if (!existsSync(journalPath)) {
      console.error("❌  migrations/meta/_journal.json не найден. Сначала запусти: npx drizzle-kit generate");
      process.exit(1);
    }

    const journal = JSON.parse(readFileSync(journalPath, "utf-8"));

    let applied = 0;
    let skipped = 0;

    for (const entry of journal.entries) {
      const sqlPath = join(process.cwd(), "migrations", `${entry.tag}.sql`);
      if (!existsSync(sqlPath)) {
        console.warn(`⚠️  Файл миграции не найден: ${entry.tag}.sql — пропускаем`);
        skipped++;
        continue;
      }

      const sql = readFileSync(sqlPath, "utf-8");
      const hash = crypto.createHash("sha256").update(sql).digest("hex");

      // Проверяем — не зарегистрирована ли уже эта миграция
      const { rows } = await pool.query(
        `SELECT id FROM "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" WHERE hash = $1`,
        [hash]
      );

      if (rows.length > 0) {
        console.log(`✓  ${entry.tag} — уже зарегистрирована, пропускаем`);
        skipped++;
        continue;
      }

      // Регистрируем как применённую (без выполнения SQL)
      await pool.query(
        `INSERT INTO "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (hash, created_at) VALUES ($1, $2)`,
        [hash, entry.when]
      );

      console.log(`✅  ${entry.tag} — зарегистрирована как применённая`);
      applied++;
    }

    console.log(`\nГотово: зарегистрировано ${applied}, пропущено ${skipped}`);
    console.log("Теперь все новые миграции применяй через: npx drizzle-kit migrate");

  } catch (err) {
    console.error("❌  Ошибка:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

baseline();
