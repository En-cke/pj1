import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DirCommand, DirPlugin } from "../plugins/dir/index.js";
import { NodeDirectoryAccess, type DirectoryAccess } from "../plugins/dir/directory.js";
import { StatsCommand } from "../plugins/stats/index.js";
import { ContainerShape, EditingCommand, SvgDocument, type CommandContext, type Manifest, type Shape } from "../src/api.js";
import { CommandDispatcher } from "../src/editor/CommandDispatcher.js";
import { Editor } from "../src/editor/Editor.js";
import { Registry } from "../src/extension/Registry.js";
import { installPlugin } from "../src/host/pluginLoader.js";
import { Tokenizer } from "../src/parser/Tokenizer.js";

const entries = [
  { name: "z.svg", directory: false }, { name: "plugins", directory: true },
  { name: ".keep", directory: false }, { name: "docs", directory: true },
  { name: ".", directory: true }, { name: "..", directory: true },
];
const sorted = "[DIR]  docs\n[DIR]  plugins\n[FILE]  .keep\n[FILE]  z.svg";
const fake: DirectoryAccess = { currentDirectory: () => "/test", entries: async () => entries };
const fail: DirectoryAccess = { ...fake, entries: async () => { throw new Error("unavailable"); } };
const manifest: Manifest = { name: "test-dir", contributes: { commands: ["dir"] } };
const execute = (command: DirCommand) => command.bind([]).execute({} as CommandContext);

describe("dir plugin", () => {
  it("lists mixed, hidden and empty entries with stable order", async () => {
    expect(await execute(new DirCommand(fake))).toBe(sorted);
    expect(await execute(new DirCommand({ ...fake, entries: async () => [...entries].reverse() }))).toBe(sorted);
    expect(await execute(new DirCommand({ ...fake, entries: async () => [] }))).toBe("(empty directory)");
    expect(() => new DirCommand(fake).bind(["x"])).toThrow("usage: dir");
  });

  it("uses the real adapter with a fixed temporary directory", async () => {
    const folder = await mkdtemp(join(tmpdir(), "svgframe-dir-"));
    try {
      class FixtureDirectory extends NodeDirectoryAccess {
        override currentDirectory() { return folder; }
      }
      const command = new DirCommand(new FixtureDirectory());
      expect(await execute(command)).toBe("(empty directory)");
      for (const entry of entries.slice(0, 4)) {
        const path = join(folder, entry.name);
        if (entry.directory) await mkdir(path);
        else await writeFile(path, "");
      }
      expect(await execute(command)).toBe(sorted);
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  });

  it("works in isolation without an initialized document", async () => {
    const registry = new Registry();
    await installPlugin(registry, new DirPlugin(fake), manifest, message => { throw new Error(message); });
    const editor = new Editor(new Tokenizer(), new CommandDispatcher(registry));
    expect(await editor.executeLine("dir")).toBe(sorted);
  });

  it.each([[fake, sorted], [fail, "error: cannot read directory: /test"]] as const)(
    "leaves document and both stacks intact through successful or failed listing",
    async (adapter, expected) => {
      const registry = new Registry();
      await installPlugin(registry, new DirPlugin(adapter), manifest, message => { throw new Error(message); });
      class Resize extends EditingCommand {
        protected apply(document: SvgDocument) {
          document.width++;
          return "resized";
        }
      }
      await installPlugin(registry, { activate: context => {
        context.register("commands", { name: "resize", bind: () => new Resize() });
      } }, { name: "test-edit", contributes: { commands: ["resize"] } }, message => { throw new Error(message); });
      const editor = new Editor(new Tokenizer(), new CommandDispatcher(registry));
      editor.document = new SvgDocument();
      editor.markSaved();
      await editor.executeLine("resize");
      await editor.executeLine("resize");
      editor.undo();
      const before = editor.requireDocument().toSvg();
      const saved = editor.saved;
      const cwd = process.cwd();
      expect(await editor.executeLine("dir")).toBe(expected);
      expect(editor.requireDocument().toSvg()).toBe(before);
      expect(editor.saved).toBe(saved);
      expect(process.cwd()).toBe(cwd);
      expect(editor.undo()).toBe("last edit undone");
      expect(editor.redo()).toBe("resized");
      expect(editor.redo()).toBe("resized");
    },
  );
});

describe("stats plugin", () => {
  it("counts in depth-first insertion order; groups and specialised containers are not leaves", () => {
    class Composite extends ContainerShape { override get kind() { return "composite"; } }
    const leaf = (id: string, kind: string) => ({ id, kind, validate() {} }) as Shape;
    const g = new ContainerShape("group");
    const c = new Composite("nested");
    g.add(c);
    // This tally is a pure traversal. Use a minimal read-only hierarchy as a test double.
    const children = new Map([[g, [c, leaf("r2", "rect")]], [c, [leaf("t", "text")]]]);
    Object.defineProperty(c, "children", { get: () => children.get(c) });
    Object.defineProperty(g, "children", { get: () => children.get(g) });
    const context = (children: readonly Shape[]) => ({
      requireDocument: () => ({ children }) as SvgDocument,
    }) as CommandContext;
    const command = new StatsCommand();
    expect(command.bind([]).execute(context([]))).toBe("(total 0, containers 0)");
    expect(command.bind([]).execute(context([leaf("r", "rect"), g, leaf("c", "circle")])))
      .toBe("rect: 2  text: 1  circle: 1  (total 4, containers 2)");
    expect(() => command.bind(["extra"])).toThrow("usage: stats");
  });
});
