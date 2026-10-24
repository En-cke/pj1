import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createEditor } from "../src/editor/createEditor.js";
import type { Editor } from "../src/editor/Editor.js";

describe("SVG Editor CLI",()=>{
  let editor:Editor;
  const temporary:string[]=[];
  beforeEach(()=>{editor=createEditor();});
  afterAll(async()=>{for(const path of temporary)await rm(path,{recursive:true,force:true});});
  const run=(line:string)=>editor.executeLine(line);

  it("初始化画布并创建六种内置图形",async()=>{
    expect(await run("init")).toBe("canvas 800x600 created");
    expect(await run("create rect r1 10 20 100 50 #eee")).toBe("rect#r1 created");
    await run("create circle c1 100 100 20 red");
    await run("create ellipse e1 30 40 10 20 blue");
    await run("create line l1 0 0 50 50 black");
    await run('create text t1 20 40 "My Diagram"');
    await run("create g scene");
    expect(await run("tree")).toContain('text#t1  (20,40) "My Diagram"');
    expect(await run("tree")).toContain("g#scene");
  });

  it("支持创建时指定父容器和大小写敏感的唯一 ID",async()=>{
    await run("init 400 300");await run("create g node");
    expect(await run("create rect A 0 0 10 10 in node")).toBe("rect#A created in g#node");
    expect(await run("create circle A 1 1 1")).toBe("error: id already exists: A");
    expect(await run("create circle a 1 1 1")).toBe("circle#a created");
  });

  it("容器统一执行递归移动与缩放",async()=>{
    await run("init");await run("create g node");await run("create rect r1 10 20 100 50 in node");await run('create text t1 20 40 "标题" in node');
    await run("move node 5 10");await run("scale node 2");
    expect(await run("show r1")).toContain("x=30 y=60 width=200 height=100");
    expect(await run("show t1")).toContain("x=50 y=100");
  });

  it("修改属性遵循白名单且失败不改变状态",async()=>{
    await run("init");await run("create circle c1 10 10 5 red");const before=await run("show c1");
    expect(await run("set c1 href bad")).toBe("error: unknown attribute: href");
    expect(await run("show c1")).toBe(before);
    expect(await run("set c1 stroke black")).toBe('circle#c1 updated: stroke="black"');
  });

  it("完成分组、移动归属和层级调整",async()=>{
    await run("init");await run("create g outer");await run("create rect a 0 0 1 1 in outer");await run("create circle b 0 0 1 in outer");
    expect(await run("group inner a b")).toBe("g#inner created with 2 children");
    await run("create rect c 0 0 2 2 in outer");await run("addto inner c");await run("back c");
    const tree=await run("tree inner");expect(tree.indexOf("rect#c")).toBeLessThan(tree.indexOf("rect#a"));
    expect(await run("ungroup inner")).toContain("3 children promoted");
  });

  it("分组时保持图形原有相对顺序",async()=>{
    await run("init");await run("create rect a 0 0 1 1");await run("create rect b 0 0 1 1");await run("create rect c 0 0 1 1");
    await run("group kept c a");const tree=await run("tree kept");expect(tree.indexOf("rect#a")).toBeLessThan(tree.indexOf("rect#c"));
  });

  it("拒绝循环分组和顶层解组",async()=>{
    await run("init");await run("create g g1");await run("create g g2 in g1");
    expect(await run("group bad g1 g2")).toBe("error: cannot group a container into its own descendant: g1");
    expect(await run("ungroup g1")).toBe("error: cannot ungroup top-level container: g1");
  });

  it("按一条编辑命令的粒度撤销和重做",async()=>{
    await run("init");await run("create rect r1 10 20 30 40");await run("move r1 5 0");
    expect(await run("undo")).toContain("moved back");expect(await run("show r1")).toContain("x=10");
    expect(await run("redo")).toContain("moved by");expect(await run("show r1")).toContain("x=15");
  });

  it("撤销后新编辑会清空重做栈",async()=>{
    await run("init");await run("create rect r1 0 0 1 1");await run("move r1 1 0");await run("undo");await run("move r1 2 0");
    expect(await run("redo")).toBe("error: nothing to redo");
  });

  it("文档及 IO 命令之后禁止撤销",async()=>{
    expect(await run("init")).toContain("created");expect(await run("undo")).toBe("error: undo not allowed after io command");
    await run("create rect r1 0 0 1 1");const dir=await mkdtemp(join(tmpdir(),"svg-editor-"));temporary.push(dir);await run(`save "${join(dir,"demo.svg")}"`);
    expect(await run("undo")).toBe("error: undo not allowed after io command");
  });

  it("保存标准 SVG 并再次读回",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"svg-editor-"));temporary.push(dir);const file=join(dir,"roundtrip.svg");
    await run("init 400 200");await run("create g flow");await run("create rect start 30 70 120 60 #4a90d9 in flow");await run('create text title 50 100 "A&B" in flow');await run(`save "${file}"`);
    const xml=await readFile(file,"utf8");expect(xml).toContain("A&amp;B");
    const second=createEditor();expect(await second.executeLine(`read "${file}"`)).toContain("(3 elements)");expect(await second.executeLine("tree")).toContain('"A&B"');
  });

  it("读入外部 SVG 时为匿名元素补 ID",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"svg-editor-"));temporary.push(dir);const file=join(dir,"input.svg");
    await writeFile(file,'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect x="0" y="0" width="10" height="20"/><g id="g1"><circle cx="5" cy="5" r="2"/></g></svg>');
    const result=await run(`read "${file}"`);expect(result).toContain("warning: assigned id rect1");expect(result).toContain("warning: assigned id circle1");expect(await run("tree")).toContain("circle#circle1");
  });

  it("自动编号会避开后续显式 ID",async()=>{
    const dir=await mkdtemp(join(tmpdir(),"svg-editor-"));temporary.push(dir);const file=join(dir,"ids.svg");
    await writeFile(file,'<svg xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="1" height="1"/><rect id="rect1" x="1" y="1" width="1" height="1"/></svg>');
    expect(await run(`read "${file}"`)).toContain("assigned id rect2");
  });

  it("处理注释、引号和常见错误",async()=>{
    expect(await run("# replay comment")).toBe("");expect(await run("tree")).toBe("error: no document. use 'init' or 'read' first");expect(await run("wat")).toBe("error: unknown command: wat");
    await run("init");expect(await run('create text t 0 0 "not closed')).toBe("error: unterminated quoted string");expect(await run("scale none 0")).toBe("error: scale factor must be positive");
    expect(await run("create box n1 0 0 10 10 title")).toBe("error: unknown shape type: box (is the plugin loaded?)");
  });
});
