# Security

## Data Storage

All data is stored locally in a SQLite database at `~/.idea-lab/ideas.db` (or the path set via `DB_PATH`).

- No cloud storage, no telemetry, no network calls initiated by the server
- No idea content, scores, or critiques leave your machine
- Database file permissions follow OS defaults for user-created files
- WAL mode is enabled for safe concurrent access; foreign keys are enforced

## Transport Security

Idea Lab uses stdio transport exclusively (JSON-RPC 2.0 over stdin/stdout).

- No HTTP server, no TCP listener, no network socket
- Communication happens exclusively between the MCP client and the server process over pipes
- No remote access is possible by design — the server cannot be reached over a network

## Environment Variables

Only one environment variable is used:

| Variable | Required | Notes |
|----------|----------|-------|
| `DB_PATH` | No | Defaults to `~/.idea-lab/ideas.db`. If set to a custom path, ensure the parent directory exists and has appropriate permissions for the running user. |

No API keys, tokens, or secrets are required or used.

## Dependencies

Runtime dependencies (4 packages):

| Package | Purpose | Notes |
|---------|---------|-------|
| `@modelcontextprotocol/sdk` | MCP protocol implementation | Official MCP SDK |
| `better-sqlite3` | SQLite database driver | Native module compiled at install time via node-gyp |
| `drizzle-orm` | ORM and query builder | No network calls |
| `zod` | Input validation | No network calls |

`better-sqlite3` is a native module. It is compiled from C++ during `npm install` using node-gyp. Verify your Node.js version matches the package's supported range (`>=22.x`) before installation.

## Reporting Issues

Idea Lab is a local-only developer tool with no network attack surface. If you discover a security concern (e.g., path traversal via `DB_PATH`, unsafe SQL construction), report it by opening a GitHub issue with the label `security`.
