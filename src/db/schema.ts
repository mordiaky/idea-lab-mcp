import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// valid: 'raw' | 'shortlisted' | 'build-next' | 'rejected'
// valid: 'pass' | 'weak' | 'reject'

export const ideas = sqliteTable("ideas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  oneLiner: text("one_liner").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  whyNow: text("why_now"),
  targetUser: text("target_user"),
  constraints: text("constraints"),
  risks: text("risks"),
  mvpSteps: text("mvp_steps"),
  domain: text("domain"),
  status: text("status").notNull().default("raw"), // valid: 'raw' | 'shortlisted' | 'build-next' | 'rejected'
  reValidatedAt: text("re_validated_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const scores = sqliteTable("scores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ideaId: text("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  novelty: real("novelty").notNull(),
  usefulness: real("usefulness").notNull(),
  feasibility: real("feasibility").notNull(),
  testability: real("testability").notNull(),
  speedToMvp: real("speed_to_mvp").notNull(),
  defensibility: real("defensibility").notNull(),
  clarity: real("clarity").notNull(),
  composite: real("composite").notNull(),
  noveltyReasoning: text("novelty_reasoning"),
  usefulnessReasoning: text("usefulness_reasoning"),
  feasibilityReasoning: text("feasibility_reasoning"),
  testabilityReasoning: text("testability_reasoning"),
  speedToMvpReasoning: text("speed_to_mvp_reasoning"),
  defensibilityReasoning: text("defensibility_reasoning"),
  clarityReasoning: text("clarity_reasoning"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const critiques = sqliteTable("critiques", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ideaId: text("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  wrapperProblem: text("wrapper_problem"),
  existingProducts: text("existing_products"),
  fragileDependencies: text("fragile_dependencies"),
  vagueStatement: text("vague_statement"),
  violatesSoftwareOnly: text("violates_software_only"),
  overallVerdict: text("overall_verdict"), // valid: 'pass' | 'weak' | 'reject'
  verdictReasoning: text("verdict_reasoning"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const tags = sqliteTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const ideaTags = sqliteTable(
  "idea_tags",
  {
    ideaId: text("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (ideaTags) => [primaryKey({ columns: [ideaTags.ideaId, ideaTags.tagId] })],
);

export const ideaRuns = sqliteTable("idea_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  domain: text("domain"),
  candidateCount: integer("candidate_count").notNull(),
  passCount: integer("pass_count").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const ideaVariants = sqliteTable("idea_variants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  ideaId: text("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  mutationAxis: text("mutation_axis"),
  mutationDepth: integer("mutation_depth").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const rejectionPatterns = sqliteTable("rejection_patterns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  patternText: text("pattern_text").notNull().unique(),
  sourceCritiqueId: text("source_critique_id").references(
    () => critiques.id,
    { onDelete: "set null" },
  ),
  frequencyCount: integer("frequency_count").notNull().default(1),
  lastSeen: text("last_seen")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;
export type Critique = typeof critiques.$inferSelect;
export type NewCritique = typeof critiques.$inferInsert;
export type RejectionPattern = typeof rejectionPatterns.$inferSelect;
export type NewRejectionPattern = typeof rejectionPatterns.$inferInsert;
