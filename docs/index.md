---
layout: default
title: Idea Lab MCP Server
---

# Idea Lab

An MCP server that turns your AI assistant into a structured ideation partner. It generates, scores, critiques, and stores software ideas locally — so your assistant remembers past ideas across sessions and never suggests the same thing twice.

## What it does

You talk to your AI assistant like normal. Idea Lab gives it tools to:

**Generate ideas** using 4 different creative techniques, then run each one through a pipeline:

```
"Generate 5 software ideas in the developer tools space"

  generate_ideas   →  creates candidates
  save_idea        →  stores each one
  score_idea       →  scores on 7 dimensions
  critique_idea    →  tries to tear it apart
  check_duplicate  →  checks against everything stored
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

---

## Install

```bash
git clone https://github.com/mordiaky/idea-lab-mcp.git
cd idea-lab-mcp
npm install
npm run build
npm run db:migrate
```

Requires [Node.js 22+](https://nodejs.org/). If `npm install` fails, see [platform setup](platform-setup.md).

---

## Connect to your editor

Works with any MCP-compatible client. Replace `/absolute/path/to` with the real path where you cloned the project.

### VS Code (GitHub Copilot)

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

### Cursor

Create `~/.cursor/mcp.json`:

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

### Continue

Add to `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: idea-lab
    command: node
    args:
      - /absolute/path/to/idea-lab-mcp/build/index.js
```

### Cline

Use the MCP Servers panel in Cline's UI, or edit the settings file:

- **macOS:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Windows:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Linux:** `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev\settings/cline_mcp_settings.json`

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

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

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

---

## Example workflows

### Brainstorm session

> "Generate software ideas for the healthcare space, then score and critique the best ones"

The assistant will generate 5-8 candidates, score each on 7 dimensions, critique the high scorers, check for duplicates, and return a summary of what passed.

### Build on a winner

> "Show me my shortlisted ideas and create an MVP plan for the best one"

Searches stored ideas filtered to `shortlisted` status, picks the highest-scoring one, and generates 3-5 concrete MVP steps with tech stack recommendations.

### Explore a different angle

> "Take idea X and mutate it — what if we targeted enterprise users instead?"

Creates a variant that changes the target user while keeping the core concept. The variant is linked to the original so you can compare lineage.

### Revisit old ideas

> "What shortlisted ideas have I not looked at in 2 weeks?"

Finds stale shortlisted ideas that might deserve a second look.

---

## How scoring works

Each idea is scored 0-10 on 7 dimensions:

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Novelty | 25% | Is this genuinely new? |
| Usefulness | 25% | Does it solve a real problem? |
| Feasibility | 20% | Can it actually be built? |
| Testability | 15% | Can you validate it works? |
| Speed to MVP | 10% | How fast to a working prototype? |
| Defensibility | 5% | Is it hard to copy? |
| Clarity | gate | Is the idea well-defined? (min 5, not in composite) |

Ideas must clear minimum thresholds to advance: feasibility >= 7, usefulness >= 7, novelty >= 6, composite >= 6.5.

---

## Idea lifecycle

```
raw  -->  shortlisted  -->  build-next
 |             |                |
 +---- rejected (terminal) ----+
```

- **raw** — just generated
- **shortlisted** — passed scoring, critique, and dedup
- **build-next** — picked for MVP planning
- **rejected** — didn't survive (terminal)

---

## All 14 tools

| Tool | What it does |
|------|-------------|
| `generate_ideas` | Generate 5-8 candidates using creative techniques |
| `save_idea` | Store a new idea |
| `score_idea` | Score on 7 dimensions |
| `critique_idea` | Adversarial critique |
| `check_duplicate` | Check for duplicates |
| `search_ideas` | Search by status, domain, score, tags, date |
| `get_recent_ideas` | Get last N ideas |
| `promote_idea` | Advance through lifecycle |
| `delete_idea` | Delete a rejected idea |
| `mutate_idea` | Create a variant on a different axis |
| `resurface_ideas` | Find stale shortlisted ideas |
| `mark_revalidated` | Mark idea as re-reviewed |
| `remove_pattern` | Remove a false-positive rejection pattern |
| `generate_action_plan` | Create MVP steps for an idea |

---

## Configuration

Only one optional setting:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `~/.idea-lab/ideas.db` | SQLite database location |

---

## License

[PolyForm Noncommercial 1.0.0](https://github.com/mordiaky/idea-lab-mcp/blob/main/LICENSE) — free for personal and non-commercial use.

For commercial licensing, contact the author.

---

[View on GitHub](https://github.com/mordiaky/idea-lab-mcp)
