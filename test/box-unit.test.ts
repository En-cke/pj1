import { expect, it } from "vitest";
import { BoxAttributes, BoxProvider } from "../plugins/box/box.js";
import { BoxTypeLabel } from "../plugins/box/index.js";
import { Shape, SvgDocument, type ShapeElement } from "../src/api.js";

class Part extends Shape {
  attributes = new Map<string, string>();
  constructor(id: string, tag: string, readonly args: readonly string[]) { super(id, tag); }
  override setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  clone() { return new Part(this.id, this.tag, this.args); }
  move() {}
  scale() {}
  summary() { return this.id; }
  detailLines() { return []; }
  toSvg() { return ""; }
  protected setGeometry() { return false; }
}
const provider = new BoxProvider("#f5a623");
const create = (tag: string, id: string, args: readonly string[]) => new Part(id, tag, args);
const element: ShapeElement = { tagName: "g", textContent: "", getAttribute: () => null };

it("creates and edits a box with shape creation test doubles only", () => {
  const box = provider.create("n1", ["120", "100", "160", "60", "开始"], create);
  const rect = box.part("rect") as Part;
  const label = box.part("label") as Part;
  expect(rect.args).toEqual(["120", "100", "160", "60", "#f5a623"]);
  expect(label.args).toEqual(["140", "135", "开始"]);
  const handler = new BoxAttributes();
  expect(handler.handles(rect, "fill")).toBe(false);
  expect(handler.handles(box, "fill")).toBe(true);
  handler.apply(box, "fill", "red");
  handler.apply(box, "label", "处理数据 v2");
  expect(rect.attributes.get("fill")).toBe("red");
  expect(label.attributes.get("text")).toBe("处理数据 v2");
  expect(box.toSvg(0)).toContain('data-kind="box"');
  expect(new BoxTypeLabel().label({ shape: box, document: new SvgDocument() })).toBe("(box)");
  expect(new BoxTypeLabel().label({ shape: rect, document: new SvgDocument() })).toBeUndefined();
});

it("rejects missing and wrong-type parts in decoded SVG", () => {
  expect(() => provider.read("n1", element, [])).toThrow("requires rect#n1-rect");
  const rect = new Part("n1-rect", "rect", []);
  expect(() => provider.read("n1", element, [rect, new Part("n1-label", "rect", [])]))
    .toThrow("requires text#n1-label");
});
