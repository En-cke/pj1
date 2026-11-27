import { readdir } from "node:fs/promises";

export interface DirectoryEntry { readonly name: string; readonly directory: boolean }

export interface DirectoryAccess {
  currentDirectory(): string;
  entries(path: string): Promise<readonly DirectoryEntry[]>;
}

export class NodeDirectoryAccess implements DirectoryAccess {
  currentDirectory(): string { return process.cwd(); }

  async entries(path: string): Promise<readonly DirectoryEntry[]> {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.map(entry => ({ name: entry.name, directory: entry.isDirectory() }));
  }
}
