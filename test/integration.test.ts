import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ContainerShape, SetCommand, SvgDocument, type AttributeHandler, type Shape } from "../src/api.js";
import { CommandDispatcher } from "../src/editor/CommandDispatcher.js";
import { Editor } from "../src/editor/Editor.js";
import { Registry } from "../src/extension/Registry.js";
import { createEditor } from "../src/host/createEditor.js";
import { installPlugin } from "../src/host/pluginLoader.js";
import { Tokenizer } from "../src/parser/Tokenizer.js";

describe("box with the stock providers", () => {
  it("sets both attributes, supports ordered labels, moves nested children, and rolls back structure violations", async () => {
    const editor = await createEditor({ mode: "code" });
    const run = (line: string) => editor.executeLine(line);
    for (const line of ["init", "create g scene", 'create box n1 120 100 160 60 "开始" in scene',
      'create box inner 15 20 30 20 "inside" in n1']) {
      expect(await run(line)).not.toMatch(/^error:/);
    }
    expect(await run("tree")).toContain("g#n1 (box) *");
    expect(await run("stats")).toBe("rect: 2  text: 2  (total 4, containers 3)");
    expect(await run("set n1 fill #f5a623")).toBe("box#n1 fill propagated to n1-rect");
    expect(await run('set n1 label "处理数据 v2"')).toBe('box#n1 label updated: "处理数据 v2"');
    expect(await run("show n1-label")).toContain('text="处理数据 v2"');
    expect(await run("undo")).toBe('box#n1 label restored: "开始"');
    expect(await run("show n1-label")).toContain('text="开始"');
    expect(await run("undo")).toBe("attribute change undone");
    expect(await run("show n1-rect")).toContain("fill=#4a90d9");
    expect(await run("redo")).toBe("box#n1 fill propagated to n1-rect");
    expect(await run("show n1-rect")).toContain("fill=#f5a623");
    expect(await run("redo")).toContain("处理数据 v2");
    expect(await run("show n1-label")).toContain("处理数据 v2");
    expect(await run("move n1 10 100")).toBe("box#n1 moved by (10,100)");
    expect(await run("show inner-rect")).toContain("x=25 y=120");
    const before = editor.requireDocument().toSvg();
    for (const [line, error] of [
      ["delete n1-label", "invalid box"],
      ["addto scene n1-rect", "invalid box"],
      ["group misplaced n1-rect", "invalid box"],
      ["ungroup n1", "cannot ungroup composite shape: n1"],
    ]) {
      expect(await run(line)).toContain("error: " + error);
      expect(editor.requireDocument().toSvg()).toBe(before);
    }
    expect(await run("undo")).toBe("box#n1 moved back by (-10,-100)");
    expect(await run("show inner-rect")).toContain("x=15 y=20");
    expect(await run("delete n1")).toBe("box#n1 deleted");
    expect(await run("stats")).toBe("(total 0, containers 1)");
    await run("undo");
    expect(await run("tree")).toContain("g#inner (box)");
  });

  it("preflights derived ids, round-trips and degrades without the provider", async () => {
    const folder = await mkdtemp(join(tmpdir(), "svgframe-box-"));
    try {
      const file = join(folder, "box.svg");
      const editor = await createEditor({ mode: "code" });
      const run = (line: string) => editor.executeLine(line);
      await run("init");
      await run('create text n1-label 0 0 "reserved"');
      expect(await run('create box n1 0 0 1 1 "test"')).toBe("error: id already exists: n1-label");
      expect(await run("tree")).not.toContain("g#n1");
      await run("delete n1-label");
      await run('create box n1 120 100 160 60 "开始"');
      await run('save "' + file + '"');
      const xml = await readFile(file, "utf8");
      expect(xml).toContain('<g id="n1" data-kind="box">');
      expect(await run('read "' + file + '"')).toContain("(3 elements)");
      expect(await run("tree")).toContain("g#n1 (box)");
      expect(await run("tree")).not.toContain("*");
      const stock = await createEditor();
      await stock.executeLine('read "' + file + '"');
      expect(stock.requireDocument().require("n1").kind).toBe("g");
      expect(await stock.executeLine("set n1 label bad")).toBe("error: unknown attribute: label");
      expect(await stock.executeLine("set n1 fill red")).toBe('g#n1 updated: fill="red"');
      expect(await stock.executeLine("dir")).toBe("error: unknown command: dir");
      expect(await stock.executeLine("stats")).toBe("error: unknown command: stats");
      expect(await stock.executeLine("help")).not.toMatch(/Box|Plugin:|stats|dir/);
      const old = editor.requireDocument().toSvg();
      for (const [broken, error] of [
        [xml.replace(/ *<text[^\n]+\n/, ""), "invalid box"],
        [xml.replace(/<text[^\n]+<\/text>/, '<circle id="n1-label"/>'), "invalid box"],
        [xml.replace("</svg>", '<rect id="n1-rect"/></svg>'), "id already exists: n1-rect"],
      ]) {
        await writeFile(file, broken);
        expect(await run('read "' + file + '"')).toContain("error: " + error);
        expect(editor.requireDocument().toSvg()).toBe(old);
      }
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  });
});

it("keeps both undo and redo intact after a partial handler failure and rejects ambiguous matches", async () => {
  class Handler implements AttributeHandler {
    constructor(readonly name: string) {}
    handles(_shape: Shape, attr: string) { return attr === this.name; }
    apply(shape: Shape, _attr: string, value: string) {
      if (!(shape instanceof ContainerShape)) throw new Error("expected container");
      shape.children[0].setAttribute("fill", value);
      shape.children[1].setAttribute("stroke", value);
      if (this.name === "fail") throw new Error("simulated handler failure");
    }
  }
  const registry = new Registry();
  await installPlugin(registry, { activate: context => {
    context.register("commands", { name: "set", bind: args => new SetCommand(args, [
      new Handler("both"), new Handler("fail"), new Handler("ambiguous"), new Handler("ambiguous"),
    ]) });
  } }, { name: "test", contributes: { commands: ["set"] } }, message => { throw new Error(message); });
  const editor = new Editor(new Tokenizer(), new CommandDispatcher(registry));
  const doc = new SvgDocument();
  doc.add(new ContainerShape("target"));
  doc.add(new ContainerShape("a"), "target");
  doc.add(new ContainerShape("b"), "target");
  editor.document = doc;
  const initial = doc.toSvg();
  expect(await editor.executeLine("set target both red")).toContain("updated");
  const red = doc.toSvg();
  expect(red).toContain('<g id="a" fill="red"/>');
  expect(red).toContain('<g id="b" stroke="red"/>');
  await editor.executeLine("set target both blue");
  const blue = doc.toSvg();
  editor.undo();
  expect(doc.toSvg()).toBe(red);
  expect(await editor.executeLine("set target fail green")).toBe("error: simulated handler failure");
  expect(await editor.executeLine("set target ambiguous green")).toBe("error: conflicting attribute handlers: ambiguous");
  expect(doc.toSvg()).toBe(red);
  editor.undo();
  expect(doc.toSvg()).toBe(initial);
  editor.redo();
  expect(doc.toSvg()).toBe(red);
  editor.redo();
  expect(doc.toSvg()).toBe(blue);
});
