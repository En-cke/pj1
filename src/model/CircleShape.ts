import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class CircleShape extends Shape {
  constructor(id: string, private cx: number, private cy: number, private r: number, fill?: string) { super(id, "circle"); if (fill !== undefined) this.styles.set("fill", fill); }
  move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.r *= factor; }
  summary(): string { return `circle#${this.id}  cx=${Format.number(this.cx)} cy=${Format.number(this.cy)} r=${Format.number(this.r)}${this.styleSummary() ? ` ${this.styleSummary()}` : ""}`; }
  detailLines(): string[] { return [`cx=${Format.number(this.cx)} cy=${Format.number(this.cy)} r=${Format.number(this.r)}`, ...this.styleEntries().map(([k,v]) => `${k}=${v}`)]; }
  toSvg(indent: number): string { return `${"  ".repeat(indent)}<circle id="${Format.xml(this.id)}" cx="${Format.number(this.cx)}" cy="${Format.number(this.cy)}" r="${Format.number(this.r)}"${this.styleEntries().map(([k,v]) => ` ${k}="${Format.xml(v)}"`).join("")}/>`; }
  clone(): CircleShape { const r = new CircleShape(this.id, this.cx, this.cy, this.r); this.copyStylesTo(r); return r; }
  protected setGeometry(name: string, value: string): boolean { if(!["cx","cy","r"].includes(name))return false; const n=this.parseNumber(name,value); if(name==="cx")this.cx=n; else if(name==="cy")this.cy=n; else this.r=n; return true; }
}
