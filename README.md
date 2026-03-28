# Idea Lab MCP Server

A structured ideation engine that runs as an [MCP](https://modelcontextprotocol.io/) server. It generates, critiques, scores, deduplicates, and stores software ideas — giving your AI assistant persistent memory across sessions to build a ranked idea database over time.

Works with any MCP-compatible client: VS Code (Copilot), Cursor, Windsurf, Continue, Cline, Zed, Claude Desktop, and more.

## Features

- **14 MCP tools** covering the full ideation lifecycle — generation, scoring, critique, deduplication, mutation, and action planning
- **Persistent local storage** — SQLite database, zero cloud dependencies, your ideas never leave your machine
- **Zero config** — database auto-creates on first run, no API keys or secrets required
- **Cross-platform** — works on macOS, Windows, and Linux
- **Any MCP client** — standard stdio transport compatible with all MCP hosts

## Quickstart

### Prerequisites

- **Node.js >= 22** ([download](https://nodejs.org/))
- A C++ compiler for the native SQLite module (see [Platform Setup](#platform-setup) if `npm install` fails)

### Install

```bash
git clone https://github.com/user/idea-lab-mcp.git
cd idea-lab-mcp
npm install
npm run build
npm run db:migrate
```

That's it. The database is created automatically at `~/.idea-lab/ideas.db`.

Optionally load sample data to explore the tools:

```bash
npm run db:seed
```

### Connect to your editor

Pick your client and follow the setup below. Each one needs the **absolute path** to where you cloned the project.

---

## Client Setup

### VS Code (GitHub Copilot)

Create `.vscode/mcp.json` in your workspace (or add to your user settings):

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

Requires GitHub Copilot with agent mode enabled.

### Cursor

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

### Windsurf

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

### Continue (VS Code / JetBrains)

Add to `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: idea-lab
    command: node
    args:
      - /absolute/path/to/idea-lab-mcp/build/index.js
```

Or drop a JSON file into `~/.continue/mcpServers/` using the Cursor/Windsurf format above.

### Cline (VS Code)

Easiest: use the MCP Servers panel in Cline's UI to add a new server.

Or edit the settings file directly:

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

### Claude Desktop

Edit the config file:

| OS | Path |
|----|------|
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

### Claude Code (CLI)

```bash
claude mcp add idea-lab -- node /absolute/path/to/idea-lab-mcp/build/index.js
```

### Zed

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

Note: `"source": "custom"` is required for Zed.

---

## Platform Setup

The SQLite driver (`better-sqlite3`) is a native module. It ships prebuilt binaries for most setups, but if `npm install` fails with a build error, install the build tools for your OS:

### macOS

```bash
xcode-select --install
```

### Windows

During Node.js installation, check **"Automatically install the necessary tools"**. If you already have Node installed:

```
npm install --global windows-build-tools
```

Or install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload.

### Linux (Debian/Ubuntu)

```bash
sudo apt-get install build-essential python3
```

### Linux (Fedora/RHEL)

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `~/.idea-lab/ideas.db` | Path to SQLite database file |

That's the only setting. The default works without any configuration. Copy `.env.example` if you need to customize it.

---

## MCP Tools

### Generation

| Tool | Description |
|------|-------------|
| `idea_lab_generate_ideas` | Batch generate 5-8 candidates using 4 techniques (cross-domain transfer, forced analogy, contradiction search, morphological matrix) |
| `idea_lab_save_idea` | Save a new idea to the database |
| `idea_lab_mutate_idea` | Create a variant by changing one axis (target user, scope, tech, or business model) |

### Evaluation

| Tool | Description |
|------|-------------|
| `idea_lab_score_idea` | Score on 7 dimensions (novelty, usefulness, feasibility, testability, speed to MVP, defensibility, clarity) |
| `idea_lab_critique_idea` | Adversarial critique — finds every reason the idea should be rejected |
| `idea_lab_check_duplicate` | Two-step duplicate detection against stored ideas |

### Retrieval

| Tool | Description |
|------|-------------|
| `idea_lab_search_ideas` | Search by status, domain, score range, tags, or date |
| `idea_lab_get_recent_ideas` | Get the last N ideas (non-rejected) |
| `idea_lab_resurface_ideas` | Find shortlisted ideas that haven't been reviewed in N days |

### Lifecycle

| Tool | Description |
|------|-------------|
| `idea_lab_promote_idea` | Move through lifecycle states (raw &rarr; shortlisted &rarr; build-next) |
| `idea_lab_delete_idea` | Permanently delete a rejected idea |
| `idea_lab_mark_revalidated` | Mark an idea as re-validated after resurfacing |
| `idea_lab_remove_pattern` | Delete a false-positive rejection pattern |

### Planning

| Tool | Description |
|------|-------------|
| `idea_lab_generate_action_plan` | Generate 3-5 MVP steps with tech stack for a shortlisted idea |

## MCP Resources

| URI | Description |
|-----|-------------|
| `idea-lab://rubric` | Scoring rubric — dimensions, weights, thresholds, anchors |
| `idea-lab://software-only-constraints` | Software-only enforcement criteria |
| `idea-lab://recent-ideas` | Last 20 non-rejected ideas |
| `idea-lab://top-rated-ideas` | Top 10 shortlisted and build-next ideas |
| `idea-lab://rejection-patterns` | Learned anti-patterns with frequency data |
| `idea-lab://portfolio-overview` | Domain distribution, average scores, and gaps |
| `idea-lab://idea-lineage/{ideaId}` | Parent-child mutation tree for a specific idea |

## MCP Prompts

| Prompt | Description |
|--------|-------------|
| `brainstorm_problem_first` | Ideate around a specific problem and optional domain |
| `criticize_idea_harshly` | Adversarial critique for a given idea |
| `convert_idea_to_mvp_spec` | Convert a shortlisted idea to an MVP spec |
| `generate_code_only_ideas` | Generate code-only ideas for a domain |

---

## Idea Lifecycle

```
raw  -->  shortlisted  -->  build-next
 |            |                 |
 +--- rejected (terminal) -----+
```

Ideas start as `raw`, get promoted through evaluation, and can be `rejected` from any state.

---

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Run server with tsx (no build step) |
| `npm run build` | Compile TypeScript to `build/` |
| `npm test` | Run test suite |
| `npm run lint` | Lint source code |
| `npm run format` | Format source code |
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:seed` | Load sample data |

## Architecture

```
src/
  server.ts       Entry point — MCP server setup and stdio transport
  config.ts       Database path configuration
  config/         JSON config loaders (rubric, constraints, techniques, prompts)
  db/             Schema, client, migrations, seed script
  tools/          14 MCP tool handlers
  services/       Business logic (generation, scoring, critique, dedup, retrieval, etc.)
  resources/      7 MCP resource handlers
  prompts/        4 MCP prompt handlers

config/
  rubric.json         Scoring dimensions, weights, and anchor definitions
  constraints.json    Software-only enforcement rules
  techniques.json     Ideation technique prompt templates
  prompts.json        MCP prompt templates
```

Database: SQLite at `~/.idea-lab/ideas.db` with 8 tables (ideas, scores, critiques, tags, idea_tags, idea_runs, idea_variants, rejection_patterns).

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for personal and non-commercial use. For commercial licensing, contact the author.
