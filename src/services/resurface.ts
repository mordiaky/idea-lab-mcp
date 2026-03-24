import { db } from "../db/client.js";
import { ideas, scores, critiques, ideaTags, tags } from "../db/schema.js";
import { eq, lt, desc, and } from "drizzle-orm";
import { getTopPatterns } from "./rejection-patterns.js";
import { getPortfolioOverview } from "./portfolio.js";

export interface ResurfaceCandidate {
  id: string;
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  whyNow: string | null;
  targetUser: string | null;
  domain: string | null;
  status: string;
  createdAt: string;
  reValidatedAt: string | null;
  latestScore: {
    composite: number;
    novelty: number;
    usefulness: number;
    feasibility: number;
  } | null;
  latestCritique: {
    content: string;
    overallVerdict: string | null;
    verdictReasoning: string | null;
    wrapperProblem: string | null;
    existingProducts: string | null;
    fragileDependencies: string | null;
    vagueStatement: string | null;
  } | null;
  tags: string[];
}

export interface ResurfaceResult {
  candidates: ResurfaceCandidate[];
  rejectionPatterns: Array<{
    id: string;
    patternText: string;
    frequencyCount: number;
    lastSeen: string;
  }>;
  portfolioGaps: string[];
  instructions: string;
}

/**
 * Queries shortlisted ideas older than daysOld days for re-evaluation.
 * Includes latest critique, score, current rejection patterns, and portfolio gaps.
 * Caps at 5 ideas per call.
 */
export async function getResurfaceCandidates(
  daysOld: number = 14,
  limit: number = 5,
): Promise<ResurfaceResult> {
  const clampedLimit = Math.min(limit, 5);
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

  // Fetch shortlisted ideas older than cutoff, oldest first
  const ideaRows = await db
    .select({
      id: ideas.id,
      title: ideas.title,
      oneLiner: ideas.oneLiner,
      problem: ideas.problem,
      solution: ideas.solution,
      whyNow: ideas.whyNow,
      targetUser: ideas.targetUser,
      domain: ideas.domain,
      status: ideas.status,
      createdAt: ideas.createdAt,
      reValidatedAt: ideas.reValidatedAt,
    })
    .from(ideas)
    .where(and(eq(ideas.status, "shortlisted"), lt(ideas.createdAt, cutoffDate)))
    .orderBy(ideas.createdAt)
    .limit(clampedLimit);

  // Enrich each idea with latest critique, score, and tags
  const candidates: ResurfaceCandidate[] = await Promise.all(
    ideaRows.map(async (idea) => {
      // Latest score
      const scoreRows = await db
        .select({
          composite: scores.composite,
          novelty: scores.novelty,
          usefulness: scores.usefulness,
          feasibility: scores.feasibility,
        })
        .from(scores)
        .where(eq(scores.ideaId, idea.id))
        .orderBy(desc(scores.createdAt))
        .limit(1);

      const latestScore = scoreRows.length > 0 ? scoreRows[0] : null;

      // Latest critique
      const critiqueRows = await db
        .select({
          content: critiques.content,
          overallVerdict: critiques.overallVerdict,
          verdictReasoning: critiques.verdictReasoning,
          wrapperProblem: critiques.wrapperProblem,
          existingProducts: critiques.existingProducts,
          fragileDependencies: critiques.fragileDependencies,
          vagueStatement: critiques.vagueStatement,
        })
        .from(critiques)
        .where(eq(critiques.ideaId, idea.id))
        .orderBy(desc(critiques.createdAt))
        .limit(1);

      const latestCritique = critiqueRows.length > 0 ? critiqueRows[0] : null;

      // Tags
      const tagRows = await db
        .select({ name: tags.name })
        .from(ideaTags)
        .innerJoin(tags, eq(tags.id, ideaTags.tagId))
        .where(eq(ideaTags.ideaId, idea.id));

      const ideaTagNames = tagRows.map((t) => t.name);

      return {
        ...idea,
        latestScore,
        latestCritique,
        tags: ideaTagNames,
      };
    }),
  );

  // Get current rejection patterns and portfolio gaps
  const rejectionPatterns = await getTopPatterns(5);
  const portfolio = await getPortfolioOverview();

  return {
    candidates,
    rejectionPatterns,
    portfolioGaps: portfolio.gaps,
    instructions:
      "For each candidate: re-run critique_idea with fresh web search to check for new competitors, check against rejection patterns, compare to portfolio gaps. Do NOT re-score — historical scores are preserved. Call idea_lab_mark_revalidated for each idea after review.",
  };
}

/**
 * Updates the re_validated_at timestamp for an idea after resurface review.
 * Does NOT change status or scores.
 */
export async function markRevalidated(
  ideaId: string,
): Promise<{ ideaId: string; reValidatedAt: string } | { error: string }> {
  const rows = await db
    .select({ id: ideas.id })
    .from(ideas)
    .where(eq(ideas.id, ideaId));

  if (rows.length === 0) {
    return { error: "Idea not found" };
  }

  const reValidatedAt = new Date().toISOString();
  await db
    .update(ideas)
    .set({ reValidatedAt })
    .where(eq(ideas.id, ideaId));

  console.error(`[resurface] Marked idea ${ideaId} as revalidated at ${reValidatedAt}`);

  return { ideaId, reValidatedAt };
}
