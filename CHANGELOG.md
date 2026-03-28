# Changelog

All notable changes to Idea Lab MCP are documented here.

## [1.1.0] - 2026-03-28

### Added

- **Web Dashboard** — a built-in visual interface for browsing and managing your ideas. Opens automatically when the MCP server starts at `http://localhost:3001`. No separate process to run.
  - **Kanban Board** — drag-and-drop ideas between status columns (raw, shortlisted, build-next, in-progress, completed, needs-revision, rejected)
  - **Lineage Graph** — force-directed visualization showing how ideas relate through mutations and variants
  - **Portfolio View** — domain heat map and sortable table showing idea distribution and average scores across domains
  - **Detail Panel** — click any idea to see its full breakdown: scores with radar chart, critique flags, MVP steps, tags, and lineage links
  - **Dark / Light Mode** — toggle in the navbar, respects your OS preference, persists across sessions
  - `idea_lab_open_dashboard` tool — opens the dashboard in your default browser
- **3 new MCP tools:**
  - `idea_lab_submit_idea` — import unstructured notes and extract structured ideas
  - `idea_lab_refine_idea` — strengthen a weak idea by applying constraints
  - `idea_lab_decompose_idea` — break a big idea into independently shippable micro-products
- **Idea mutation engine** — `idea_lab_mutate_idea` creates variants along different axes (target user, monetization, tech stack, etc.) with full lineage tracking
- **Immune memory & portfolio management** — pattern-based duplicate rejection, domain portfolio analysis, idea resurfacing for stale shortlisted ideas

### Changed

- `npm run build` now compiles both the TypeScript server and the React frontend
- `IDEA_LAB_WEB_PORT` environment variable controls the dashboard port (default: 3001)
- Express added as a runtime dependency for serving the dashboard

### Fixed

- Graceful port handling — if port 3001 is already in use, the server logs a message instead of crashing

## [1.0.0] - 2026-03-28

### Added

- Initial release
- MCP server with stdio transport for Claude Code and other MCP clients
- SQLite database via better-sqlite3 with Drizzle ORM (auto-creates at `~/.idea-lab/ideas.db`)
- **Core ideation tools:**
  - `idea_lab_generate_ideas` — generate candidates using 4 creative techniques
  - `idea_lab_save_idea` — store a structured idea
  - `idea_lab_score_idea` — score on 7 weighted dimensions (novelty, usefulness, feasibility, testability, speed to MVP, defensibility, clarity)
  - `idea_lab_critique_idea` — adversarial critique checking for wrapper problems, existing products, fragile dependencies, vague claims
  - `idea_lab_check_duplicate` — deduplicate against all stored ideas
- **Lifecycle management:**
  - `idea_lab_search_ideas` — filter by status, domain, score, tags, date range
  - `idea_lab_get_recent_ideas` — retrieve last N ideas
  - `idea_lab_promote_idea` — advance ideas through the pipeline (raw -> shortlisted -> build-next)
  - `idea_lab_delete_idea` — remove rejected ideas
  - `idea_lab_resurface_ideas` — find stale shortlisted ideas
  - `idea_lab_mark_revalidated` — mark an idea as re-reviewed
  - `idea_lab_remove_pattern` — clear false-positive rejection patterns
  - `idea_lab_generate_action_plan` — create concrete MVP steps for an idea
- Editor integration guides for Claude Code, VS Code, Cursor, Windsurf, Continue, Cline, Claude Desktop, and Zed
- Platform setup docs for macOS, Windows, Linux (Debian/Ubuntu, Fedora/RHEL, Alpine)
