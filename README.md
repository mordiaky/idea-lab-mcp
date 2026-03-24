# Idea Lab MCP Server

MCP server for structured ideation — generating, scoring, deduplicating, and storing software ideas.

## Overview

Idea Lab is a structured ideation engine that runs as an MCP server. It generates, critiques, scores, deduplicates, and stores software-only ideas using 14 MCP tools. Ideas are persisted locally in SQLite with no cloud dependencies, providing persistent memory across sessions to avoid redundant suggestions and build a ranked idea database over time.

## Quickstart

**Prerequisites:** Node.js >= 22

```bash
git clone <repo-url>
cd idea-lab-mcp
npm install
npm run db:migrate        # Creates ~/.idea-lab/ideas.db automatically
npm run db:seed           # Optional: loads sample ideas
```

**Add as an MCP server (dev mode):**
```bash
claude mcp add idea-lab -- npx tsx src/server.ts
```

**Or build first (production):**
```bash
npm run build
claude mcp add idea-lab -- node build/index.js
```

> Works with any MCP-compatible client. The examples above use the `claude` CLI.

## Configuration

Only one environment variable is supported:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `~/.idea-lab/ideas.db` | Path to SQLite database file |

Copy `.env.example` if you need to customize the database location. The default works for most users without any configuration.

## MCP Tools Reference

### Generation

| Tool | Description |
|------|-------------|
| `idea_lab_generate_ideas` | Batch generate 5-8 candidates using 4 distinct techniques (cross-domain transfer, forced analogy, contradiction search, morphological matrix) |
| `idea_lab_save_idea` | Save a new idea to the database and increment its pass count |
| `idea_lab_mutate_idea` | Create a variant of an existing idea by changing one axis (target_user, scope, tech, or model) |

### Evaluation

| Tool | Description |
|------|-------------|
| `idea_lab_score_idea` | Score an idea on 7 dimensions (novelty, usefulness, feasibility, testability, speedToMvp, defensibility, clarity) with composite calculation |
| `idea_lab_critique_idea` | Run an adversarial critique with 6 finding fields |
| `idea_lab_check_duplicate` | Two-step duplicate detection against stored ideas |

### Retrieval

| Tool | Description |
|------|-------------|
| `idea_lab_search_ideas` | Search ideas by status, domain, score range, tags, or date |
| `idea_lab_get_recent_ideas` | Get the last N created ideas (non-rejected) |
| `idea_lab_resurface_ideas` | Find stale shortlisted ideas that haven't been reviewed in N days |

### Lifecycle

| Tool | Description |
|------|-------------|
| `idea_lab_promote_idea` | Move an idea through lifecycle states (raw → shortlisted → build-next) |
| `idea_lab_delete_idea` | Permanently delete a rejected idea and its related records |
| `idea_lab_mark_revalidated` | Update re_validated_at timestamp after resurfacing an idea |
| `idea_lab_remove_pattern` | Delete a false-positive rejection pattern |

### Planning

| Tool | Description |
|------|-------------|
| `idea_lab_generate_action_plan` | Two-step: fetch idea content then save 3-5 MVP steps with tech stack |

## MCP Resources

- `idea-lab://rubric` — Scoring rubric (dimensions, weights, thresholds, anchors)
- `idea-lab://software-only-constraints` — Software-only enforcement criteria
- `idea-lab://recent-ideas` — Last 20 non-rejected ideas
- `idea-lab://top-rated-ideas` — Top 10 shortlisted and build-next ideas
- `idea-lab://rejection-patterns` — Anti-patterns with frequency and last-seen data
- `idea-lab://portfolio-overview` — Domain distribution, average scores, and gaps
- `idea-lab://idea-lineage/{ideaId}` — Parent-child mutation tree for a given idea

## MCP Prompts

- `brainstorm_problem_first` — Ideate around a specific problem and optional domain
- `criticize_idea_harshly` — Adversarial critique for a given idea
- `convert_idea_to_mvp_spec` — Convert a shortlisted idea to an MVP spec
- `generate_code_only_ideas` — Generate code-only ideas for a domain

## Idea Lifecycle

```
raw → shortlisted → build-next
         ↓               ↓
      rejected        rejected
```

`rejected` is a terminal state reachable from any stage.

## Development

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Run with tsx (no build step) |
| Build | `npm run build` | Compile TypeScript to build/ |
| Test | `npm test` | Run vitest test suite |
| Lint | `npm run lint` | ESLint on src/ |
| Format | `npm run format` | Prettier on src/ |
| Generate migrations | `npm run db:generate` | Generate SQL from schema changes |
| Apply migrations | `npm run db:migrate` | Apply pending migrations |
| Seed database | `npm run db:seed` | Load sample data |

## Architecture

```
src/
  server.ts       — Entry point, MCP server setup
  config.ts       — DB path and environment config
  config/         — Load JSON configs (rubric, constraints, techniques, prompts)
  db/             — Schema definition, client, migrations, seed script
  tools/          — 14 MCP tool handlers
  services/       — Business logic (generation, scoring, critique, dedup, retrieval, etc.)
  resources/      — 7 MCP resource handlers
  prompts/        — 4 MCP prompt handlers
config/
  rubric.json           — Scoring dimensions, weights, anchors
  constraints.json      — Software-only enforcement rules
  techniques.json       — Ideation technique templates
  prompts.json          — Prompt templates
```

Database: SQLite at `~/.idea-lab/ideas.db` (8 tables: ideas, scores, critiques, tags, idea_tags, idea_runs, idea_variants, rejection_patterns)

## License

ISC
