import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getRecentIdeas, getTopRatedIdeas } from "../services/retrieval.js";
import { getAllPatterns } from "../services/rejection-patterns.js";
import { getPortfolioOverview } from "../services/portfolio.js";
import { getIdeaLineage } from "../services/mutation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function registerResources(server: McpServer): void {
  const rubricPath = resolve(__dirname, "../../config/rubric.json");

  server.resource(
    "scoring-rubric",
    "idea-lab://rubric",
    {
      description:
        "Scoring rubric with dimension weights, threshold gates, and anchor definitions for all 7 scoring dimensions. Read this BEFORE calling idea_lab_score_idea to calibrate your scoring.",
    },
    async () => ({
      contents: [
        {
          uri: "idea-lab://rubric",
          mimeType: "application/json",
          text: readFileSync(rubricPath, "utf-8"),
        },
      ],
    }),
  );

  const constraintsPath = resolve(__dirname, "../../config/constraints.json");

  server.resource(
    "software-only-constraints",
    "idea-lab://software-only-constraints",
    {
      description:
        "Criteria for the software-only constraint. Any idea requiring hardware, manufacturing, physical lab work, or supply chain is rejected. Read this before generating or critiquing ideas.",
    },
    async () => ({
      contents: [
        {
          uri: "idea-lab://software-only-constraints",
          mimeType: "application/json",
          text: readFileSync(constraintsPath, "utf-8"),
        },
      ],
    }),
  );

  server.resource(
    "recent-ideas",
    "idea-lab://recent-ideas",
    {
      description:
        "The 20 most recently created ideas (excluding rejected) with title, one-liner, status, composite score, and domain. Read this to get an overview of stored ideas before planning a new ideation session or searching for specific ideas.",
    },
    async () => {
      const rows = await getRecentIdeas(20);
      return {
        contents: [
          {
            uri: "idea-lab://recent-ideas",
            mimeType: "application/json",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "top-rated-ideas",
    "idea-lab://top-rated-ideas",
    {
      description:
        "The 10 highest-scoring shortlisted and build-next ideas ordered by composite score descending. Read this to find the strongest ideas for MVP planning or to understand what quality level the pipeline has achieved.",
    },
    async () => {
      const rows = await getTopRatedIdeas(10);
      return {
        contents: [
          {
            uri: "idea-lab://top-rated-ideas",
            mimeType: "application/json",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "rejection-patterns",
    "idea-lab://rejection-patterns",
    {
      description:
        "Stored rejection patterns learned from past critique failures. Shows pattern text, frequency count, and last seen date. Review these to understand common idea weaknesses and remove false positives.",
    },
    async () => {
      const patterns = await getAllPatterns();
      return {
        contents: [
          {
            uri: "idea-lab://rejection-patterns",
            mimeType: "application/json",
            text: JSON.stringify(patterns, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "portfolio-overview",
    "idea-lab://portfolio-overview",
    {
      description:
        "Portfolio distribution analysis showing idea counts per domain, average composite scores, risk levels, and speed-to-MVP. Includes gap analysis identifying underrepresented domains. Read this before using the diversify flag on generate_ideas.",
    },
    async () => {
      const overview = await getPortfolioOverview();
      return {
        contents: [
          {
            uri: "idea-lab://portfolio-overview",
            mimeType: "application/json",
            text: JSON.stringify(overview, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "idea-lineage",
    new ResourceTemplate("idea-lab://idea-lineage/{ideaId}", { list: undefined }),
    {
      description:
        "Parent-child lineage tree for a specific idea. Shows ancestors (what it was mutated from) and descendants (what was mutated from it), with mutation axis and depth at each level.",
    },
    async (uri, variables) => {
      const ideaId = variables["ideaId"] as string;
      const lineage = await getIdeaLineage(ideaId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(lineage, null, 2),
          },
        ],
      };
    },
  );
}
