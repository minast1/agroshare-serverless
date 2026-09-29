/**
 * migrate-local-groups.ts
 *
 * Reads raw SQL migration files produced by Drizzle (`drizzle-kit generate`)
 * and applies them to every child database (*.db) in the matching local Turso group.
 *
 * Each group has its own migrations directory:
 *   migrations/cooperative/  → .turso-local/group-cooperative/*.db
 *   migrations/fleet/        → .turso-local/group-fleet/*.db
 *   migrations/coldchain/    → .turso-local/group-coldchain/*.db
 *
 * Usage:
 *   npx tsx scripts/migrate-local-groups.ts                  # all groups
 *   npx tsx scripts/migrate-local-groups.ts --group fleet    # single group
 *   npx tsx scripts/migrate-local-groups.ts --dry-run        # preview only
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@tursodatabase/serverless/compat";

// ── Paths ────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, "..");
const TURSO_LOCAL_DIR = resolve(PKG_ROOT, ".turso-local");
const MIGRATIONS_ROOT = resolve(PKG_ROOT, "migrations");

const GROUPS = ["cooperative", "fleet", "coldchain"] as const;
type Group = (typeof GROUPS)[number];

function isGroup(value: unknown): value is Group {
  return typeof value === "string" && (GROUPS as readonly string[]).includes(value);
}

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const groupFlagIdx = args.indexOf("--group");
const rawGroup = groupFlagIdx !== -1 ? args[groupFlagIdx + 1] : undefined;

if (rawGroup !== undefined && !isGroup(rawGroup)) {
  console.error(`❌ Unknown group "${rawGroup}". Valid groups: ${GROUPS.join(", ")}`);
  process.exit(1);
}

const targetGroup: Group | undefined = isGroup(rawGroup) ? rawGroup : undefined;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Collect *.sql files from a group's migrations directory, sorted alphabetically. */
function getMigrationFiles(group: Group): string[] {
  const dir = join(MIGRATIONS_ROOT, group);
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(dir, f));
}

/** Return all *.db files within a group's local directory. */
function getChildDatabases(group: Group): string[] {
  const groupDir = join(TURSO_LOCAL_DIR, `group-${group}`);
  if (!existsSync(groupDir)) {
    return [];
  }

  return readdirSync(groupDir)
    .filter((f) => f.endsWith(".db"))
    .map((f) => join(groupDir, f));
}

/** Apply a single SQL migration file to a single database. */
async function applyMigration(dbPath: string, sqlFilePath: string): Promise<void> {
  const sql = readFileSync(sqlFilePath, "utf-8").trim();
  if (!sql) return;

  const client = createClient({ url: `file:${dbPath}` });

  // Split on Drizzle's statement-break marker: --> statement-breakpoint
  // This handles multi-statement migration files correctly.
  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  client.close();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const groupsToMigrate = targetGroup ? [targetGroup] : [...GROUPS];

  if (!existsSync(TURSO_LOCAL_DIR)) {
    console.error(`❌ Turso local directory not found: ${TURSO_LOCAL_DIR}`);
    process.exit(1);
  }

  if (dryRun) console.log(`\n🔍 DRY RUN — no changes will be applied.\n`);

  let totalApplied = 0;

  for (const group of groupsToMigrate) {
    const migrationFiles = getMigrationFiles(group);
    const childDbs = getChildDatabases(group);

    console.log(`\n━━━ group-${group} ━━━`);

    // Check for migrations
    if (migrationFiles.length === 0) {
      const migrationsDir = join(MIGRATIONS_ROOT, group);
      if (!existsSync(migrationsDir)) {
        console.log(`   ⚠️  No migrations directory found at: migrations/${group}/`);
        console.log(`      Run "pnpm drizzle:generate:${group}" first.`);
      } else {
        console.log(`   ⚠️  No .sql migration files found.`);
      }
      continue;
    }

    console.log(`   📄 ${migrationFiles.length} migration(s):`);
    for (const f of migrationFiles) {
      console.log(`      - ${basename(f)}`);
    }

    // Check for child databases
    if (childDbs.length === 0) {
      console.log(`   ⚠️  No child databases (*.db) in .turso-local/group-${group}/ — skipping.`);
      continue;
    }

    // Apply migrations to each child database
    for (const dbPath of childDbs) {
      const dbName = basename(dbPath);
      console.log(`   📦 ${dbName}`);

      for (const sqlFile of migrationFiles) {
        const migrationName = basename(sqlFile);

        if (dryRun) {
          console.log(`      ↪ (dry-run) would apply: ${migrationName}`);
        } else {
          try {
            await applyMigration(dbPath, sqlFile);
            console.log(`      ✅ ${migrationName}`);
            totalApplied++;
          } catch (err) {
            console.error(`      ❌ FAILED: ${migrationName}`);
            console.error(`         ${(err as Error).message}`);
          }
        }
      }
    }
  }

  if (!dryRun) {
    console.log(`\n✨ Done! Applied ${totalApplied} migration(s) total.\n`);
  } else {
    console.log(`\n✨ Dry run complete.\n`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
