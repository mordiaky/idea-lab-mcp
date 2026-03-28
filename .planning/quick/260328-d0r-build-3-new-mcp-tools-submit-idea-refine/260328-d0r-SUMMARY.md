---
phase: quick-260328-d0r
plan: "01"
subsystem: tools, services
tags: [mcp-tools, refinement, decomposition, mutation, intake]
dependency_graph:
  requires: [src/services/mutation.ts, src/db/schema.ts, src/db/client.ts]
  provides: [idea_lab_submit_idea, idea_lab_refine_idea, idea_lab_decompose_idea]
  affects: [src/tools/index.ts]
tech_stack:
  added: []
  patterns: [two-step-tool-pattern, mutation-variant-linking, constraint-based-refinement]
key_files:
  created:
    - src/services/refinement.ts
    - src/services/decomposition.ts
  modified:
    - src/tools/index.ts
decisions:
  - "Refinement axis hardcoded to 'scope' — constraint-based refinements narrow the scope of the original idea, so scope is always the correct mutation axis"
  - "Decomposition axis hardcoded to 'scope' — micro-ideas are scope reductions of the parent idea"
  - "standaloneValue stored in constraints column — no schema change needed; micro-ideas need this context and constraints column is the best semantic fit for it"
  - "Decomposition restricted to shortlisted/build-next — decomposing raw/rejected ideas is premature; validated ideas only"
metrics:
  duration: 15
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 260328-d0r: Build 3 New MCP Tools — Submit Idea, Refine, Decompose

**One-liner:** Added three intake/refinement tools: submit_idea for unstructured text intake, refine_idea for constraint-based variant creation, and decompose_idea for breaking shortlisted ideas into 3-7 micro-ideas, all wired through the existing mutation/variant system.

## What Was Built

### src/services/refinement.ts (new)

- `getRefinementContext(ideaId)` — fetches idea, latest critique, latest score, checks mutation depth cap, returns 6-constraint menu with caller instructions
- `createRefinedVariant(parentId, constraint, fields)` — inserts new idea, handles tags, calls `recordMutation` with axis="scope"
- 6 built-in constraints: weekend-buildable, cli-only, offline-only, single-user-type, no-dependencies, api-only

### src/services/decomposition.ts (new)

- `getDecompositionContext(ideaId)` — validates status is shortlisted/build-next, checks depth cap, returns 4 decomposition axes with caller instructions
- `saveDecomposition(parentId, microIdeas[])` — validates 3-7 array length, inserts each micro-idea (standaloneValue -> constraints column), calls `recordMutation` for each
- Returns `startHere` recommendation pointing to first (highest priority) micro-idea

### src/tools/index.ts (modified — 3 new tools added)

- `idea_lab_submit_idea` — single-step text intake; returns rawText + parsingGuidelines; caller extracts discrete ideas and calls save_idea for each
- `idea_lab_refine_idea` — two-step; Step 1 returns getRefinementContext; Step 2 calls createRefinedVariant with constraint + new fields
- `idea_lab_decompose_idea` — two-step; Step 1 returns getDecompositionContext; Step 2 calls saveDecomposition with micro-ideas array

Total tool count: 14 -> 17.

## Verification

- `npx tsx --eval "import { registerTools } ... console.error('OK')"` — PASS
- `npm run build` — PASS (no TypeScript errors)
- `npm run lint` — PASS (no lint errors)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all tools are fully wired to service layer and database.

## Self-Check: PASSED

Files exist:
- FOUND: src/services/refinement.ts
- FOUND: src/services/decomposition.ts
- FOUND: src/tools/index.ts (modified)

Commits exist:
- f84b006: feat(quick-260328-d0r-01): add refinement and decomposition service files
- 0b104ad: feat(quick-260328-d0r-01): register idea_lab_submit_idea, refine_idea, decompose_idea tools
