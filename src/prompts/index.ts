import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promptsConfig } from "../config/prompts.js";

function applyTemplate(
  template: string,
  args: Record<string, string | undefined>,
): string {
  let result = template;

  // Handle {{#conditional}}...{{/conditional}} blocks
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key: string, block: string) => {
      return args[key] ? block : "";
    },
  );

  // Replace {{placeholder}} with arg values
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return args[key] ?? "";
  });

  return result;
}

function getPromptConfig(id: string) {
  const config = promptsConfig.prompts.find((p) => p.id === id);
  if (!config) {
    throw new Error(`Prompt config not found for id: ${id}`);
  }
  return config;
}

export function registerPrompts(server: McpServer): void {
  // brainstorm_problem_first
  const brainstormConfig = getPromptConfig("brainstorm_problem_first");
  server.prompt(
    brainstormConfig.id,
    brainstormConfig.description,
    {
      problem: z
        .string()
        .describe(
          brainstormConfig.args.find((a) => a.name === "problem")
            ?.description ?? "The problem to solve",
        ),
      domain: z
        .string()
        .optional()
        .describe(
          brainstormConfig.args.find((a) => a.name === "domain")
            ?.description ?? "Optional domain constraint",
        ),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: applyTemplate(brainstormConfig.messageTemplate, {
              problem: args.problem,
              domain: args.domain,
            }),
          },
        },
      ],
    }),
  );

  // criticize_idea_harshly
  const criticizeConfig = getPromptConfig("criticize_idea_harshly");
  server.prompt(
    criticizeConfig.id,
    criticizeConfig.description,
    {
      ideaId: z
        .string()
        .describe(
          criticizeConfig.args.find((a) => a.name === "ideaId")?.description ??
            "The UUID of the idea to critique",
        ),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: applyTemplate(criticizeConfig.messageTemplate, {
              ideaId: args.ideaId,
            }),
          },
        },
      ],
    }),
  );

  // convert_idea_to_mvp_spec
  const convertConfig = getPromptConfig("convert_idea_to_mvp_spec");
  server.prompt(
    convertConfig.id,
    convertConfig.description,
    {
      ideaId: z
        .string()
        .describe(
          convertConfig.args.find((a) => a.name === "ideaId")?.description ??
            "The UUID of the shortlisted idea to convert to an MVP spec",
        ),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: applyTemplate(convertConfig.messageTemplate, {
              ideaId: args.ideaId,
            }),
          },
        },
      ],
    }),
  );

  // generate_code_only_ideas
  const generateConfig = getPromptConfig("generate_code_only_ideas");
  server.prompt(
    generateConfig.id,
    generateConfig.description,
    {
      domain: z
        .string()
        .describe(
          generateConfig.args.find((a) => a.name === "domain")?.description ??
            "The domain to generate ideas for",
        ),
      count: z
        .string()
        .optional()
        .describe(
          generateConfig.args.find((a) => a.name === "count")?.description ??
            "Number of candidates to generate (5-8, default 5)",
        ),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: applyTemplate(generateConfig.messageTemplate, {
              domain: args.domain,
              count: args.count ?? "5",
            }),
          },
        },
      ],
    }),
  );
}
