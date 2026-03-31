# Idea Lab

[![npm version](https://img.shields.io/npm/v/idea-lab-mcp)](https://www.npmjs.com/package/idea-lab-mcp)
[![GitHub release](https://img.shields.io/github/v/release/mordiaky/idea-lab-mcp)](https://github.com/mordiaky/idea-lab-mcp/releases)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm--Noncommercial-blue)](LICENSE)

An MCP server that turns your AI assistant into a structured ideation partner. It generates, scores, critiques, and stores software ideas locally — so your assistant remembers past ideas across sessions and never suggests the same thing twice.

Includes a **built-in web dashboard** with a Kanban board, lineage graph, and portfolio view — with dark and light mode support.

## What it does

You talk to your AI assistant like normal. Idea Lab gives it tools to:

**Generate ideas** using 4 different creative techniques, then run each one through a pipeline:

```
"Generate 5 software ideas in the developer tools space"

  idea_lab_generate_ideas  →  generates candidates
  idea_lab_save_idea       →  stores each one
  idea_lab_score_idea      →  scores on 7 dimensions
  idea_lab_critique_idea   →  tries to tear it apart
  idea_lab_check_duplicate →  checks against everything stored
```

**Search and revisit** ideas you've generated before:

```
"Show me my highest-rated ideas"
"Find ideas related to automation"
"What shortlisted ideas haven't I looked at in a while?"
```

**Evolve ideas** that survived the pipeline:

```
"Take that CLI tool idea and reimagine it as a SaaS product"
"Create an MVP plan for my top-rated idea"
```

Everything is stored locally in SQLite. No cloud, no API keys, no data leaving your machine.

## Web Dashboard

The MCP server includes a built-in web dashboard that starts automatically at `http://localhost:3001`. No separate process needed.

- **Kanban Board** — drag-and-drop ideas between status columns
- **Lineage Graph** — visualize how ideas connect through mutations
- **Portfolio View** — heat map and table showing domain distribution and scores
- **Detail Panel** — click any idea for its full breakdown (radar chart, critique flags, MVP steps, lineage)
- **Dark / Light Mode** — toggle in the navbar, respects OS preference, persists across sessions

Use the `idea_lab_open_dashboard` tool to open it in your browser, or just navigate to `http://localhost:3001` directly.

For the full guide, see [Web Dashboard Guide](docs/web-dashboard.md).

## Install

### From npm

```bash
npm install idea-lab-mcp
cd node_modules/idea-lab-mcp
node build/db/migrate.js
```

### From source

```bash
git clone https://github.com/mordiaky/idea-lab-mcp.git
cd idea-lab-mcp
npm install
npm run build        # compiles server + web dashboard
npm run db:migrate
```

Requires **Node.js 22+**. If `npm install` fails, see [platform setup](docs/platform-setup.md).

Once connected to your editor, the MCP server starts automatically and the web dashboard is available at `http://localhost:3001`.

## Connect to your editor

Add the server to your MCP client. Replace `/absolute/path/to` with the real path to where you cloned the project.

<details>
<summary><b>VS Code (GitHub Copilot)</b></summary>

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "idea-lab": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Cursor</b></summary>

Create `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per-project):

```json
{
  "mcpServers": {
    "idea-lab": {
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Windsurf</b></summary>

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "idea-lab": {
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Continue (VS Code / JetBrains)</b></summary>

Add to `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: idea-lab
    command: node
    args:
      - /absolute/path/to/idea-lab-mcp/build/index.js
```
</details>

<details>
<summary><b>Cline</b></summary>

Use the MCP Servers panel in Cline's UI, or edit the config directly:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Windows | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| Linux | `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |

```json
{
  "mcpServers": {
    "idea-lab": {
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Claude Desktop</b></summary>

| OS | Config path |
|----|-------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "idea-lab": {
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```

Fully quit and restart the app after editing.
</details>

<details>
<summary><b>Claude Code (CLI)</b></summary>

```bash
claude mcp add idea-lab -- node /absolute/path/to/idea-lab-mcp/build/index.js
```
</details>

<details>
<summary><b>Zed</b></summary>

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "idea-lab": {
      "source": "custom",
      "command": "node",
      "args": ["/absolute/path/to/idea-lab-mcp/build/index.js"]
    }
  }
}
```
</details>

## Example workflows

### Brainstorm session

> "Generate software ideas for the healthcare space, then score and critique the best ones"

The assistant will:
1. Call `generate_ideas` to create 5-8 candidates using different creative techniques
2. Save each one and score it across 7 dimensions (novelty, usefulness, feasibility, testability, speed to MVP, defensibility, clarity)
3. Critique the high scorers — searching for existing products, fragile dependencies, and vague claims
4. Check for duplicates against your stored ideas
5. Return a summary of what passed and what got rejected

### Build on a winner

> "Show me my shortlisted ideas and create an MVP plan for the best one"

The assistant will:
1. Search your stored ideas filtered to `shortlisted` status
2. Pick the highest-scoring one (or let you choose)
3. Generate 3-5 concrete MVP steps with tech stack recommendations

### Explore a different angle

> "Take idea X and mutate it — what if we targeted enterprise users instead?"

The assistant calls `mutate_idea` to create a variant that changes the target user while keeping the core concept. The variant is linked to the original so you can compare lineage.

### Import ideas from your notes

> "Here are my ideas from last month's brainstorm session: [paste messy notes]"

The assistant calls `submit_idea` with your raw text, extracts each discrete idea, structures them, and runs each through the full scoring pipeline.

### Strengthen a weak idea

> "Idea X scored weak — refine it with a 'weekend-buildable' constraint"

The assistant calls `refine_idea` to apply the constraint, generating a tighter version that gets re-scored. You can keep applying different constraints (CLI-only, offline-only, etc.) until it passes or you move on.

### Break a big idea into shippable pieces

> "Decompose my top idea into things I can actually start building"

The assistant calls `decompose_idea` to split it into 3-7 independently shippable micro-products, each scored on its own. It recommends which piece to start with this weekend.

### Revisit old ideas

> "What shortlisted ideas have I not looked at in 2 weeks?"

The assistant calls `resurface_ideas` to find stale shortlisted ideas that might deserve a second look now that your thinking has evolved.

## How scoring works

Each idea is scored 0-10 on 7 dimensions with different weights:

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Novelty | 25% | Is this genuinely new? |
| Usefulness | 25% | Does it solve a real problem? |
| Feasibility | 20% | Can it actually be built? |
| Testability | 15% | Can you validate it works? |
| Speed to MVP | 10% | How fast to a working prototype? |
| Defensibility | 5% | Is it hard to copy? |
| Clarity | gate | Is the idea well-defined? (min 5, not in composite) |

Ideas need to clear minimum thresholds (feasibility >= 7, usefulness >= 7, novelty >= 6, composite >= 6.5) to advance.

## How ideas move through the pipeline

```
raw  -->  shortlisted  -->  build-next
 |             |                |
 +---- rejected (terminal) ----+
```

- **raw** — just generated, not yet evaluated
- **shortlisted** — passed scoring, critique, and dedup checks
- **build-next** — picked for MVP planning
- **rejected** — didn't survive evaluation (can happen at any stage)

## Tools reference

| Tool | What it does |
|------|-------------|
| `idea_lab_generate_ideas` | Generate 5-8 candidates using creative techniques |
| `idea_lab_save_idea` | Store a new idea |
| `idea_lab_score_idea` | Score on 7 dimensions |
| `idea_lab_critique_idea` | Adversarial critique |
| `idea_lab_check_duplicate` | Check for duplicates |
| `idea_lab_search_ideas` | Search by status, domain, score, tags, date |
| `idea_lab_get_recent_ideas` | Get last N ideas |
| `idea_lab_promote_idea` | Advance through lifecycle |
| `idea_lab_delete_idea` | Delete a rejected idea |
| `idea_lab_mutate_idea` | Create a variant on a different axis |
| `idea_lab_resurface_ideas` | Find stale shortlisted ideas |
| `idea_lab_mark_revalidated` | Mark idea as re-reviewed |
| `idea_lab_remove_pattern` | Remove a false-positive rejection pattern |
| `idea_lab_generate_action_plan` | Create MVP steps for an idea |
| `idea_lab_submit_idea` | Import unstructured notes and extract ideas |
| `idea_lab_refine_idea` | Strengthen a weak idea through constraints |
| `idea_lab_decompose_idea` | Break a big idea into shippable micro-products |
| `idea_lab_open_dashboard` | Open the web dashboard in your browser |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `IDEA_LAB_DB` | `~/.idea-lab/ideas.db` | SQLite database location |
| `IDEA_LAB_WEB_PORT` | `3001` | Port for the web dashboard |

Both settings are optional. The defaults work without any configuration.

## Development

```bash
npm run dev           # Run MCP server (no build step, serves built dashboard)
npm run build         # Compile TypeScript server + React dashboard
npm test              # Run tests
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Apply migrations
npm run db:seed       # Load sample data
```

For dashboard frontend development with hot reload:

```bash
cd web && npm run dev  # Vite dev server, proxies API to port 3001
```

## Part of Thinking Tools

Idea Lab is also bundled in [Thinking Tools MCP](https://github.com/mordiaky/thinking-tools) — a unified suite with 61 tools across 8 modules (including Hypothesis Tracker, Decision Matrix, Mental Models, and more). Use this standalone version if you only need ideation.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for personal and non-commercial use.

For commercial licensing, contact the author.
