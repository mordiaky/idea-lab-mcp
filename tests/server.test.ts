import { describe, it, expect } from "vitest";
import { spawn } from "child_process";
import { resolve } from "path";

describe("MCP Server startup", () => {
  it("starts without errors and produces no stdout output", async () => {
    const serverPath = resolve("src/server.ts");
    const proc = spawn("npx", ["tsx", serverPath], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    // Give the server 3 seconds to start, then kill it
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        proc.kill("SIGTERM");
        resolve();
      }, 3000);
    });

    // Server should produce ZERO stdout (INFRA-04)
    expect(stdout).toBe("");
    // Server should have logged startup to stderr
    expect(stderr).toContain("[idea-lab]");
  });
});
