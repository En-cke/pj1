import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class EllipseShape extends Shape {
  constructor(id: string, private cx: number, private cy: number, private rx: number, private ry: number, fill?: string) { super(id,"ellipse"); if(fill!==undefined)this.styles.set("fill",fill); }
  move(dx:number,dy:number):void{this.cx+=dx;this.cy+=dy;}
  scale(factor:number):void{this.cx*=factor;this.cy*=factor;this.rx*=factor;this.ry*=factor;}
  summary():string{return `ellipse#${this.id}  cx=${Format.number(this.cx)} cy=${Format.number(this.cy)} rx=${Format.number(this.rx)} ry=${Format.number(this.ry)}${this.styleSummary()?` ${this.styleSummary()}`:""}`;}
  detailLines():string[]{return [`cx=${Format.number(this.cx)} cy=${Format.number(this.cy)} rx=${Format.number(this.rx)} ry=${Format.number(this.ry)}`,...this.styleEntries().map(([k,v])=>`${k}=${v}`)];}
  toSvg(indent:number):string{return `${"  ".repeat(indent)}<ellipse id="${Format.xml(this.id)}" cx="${Format.number(this.cx)}" cy="${Format.number(this.cy)}" rx="${Format.number(this.rx)}" ry="${Format.number(this.ry)}"${this.styleEntries().map(([k,v])=>` ${k}="${Format.xml(v)}"`).join("")}/>`;}
  clone():EllipseShape{const r=new EllipseShape(this.id,this.cx,this.cy,this.rx,this.ry);this.copyStylesTo(r);return r;}
  protected setGeometry(name:string,value:string):boolean{if(!["cx","cy","rx","ry"].includes(name))return false;const n=this.parseNumber(name,value);if(name==="cx")this.cx=n;else if(name==="cy")this.cy=n;else if(name==="rx")this.rx=n;else this.ry=n;return true;}
}
