# Idea Lab

An MCP server that turns your AI assistant into a structured ideation partner. It generates, scores, critiques, and stores software ideas locally — so your assistant remembers past ideas across sessions and never suggests the same thing twice.

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

## Install

```bash
git clone https://github.com/mordiaky/idea-lab-mcp.git
cd idea-lab-mcp
npm install
npm run build
npm run db:migrate
```

Requires **Node.js 22+**. If `npm install` fails, see [platform setup](docs/platform-setup.md).

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

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `~/.idea-lab/ideas.db` | SQLite database location |

That's the only setting. The default works without any configuration.

## Development

```bash
npm run dev           # Run server (no build step)
npm run build         # Compile TypeScript
npm test              # Run tests
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Apply migrations
npm run db:seed       # Load sample data
```

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for personal and non-commercial use.

For commercial licensing, contact the author.
