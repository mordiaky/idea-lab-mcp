import Database from "better-sqlite3";
import path from "path";
import os from "os";

const dbPath =
  process.env.IDEA_LAB_DB ||
  path.join(os.homedir(), ".idea-lab", "ideas.db");

export const db = new Database(dbPath, { readonly: true });
db.pragma("journal_mode = WAL");

export function getWritableDb(): Database.Database {
  return new Database(dbPath);
}
