import { EditorError, type Command, type CommandInvocation, type Plugin, type PluginContext } from "../../src/api.js";
import { NodeDirectoryAccess, type DirectoryAccess } from "./directory.js";

export class DirCommand implements Command {
  readonly name = "dir";
  readonly help = "Plugin:   dir — list the working directory";

  constructor(private readonly directory: DirectoryAccess) {}

  bind(args: string[]): CommandInvocation {
    if (args.length) throw new EditorError("usage: dir");
    return { kind: "view", execute: () => this.list() };
  }

  private async list(): Promise<string> {
    const path = this.directory.currentDirectory();
    let entries;
    try {
      entries = await this.directory.entries(path);
    } catch {
      throw new EditorError("cannot read directory: " + path);
    }
    const visible = entries.filter(entry => entry.name !== "." && entry.name !== "..");
    visible.sort((a, b) => Number(b.directory) - Number(a.directory) ||
      (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    return visible.map(({ directory, name }) => (directory ? "[DIR]  " : "[FILE]  ") + name)
      .join("\n") || "(empty directory)";
  }
}

export class DirPlugin implements Plugin {
  constructor(private readonly directory: DirectoryAccess = new NodeDirectoryAccess()) {}

  activate(context: PluginContext): void {
    context.register("commands", new DirCommand(this.directory));
  }
}

export default new DirPlugin();
