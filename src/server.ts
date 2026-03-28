import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { startDashboard } from "./web/dashboard.js";

const server = new McpServer({
  name: "idea-lab",
  version: "0.1.0",
});

registerTools(server);
registerResources(server);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[idea-lab] server running\n");

// Start the web dashboard in the same process
startDashboard();
