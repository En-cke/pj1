import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class ContainerShape extends Shape {
  private readonly items: Shape[] = [];

  constructor(id: string) {
    super(id, "g");
  }

  get children(): readonly Shape[] {
    return this.items;
  }

  add(shape: Shape, index = this.items.length): void {
    shape.parent?.remove(shape);
    this.items.splice(index, 0, shape);
    shape.attachTo(this);
  }

  remove(shape: Shape): number {
    const index = this.items.indexOf(shape);
    if (index >= 0) {
      this.items.splice(index, 1);
      shape.attachTo(null);
    }
    return index;
  }

  indexOf(shape: Shape): number {
    return this.items.indexOf(shape);
  }

  move(dx: number, dy: number): void {
    for (const child of this.items) child.move(dx, dy);
  }

  scale(factor: number): void {
    for (const child of this.items) child.scale(factor);
  }

  summary(): string {
    const style = this.styleSummary();
    return `g#${this.id}${style ? `  ${style}` : ""}`;
  }

  detailLines(): string[] {
    const lines = [`children=${this.items.length}`];
    const style = this.styleSummary();
    if (style) lines.push(style);
    return lines;
  }

  toSvg(indent: number): string {
    const pad = "  ".repeat(indent);
    const attrs = this.styleEntries().map(([k, v]) => ` ${k}="${Format.xml(v)}"`).join("");
    if (this.items.length === 0) return `${pad}<g id="${Format.xml(this.id)}"${attrs}/>`;
    const content = this.items.map((item) => item.toSvg(indent + 1)).join("\n");
    return `${pad}<g id="${Format.xml(this.id)}"${attrs}>\n${content}\n${pad}</g>`;
  }

  clone(): ContainerShape {
    const result = new ContainerShape(this.id);
    this.copyStylesTo(result);
    for (const child of this.items) result.add(child.clone());
    return result;
  }

  contains(candidate: Shape): boolean {
    for (const child of this.items) {
      if (child === candidate) return true;
      if (child instanceof ContainerShape && child.contains(candidate)) return true;
    }
    return false;
  }

  protected setGeometry(): boolean {
    return false;
  }
}
