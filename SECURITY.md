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

Idea Lab uses **stdio transport** exclusively (JSON-RPC 2.0 over stdin/stdout).

- No HTTP server, no TCP listener, no network socket
- Communication happens between the MCP client process and the server over pipes
- The server cannot be reached over a network — there is no listening port

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PATH` | No | Override the default database location. Ensure the parent directory exists and has appropriate permissions. |

No API keys, tokens, or secrets are required or used by this server.

## Dependencies

Four runtime packages:

| Package | Purpose | Network access |
|---------|---------|----------------|
| `@modelcontextprotocol/sdk` | MCP protocol implementation | None |
| `better-sqlite3` | SQLite database driver | None |
| `drizzle-orm` | ORM and query builder | None |
| `zod` | Input validation | None |

`better-sqlite3` is a native module compiled from C++ during `npm install` via node-gyp. See [Platform Setup](README.md#platform-setup) for build tool requirements per OS.

## Reporting Issues

Idea Lab is a local-only tool with no network attack surface. If you discover a security concern (e.g., path traversal via `DB_PATH`, unsafe SQL construction), please open a GitHub issue.
