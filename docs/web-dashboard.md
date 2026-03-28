# Web Dashboard Guide

Idea Lab includes a built-in web dashboard for visually browsing, managing, and exploring your ideas. It runs inside the MCP server process — no separate server to start.

## Getting started

The dashboard starts automatically when the MCP server launches. Open it at:

```
http://localhost:3001
```

Or ask your AI assistant to call the `idea_lab_open_dashboard` tool, which opens it in your default browser.

### Changing the port

Set the `IDEA_LAB_WEB_PORT` environment variable before starting the server:

```bash
IDEA_LAB_WEB_PORT=4000 node build/server.js
```

If the port is already in use, the server continues running without the dashboard and logs a message.

## Views

### Kanban Board (home page)

The main view. Your ideas are organized into columns by status:

| Column | Meaning |
|--------|---------|
| Raw | Just generated, not yet evaluated |
| Shortlisted | Passed scoring, critique, and dedup checks |
| Build Next | Picked for MVP planning |
| In Progress | Currently being built |
| Completed | Done |
| Needs Revision | Completed but needs rework |
| Rejected | Didn't survive evaluation |

**Drag and drop** an idea card between columns to change its status. The change is saved to the database immediately.

Each card shows the idea title, domain badge, composite score, and critique verdict at a glance.

**Click a card** to open the detail panel.

### Lineage Graph

A force-directed graph showing how ideas connect through mutations and variants. Each node is an idea, colored by status. Edges represent parent-child mutation relationships.

- **Node size** scales with composite score
- **Click a node** to open the detail panel
- **Drag nodes** to rearrange the layout
- **Scroll** to zoom in and out

This view is most useful after running `idea_lab_mutate_idea` a few times to build up variant trees.

### Portfolio

A high-level view of your idea database by domain:

- **Heat map** — treemap sized by idea count, colored by average score. Larger blocks = more ideas in that domain. Greener = higher average scores.
- **Summary table** — sortable columns showing idea count, average composite score, and status breakdown per domain. Click any column header to sort.

Use this to spot which domains you've explored heavily and which have the strongest ideas.

## Detail Panel

Click any idea (from Kanban or Graph) to open a slide-out panel with everything about it:

- **Status badge** with action buttons (e.g., "Shortlist", "Reject", "Build Next") based on the current status
- **Score radar chart** showing all 7 dimensions visually, plus the composite score
- **Problem and solution** descriptions
- **Critique section** with verdict and any flags (wrapper problem, existing products, fragile dependencies, vague statements, violates software-only)
- **Metadata** — target user, constraints, risks, why now
- **MVP steps** — ordered list if an action plan has been generated
- **Tags**
- **Lineage** — links to parent and child ideas from mutations. Click to navigate.
- **Timeline** — creation and last update dates

## Dark / Light Mode

Click the moon/sun button in the top-right corner of the navbar to toggle between dark and light mode.

- Defaults to your operating system preference
- Your choice is saved in the browser and persists across sessions

## For development

If you're working on the dashboard frontend:

```bash
cd web
npm run dev
```

This starts Vite's dev server with hot reload. API calls are proxied to port 3001, so you need the MCP server running too (either through your editor or `npm run dev` from the project root).

To build the frontend for production:

```bash
npm run build
```

This compiles both the TypeScript server and the React frontend. The built dashboard is served from `web/dist/`.
