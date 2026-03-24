import { db, sqlite } from "./client.js";
import { ideas, scores, critiques, tags, ideaTags, ideaRuns } from "./schema.js";

// Insert tags (idempotent via onConflictDoNothing)
const insertedTags = await db
  .insert(tags)
  .values([
    { name: "developer-tools" },
    { name: "ai-ml" },
    { name: "productivity" },
  ])
  .onConflictDoNothing()
  .returning();

// Fetch all tags to get their UUIDs (handles case where they already existed)
const allTags = await db.select().from(tags);
const tagMap = new Map(allTags.map((t) => [t.name, t.id]));

process.stderr.write(
  `[idea-lab] seeded ${insertedTags.length} new tags (${allTags.length} total)\n`,
);

// Insert ideas and capture returned UUIDs
const insertedIdeas = await db
  .insert(ideas)
  .values([
    {
      title: "Code Review Summarizer",
      oneLiner:
        "AI-powered tool that generates concise summaries of pull request changes",
      problem:
        "Code reviews take too long and reviewers miss context",
      solution:
        "Parse PR diffs, generate natural language summaries of changes and their impact",
      domain: "developer-tools",
      status: "raw",
    },
    {
      title: "Dependency Drift Monitor",
      oneLiner:
        "Tracks how far behind your project dependencies are from latest stable versions",
      problem:
        "Projects accumulate outdated dependencies silently until upgrades become painful migrations",
      solution:
        "Background scan of package manifests, scoring drift severity, suggesting safe upgrade paths",
      domain: "developer-tools",
      status: "shortlisted",
    },
    {
      title: "Meeting Action Extractor",
      oneLiner:
        "Extracts action items from meeting transcripts and creates trackable tasks",
      problem:
        "Action items discussed in meetings are forgotten or lost in notes",
      solution:
        "Parse meeting transcripts, identify commitments and deadlines, create structured task objects",
      domain: "productivity",
      status: "raw",
    },
  ])
  .returning();

process.stderr.write(`[idea-lab] seeded ${insertedIdeas.length} ideas\n`);

const [idea1, idea2, idea3] = insertedIdeas;

// Insert scores for ideas 1 and 2
await db.insert(scores).values([
  {
    ideaId: idea1.id,
    novelty: 5.0,
    usefulness: 8.0,
    feasibility: 9.0,
    testability: 8.0,
    speedToMvp: 7.0,
    defensibility: 3.0,
    clarity: 8.0,
    composite: 6.65,
  },
  {
    ideaId: idea2.id,
    novelty: 7.0,
    usefulness: 8.5,
    feasibility: 8.0,
    testability: 7.0,
    speedToMvp: 6.0,
    defensibility: 5.0,
    clarity: 9.0,
    composite: 7.35,
  },
]);

process.stderr.write("[idea-lab] seeded scores\n");

// Insert critique for idea 1
await db.insert(critiques).values([
  {
    ideaId: idea1.id,
    content:
      "This is essentially a wrapper around existing LLM capabilities. Multiple products already offer this including GitHub Copilot's PR summary feature.",
    wrapperProblem:
      "High risk — core functionality is a thin wrapper around LLM summarization",
    existingProducts:
      "GitHub Copilot PR summaries, Coderabbit, Sourcery",
  },
]);

process.stderr.write("[idea-lab] seeded critiques\n");

// Insert tag associations
const developerToolsId = tagMap.get("developer-tools");
const aiMlId = tagMap.get("ai-ml");
const productivityId = tagMap.get("productivity");

if (!developerToolsId || !aiMlId || !productivityId) {
  process.stderr.write("[idea-lab] ERROR: expected tags not found in database\n");
  sqlite.close();
  process.exit(1);
}

await db.insert(ideaTags).values([
  { ideaId: idea1.id, tagId: developerToolsId },
  { ideaId: idea1.id, tagId: aiMlId },
  { ideaId: idea2.id, tagId: developerToolsId },
  { ideaId: idea3.id, tagId: productivityId },
  { ideaId: idea3.id, tagId: aiMlId },
]);

process.stderr.write("[idea-lab] seeded idea_tags\n");

// Insert one idea_run record
await db.insert(ideaRuns).values([
  {
    domain: "developer-tools",
    candidateCount: 5,
    passCount: 2,
  },
]);

process.stderr.write("[idea-lab] seeded idea_runs\n");
process.stderr.write("[idea-lab] seed complete\n");

sqlite.close();
