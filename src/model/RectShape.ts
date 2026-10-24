import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class RectShape extends Shape {
  constructor(id: string, private x: number, private y: number, private width: number, private height: number, fill?: string) {
    super(id, "rect");
    if (fill !== undefined) this.styles.set("fill", fill);
  }

  move(dx: number, dy: number): void { this.x += dx; this.y += dy; }
  scale(factor: number): void { this.x *= factor; this.y *= factor; this.width *= factor; this.height *= factor; }
  summary(): string { return `rect#${this.id}  x=${Format.number(this.x)} y=${Format.number(this.y)} w=${Format.number(this.width)} h=${Format.number(this.height)}${this.styleSummary() ? ` ${this.styleSummary()}` : ""}`; }
  detailLines(): string[] { return [`x=${Format.number(this.x)} y=${Format.number(this.y)} width=${Format.number(this.width)} height=${Format.number(this.height)}`, ...this.styleEntries().map(([k, v]) => `${k}=${v}`)]; }
  toSvg(indent: number): string { return `${"  ".repeat(indent)}<rect id="${Format.xml(this.id)}" x="${Format.number(this.x)}" y="${Format.number(this.y)}" width="${Format.number(this.width)}" height="${Format.number(this.height)}"${this.styleEntries().map(([k,v]) => ` ${k}="${Format.xml(v)}"`).join("")}/>`; }
  clone(): RectShape { const r = new RectShape(this.id, this.x, this.y, this.width, this.height); this.copyStylesTo(r); return r; }
  protected setGeometry(name: string, value: string): boolean { if(!["x","y","width","height"].includes(name))return false; const n = this.parseNumber(name, value); if (name === "x") this.x=n; else if (name === "y") this.y=n; else if (name === "width") this.width=n; else this.height=n; return true; }
}
