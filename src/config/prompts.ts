import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface PromptArgDef {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface PromptConfig {
  id: string;
  name: string;
  description: string;
  messageTemplate: string;
  args: PromptArgDef[];
}

export interface PromptsConfig {
  prompts: PromptConfig[];
}

const promptsPath = resolve(__dirname, "../../config/prompts.json");

export const promptsConfig: PromptsConfig = JSON.parse(
  readFileSync(promptsPath, "utf-8"),
);
