---
phase: quick
plan: 260328-dum
subsystem: web-portal
tags: [react, express, sqlite, dnd-kit, recharts, react-force-graph-2d]
dependency_graph:
  requires: [src/db/schema.ts, ~/.idea-lab/ideas.db]
  provides: [web/ local web portal]
  affects: []
tech_stack:
  added:
    - react 18 + react-dom
    - react-router-dom 6
    - vite 6 + @vitejs/plugin-react
    - express 4 + cors
    - @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities
    - recharts (RadarChart, Treemap)
    - react-force-graph-2d
    - better-sqlite3 (server-side, readonly + writable for PATCH)
    - concurrently (dev runner)
    - tsx (server dev runner)
  patterns:
    - Express router-per-resource pattern (routes/ideas, routes/variants, routes/portfolio)
    - Vite proxy for /api during dev (no CORS workaround needed)
    - Optimistic UI update with rollback on PATCH failure
    - Readonly DB instance for reads, short-lived writable instance for PATCH only
key_files:
  created:
    - web/package.json
    - web/vite.config.ts
    - web/tsconfig.json
    - web/tsconfig.node.json
    - web/index.html
    - web/server/index.ts
    - web/server/db.ts
    - web/server/routes/ideas.ts
    - web/server/routes/variants.ts
    - web/server/routes/portfolio.ts
    - web/src/main.tsx
    - web/src/App.tsx
    - web/src/App.css
    - web/src/types.ts
    - web/src/api.ts
    - web/src/components/NavBar.tsx
    - web/src/components/KanbanBoard.tsx
    - web/src/components/KanbanColumn.tsx
    - web/src/components/IdeaCard.tsx
    - web/src/components/DetailPanel.tsx
    - web/src/components/RadarChart.tsx
    - web/src/components/GraphView.tsx
    - web/src/components/PortfolioView.tsx
  modified: []
decisions:
  - Readonly db instance for reads + ephemeral writable instance for PATCH only — prevents accidental writes while keeping status updates possible
  - tsconfig.json references removed — project references require composite:true which conflicts with noEmit; server code checked via separate tsconfig.node.json
  - PointerSensor with 8px activation distance — prevents click-vs-drag ambiguity on IdeaCard
metrics:
  duration: ~20 min
  completed: "2026-03-28"
  tasks_completed: 5
  files_created: 23
---

# Quick Task 260328-dum: Build Local Web Portal for Idea Lab — Summary

**One-liner:** React/Vite + Express local web portal that reads ~/.idea-lab/ideas.db and provides Kanban drag-and-drop, force-directed lineage graph, radar-chart detail panel, and domain heat map treemap.

## What Was Built

A standalone `web/` subdirectory containing a full-stack local web portal for the Idea Lab MCP server. The portal requires no external services — it opens the same SQLite database the MCP tools write to.

**Architecture:**
- Express API server on port 3001 (tsx watch for dev)
- Vite dev server on port 5173 (proxies /api/* to 3001)
- Single `npm run dev` starts both via `concurrently`

**Four views:**
1. Kanban board (/) — ideas in 4 columns (raw/shortlisted/build-next/rejected), drag-and-drop changes status via PATCH API
2. Graph (/graph) — force-directed lineage visualization of idea variants via react-force-graph-2d
3. Detail panel (overlay) — slide-out panel with recharts radar chart across 7 scoring dimensions, critique flags, MVP steps, lineage links
4. Portfolio (/portfolio) — recharts Treemap sized by domain idea count and colored by avg composite score, plus sortable summary table

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Scaffold web/ with Express API, shared types, nav | 79538c3 |
| 2 | Kanban board with drag-and-drop status changes | 26d9e6f |
| 3 | Idea detail panel with radar chart | 777586a |
| 4 | Force-directed lineage graph view | dd68fdd |
| 5 | Portfolio domain heat map view | c7b8f41 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed tsconfig.json project references**
- **Found during:** Task 1 TypeScript verification
- **Issue:** `references: [{ path: "./tsconfig.node.json" }]` in tsconfig.json caused TS6306/TS6310 errors because referenced projects must have `composite: true`, which conflicts with `noEmit: true`
- **Fix:** Removed the `references` field from tsconfig.json; server code is already validated separately via tsconfig.node.json
- **Files modified:** web/tsconfig.json
- **Commit:** Inline with 79538c3

## Known Stubs

None — all views fetch real data from the API.

## How to Run

```bash
cd web
npm install          # first time only
npm run dev          # starts Express on :3001 + Vite on :5173
```

Then open http://localhost:5173 in your browser.

The IDEA_LAB_DB environment variable overrides the default DB path if needed.

## Self-Check: PASSED
