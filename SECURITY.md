# Security

## Data Storage

All data is stored locally in a SQLite database at `~/.idea-lab/ideas.db` (or the path set via `DB_PATH`).

- No cloud storage, no telemetry, no network calls
- No idea content, scores, or critiques leave your machine
- Database file permissions follow your OS defaults for user-created files
- WAL mode is enabled for safe concurrent access; foreign keys are enforced

| OS | Default database location |
|----|---------------------------|
| macOS | `/Users/<you>/.idea-lab/ideas.db` |
| Linux | `/home/<you>/.idea-lab/ideas.db` |
| Windows | `C:\Users\<you>\.idea-lab\ideas.db` |

## Transport

Idea Lab uses **stdio transport** for MCP communication (JSON-RPC 2.0 over stdin/stdout).

- MCP communication happens between the client process and the server over pipes
- No API keys, tokens, or secrets are required or used

## Web Dashboard

The server starts a local HTTP server for the web dashboard (default: `http://localhost:3001`).

- Binds to `localhost` only — not accessible from other machines on your network
- Serves a read-only view of your idea database, plus status updates via PATCH
- No authentication — anyone with access to your machine on that port can view and update idea statuses
- If the port is in use, the dashboard is skipped and the MCP server continues normally

If you need to disable the dashboard entirely, you can set `IDEA_LAB_WEB_PORT=0` (the server will fail to bind and skip it gracefully).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IDEA_LAB_DB` | No | Override the default database location. Ensure the parent directory exists and has appropriate permissions. |
| `IDEA_LAB_WEB_PORT` | No | Port for the web dashboard (default: 3001). |

No API keys, tokens, or secrets are required or used by this server.

## Dependencies

Five runtime packages:

| Package | Purpose | Network access |
|---------|---------|----------------|
| `@modelcontextprotocol/sdk` | MCP protocol implementation | None |
| `better-sqlite3` | SQLite database driver | None |
| `drizzle-orm` | ORM and query builder | None |
| `express` | Web dashboard HTTP server | Localhost only (port 3001) |
| `zod` | Input validation | None |

`better-sqlite3` is a native module compiled from C++ during `npm install` via node-gyp. See [Platform Setup](README.md#platform-setup) for build tool requirements per OS.

## Reporting Issues

Idea Lab is a local-only tool with no network attack surface. If you discover a security concern (e.g., path traversal via `DB_PATH`, unsafe SQL construction), please open a GitHub issue.
