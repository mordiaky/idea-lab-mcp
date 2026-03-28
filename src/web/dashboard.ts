import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WEB_PORT = parseInt(process.env.IDEA_LAB_WEB_PORT ?? "3001", 10);

const dbPath =
  process.env.IDEA_LAB_DB ??
  path.join(os.homedir(), ".idea-lab", "ideas.db");

let db: Database.Database;
function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
  }
  return db;
}

function getWritableDb(): Database.Database {
  return new Database(dbPath);
}

const VALID_STATUSES = [
  "raw", "shortlisted", "build-next", "rejected",
  "in-progress", "completed", "needs-revision",
] as const;

type Status = (typeof VALID_STATUSES)[number];

export function startDashboard(): void {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // GET /api/ideas
  app.get("/api/ideas", (_req, res) => {
    const rows = getDb()
      .prepare(
        `SELECT
          i.id, i.title,
          i.one_liner AS oneLiner,
          i.domain, i.status,
          s.composite,
          c.overall_verdict AS overallVerdict,
          i.created_at AS createdAt
        FROM ideas i
        LEFT JOIN (
          SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
          FROM scores
        ) s ON s.idea_id = i.id AND s.rn = 1
        LEFT JOIN (
          SELECT idea_id, overall_verdict, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
          FROM critiques
        ) c ON c.idea_id = i.id AND c.rn = 1
        ORDER BY i.created_at DESC`
      )
      .all();
    res.json(rows);
  });

  // GET /api/ideas/:id
  app.get("/api/ideas/:id", (req, res) => {
    const idea = getDb()
      .prepare(
        `SELECT
          id, title,
          one_liner AS oneLiner,
          problem, solution,
          why_now AS whyNow,
          target_user AS targetUser,
          constraints, risks,
          mvp_steps AS mvpSteps,
          domain, status,
          re_validated_at AS reValidatedAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ideas WHERE id = ?`
      )
      .get(req.params.id) as Record<string, unknown> | undefined;

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    const score = getDb()
      .prepare(
        `SELECT
          id, idea_id AS ideaId,
          novelty, usefulness, feasibility, testability,
          speed_to_mvp AS speedToMvp,
          defensibility, clarity, composite,
          novelty_reasoning AS noveltyReasoning,
          usefulness_reasoning AS usefulnessReasoning,
          feasibility_reasoning AS feasibilityReasoning,
          testability_reasoning AS testabilityReasoning,
          speed_to_mvp_reasoning AS speedToMvpReasoning,
          defensibility_reasoning AS defensibilityReasoning,
          clarity_reasoning AS clarityReasoning,
          created_at AS createdAt
        FROM scores WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1`
      )
      .get(req.params.id);

    const critique = getDb()
      .prepare(
        `SELECT
          id, idea_id AS ideaId,
          content,
          wrapper_problem AS wrapperProblem,
          existing_products AS existingProducts,
          fragile_dependencies AS fragileDependencies,
          vague_statement AS vagueStatement,
          violates_software_only AS violatesSoftwareOnly,
          overall_verdict AS overallVerdict,
          verdict_reasoning AS verdictReasoning,
          created_at AS createdAt
        FROM critiques WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1`
      )
      .get(req.params.id);

    const tags = getDb()
      .prepare(
        `SELECT t.name FROM tags t JOIN idea_tags it ON it.tag_id = t.id WHERE it.idea_id = ?`
      )
      .all(req.params.id) as { name: string }[];

    const variants = getDb()
      .prepare(
        `SELECT
          iv.id,
          iv.parent_id AS parentId,
          iv.idea_id AS ideaId,
          iv.mutation_axis AS mutationAxis,
          iv.mutation_depth AS mutationDepth,
          p.title AS parentTitle,
          p.status AS parentStatus,
          c.title AS childTitle,
          c.status AS childStatus,
          ps.composite AS parentScore,
          cs.composite AS childScore
        FROM idea_variants iv
        JOIN ideas p ON p.id = iv.parent_id
        JOIN ideas c ON c.id = iv.idea_id
        LEFT JOIN (SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn FROM scores) ps ON ps.idea_id = iv.parent_id AND ps.rn = 1
        LEFT JOIN (SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn FROM scores) cs ON cs.idea_id = iv.idea_id AND cs.rn = 1
        WHERE iv.parent_id = ? OR iv.idea_id = ?`
      )
      .all(req.params.id, req.params.id);

    res.json({
      ...idea,
      score,
      critique,
      tags: tags.map((t) => t.name),
      variants,
    });
  });

  // PATCH /api/ideas/:id/status
  app.patch("/api/ideas/:id/status", (req, res) => {
    const { status } = req.body as { status: unknown };

    if (!status || !VALID_STATUSES.includes(status as Status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const writable = getWritableDb();
    try {
      const result = writable
        .prepare(`UPDATE ideas SET status = ?, updated_at = ? WHERE id = ?`)
        .run(status, new Date().toISOString(), req.params.id);

      if (result.changes === 0) {
        res.status(404).json({ error: "Idea not found" });
        return;
      }

      res.json({ success: true, id: req.params.id, status });
    } finally {
      writable.close();
    }
  });

  // GET /api/variants
  app.get("/api/variants", (_req, res) => {
    const rows = getDb()
      .prepare(
        `SELECT
          iv.id,
          iv.parent_id AS parentId,
          pi.title AS parentTitle,
          iv.idea_id AS ideaId,
          ci.title AS childTitle,
          iv.mutation_axis AS mutationAxis,
          iv.mutation_depth AS mutationDepth,
          pi.status AS parentStatus,
          ci.status AS childStatus,
          ps.composite AS parentScore,
          cs.composite AS childScore
        FROM idea_variants iv
        JOIN ideas pi ON pi.id = iv.parent_id
        JOIN ideas ci ON ci.id = iv.idea_id
        LEFT JOIN (
          SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
          FROM scores
        ) ps ON ps.idea_id = iv.parent_id AND ps.rn = 1
        LEFT JOIN (
          SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
          FROM scores
        ) cs ON cs.idea_id = iv.idea_id AND cs.rn = 1
        ORDER BY iv.created_at ASC`
      )
      .all();
    res.json(rows);
  });

  // GET /api/portfolio
  app.get("/api/portfolio", (_req, res) => {
    const rows = getDb()
      .prepare(
        `SELECT
          COALESCE(i.domain, 'Unknown') AS domain,
          COUNT(*) AS count,
          ROUND(AVG(s.composite), 2) AS avgComposite,
          SUM(CASE WHEN i.status = 'raw' THEN 1 ELSE 0 END) AS raw,
          SUM(CASE WHEN i.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
          SUM(CASE WHEN i.status = 'build-next' THEN 1 ELSE 0 END) AS buildNext,
          SUM(CASE WHEN i.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
          SUM(CASE WHEN i.status = 'in-progress' THEN 1 ELSE 0 END) AS inProgress,
          SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN i.status = 'needs-revision' THEN 1 ELSE 0 END) AS needsRevision
        FROM ideas i
        LEFT JOIN (
          SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
          FROM scores
        ) s ON s.idea_id = i.id AND s.rn = 1
        GROUP BY COALESCE(i.domain, 'Unknown')
        ORDER BY count DESC`
      )
      .all() as Array<{
      domain: string;
      count: number;
      avgComposite: number | null;
      raw: number;
      shortlisted: number;
      buildNext: number;
      rejected: number;
      inProgress: number;
      completed: number;
      needsRevision: number;
    }>;

    const result = rows.map((r) => ({
      domain: r.domain,
      count: r.count,
      avgComposite: r.avgComposite ?? 0,
      statusBreakdown: {
        raw: r.raw,
        shortlisted: r.shortlisted,
        buildNext: r.buildNext,
        rejected: r.rejected,
        inProgress: r.inProgress,
        completed: r.completed,
        needsRevision: r.needsRevision,
      },
    }));

    res.json(result);
  });

  // --- Serve static frontend ---
  // In dev: web/dist after `npm run build:web`
  // In production (npm package): build/web/dist
  const distPaths = [
    path.resolve(__dirname, "../../web/dist"),       // dev: from src/web/
    path.resolve(__dirname, "../web/dist"),           // built: from build/web/
    path.resolve(__dirname, "../../dist"),            // fallback
  ];

  let staticDir: string | null = null;
  for (const p of distPaths) {
    if (fs.existsSync(p)) {
      staticDir = p;
      break;
    }
  }

  if (staticDir) {
    app.use(express.static(staticDir));
    // SPA fallback — serve index.html for any non-API route
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticDir!, "index.html"));
    });
  }

  const httpServer = app.listen(WEB_PORT, () => {
    process.stderr.write(`[idea-lab] dashboard available at http://localhost:${WEB_PORT}\n`);
  });

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      process.stderr.write(
        `[idea-lab] dashboard port ${WEB_PORT} already in use — skipping. Set IDEA_LAB_WEB_PORT to use a different port.\n`
      );
    } else {
      process.stderr.write(`[idea-lab] dashboard error: ${err.message}\n`);
    }
  });
}
