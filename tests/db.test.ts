import { describe, it, expect, afterAll } from "vitest";
import { db, sql } from "../src/db/client.js";

afterAll(async () => {
  await sql.end();
});

describe("Database connection", () => {
  it("connects to Postgres successfully", async () => {
    const result = await sql`SELECT 1 as connected`;
    expect(result[0].connected).toBe(1);
  });
});

describe("Table existence", () => {
  const expectedTables = [
    "ideas",
    "scores",
    "critiques",
    "tags",
    "idea_tags",
    "idea_runs",
    "idea_variants",
  ];

  for (const table of expectedTables) {
    it(`table "${table}" exists`, async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ${table}
        ) as exists
      `;
      expect(result[0].exists).toBe(true);
    });
  }
});

describe("Schema correctness", () => {
  it("ideas table has status column with idea_status enum type", async () => {
    const result = await sql`
      SELECT data_type, udt_name FROM information_schema.columns
      WHERE table_name = 'ideas' AND column_name = 'status'
    `;
    expect(result[0].udt_name).toBe("idea_status");
  });

  it("ideas table has NO embedding column (per D-01/D-02)", async () => {
    const result = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ideas' AND column_name = 'embedding'
    `;
    expect(result).toHaveLength(0);
  });

  it("scores table has all 7 dimension columns plus composite", async () => {
    const result = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'scores' AND column_name IN (
        'novelty', 'usefulness', 'feasibility', 'testability',
        'speed_to_mvp', 'defensibility', 'clarity', 'composite'
      )
    `;
    expect(result).toHaveLength(8);
  });

  it("all foreign keys have ON DELETE CASCADE", async () => {
    const result = await sql`
      SELECT rc.delete_rule
      FROM information_schema.referential_constraints rc
      JOIN information_schema.table_constraints tc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
    `;
    for (const row of result) {
      expect(row.delete_rule).toBe("CASCADE");
    }
  });
});

describe("Seed data", () => {
  it("has at least 3 ideas seeded", async () => {
    const result = await sql`SELECT count(*) as cnt FROM ideas`;
    expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(3);
  });

  it("has at least one shortlisted idea", async () => {
    const result = await sql`SELECT count(*) as cnt FROM ideas WHERE status = 'shortlisted'`;
    expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(1);
  });

  it("has tags seeded", async () => {
    const result = await sql`SELECT count(*) as cnt FROM tags`;
    expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(3);
  });
});

// Suppress unused import warning — db is imported for type checking purposes
void db;
