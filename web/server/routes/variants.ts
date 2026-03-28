import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
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
      ORDER BY iv.created_at ASC
    `
    )
    .all();
  res.json(rows);
});

export default router;
