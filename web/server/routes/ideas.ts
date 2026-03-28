import { Router } from "express";
import { db, getWritableDb } from "../db.js";

const router = Router();

const VALID_STATUSES = ["raw", "shortlisted", "build-next", "rejected"] as const;
type Status = (typeof VALID_STATUSES)[number];

router.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
        i.id,
        i.title,
        i.one_liner AS oneLiner,
        i.domain,
        i.status,
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
      ORDER BY i.created_at DESC
    `
    )
    .all();
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const idea = db
    .prepare(`SELECT * FROM ideas WHERE id = ?`)
    .get(req.params.id) as Record<string, unknown> | undefined;

  if (!idea) {
    res.status(404).json({ error: "Idea not found" });
    return;
  }

  const score = db
    .prepare(
      `SELECT * FROM scores WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(req.params.id);

  const critique = db
    .prepare(
      `SELECT * FROM critiques WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(req.params.id);

  const tags = db
    .prepare(
      `SELECT t.name FROM tags t JOIN idea_tags it ON it.tag_id = t.id WHERE it.idea_id = ?`
    )
    .all(req.params.id) as { name: string }[];

  const variants = db
    .prepare(
      `SELECT * FROM idea_variants WHERE parent_id = ? OR idea_id = ?`
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

router.patch("/:id/status", (req, res) => {
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
      .prepare(
        `UPDATE ideas SET status = ?, updated_at = ? WHERE id = ?`
      )
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

export default router;
