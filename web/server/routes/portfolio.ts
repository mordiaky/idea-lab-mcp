import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
        COALESCE(i.domain, 'Unknown') AS domain,
        COUNT(*) AS count,
        ROUND(AVG(s.composite), 2) AS avgComposite,
        SUM(CASE WHEN i.status = 'raw' THEN 1 ELSE 0 END) AS raw,
        SUM(CASE WHEN i.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
        SUM(CASE WHEN i.status = 'build-next' THEN 1 ELSE 0 END) AS buildNext,
        SUM(CASE WHEN i.status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM ideas i
      LEFT JOIN (
        SELECT idea_id, composite, ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY created_at DESC) AS rn
        FROM scores
      ) s ON s.idea_id = i.id AND s.rn = 1
      GROUP BY COALESCE(i.domain, 'Unknown')
      ORDER BY count DESC
    `
    )
    .all() as Array<{
    domain: string;
    count: number;
    avgComposite: number | null;
    raw: number;
    shortlisted: number;
    buildNext: number;
    rejected: number;
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
    },
  }));

  res.json(result);
});

export default router;
