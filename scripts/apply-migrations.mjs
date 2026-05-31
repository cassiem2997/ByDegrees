import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const cwd = process.cwd();
const migrationsDir = path.join(cwd, "migrations");
const isStatusOnly = process.argv.includes("--status");

async function loadEnvFile(filename) {
  try {
    const content = await fs.readFile(path.join(cwd, filename), "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] ??= value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function main() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("supabase.co") || databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined
  });

  await client.connect();

  try {
    await client.query(`
      create table if not exists schema_migrations (
        id serial primary key,
        filename text not null unique,
        executed_at timestamptz not null default now()
      )
    `);

    const appliedRows = await client.query(
      "select filename from schema_migrations order by filename asc"
    );
    const applied = new Set(appliedRows.rows.map((row) => row.filename));

    const migrationFiles = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (isStatusOnly) {
      for (const file of migrationFiles) {
        console.log(`${applied.has(file) ? "applied" : "pending"}  ${file}`);
      }
      return;
    }

    for (const file of migrationFiles) {
      if (applied.has(file)) {
        console.log(`skip ${file}`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      console.log(`apply ${file}`);

      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(
          "insert into schema_migrations (filename) values ($1)",
          [file]
        );
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
