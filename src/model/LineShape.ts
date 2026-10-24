import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class LineShape extends Shape {
  constructor(id:string,private x1:number,private y1:number,private x2:number,private y2:number,stroke?:string){super(id,"line");if(stroke!==undefined)this.styles.set("stroke",stroke);}
  move(dx:number,dy:number):void{this.x1+=dx;this.y1+=dy;this.x2+=dx;this.y2+=dy;}
  scale(factor:number):void{this.x1*=factor;this.y1*=factor;this.x2*=factor;this.y2*=factor;}
  summary():string{return `line#${this.id}  (${Format.number(this.x1)},${Format.number(this.y1)}) -> (${Format.number(this.x2)},${Format.number(this.y2)})${this.styleSummary()?` ${this.styleSummary()}`:""}`;}
  detailLines():string[]{return [`x1=${Format.number(this.x1)} y1=${Format.number(this.y1)} x2=${Format.number(this.x2)} y2=${Format.number(this.y2)}`,...this.styleEntries().map(([k,v])=>`${k}=${v}`)];}
  toSvg(indent:number):string{return `${"  ".repeat(indent)}<line id="${Format.xml(this.id)}" x1="${Format.number(this.x1)}" y1="${Format.number(this.y1)}" x2="${Format.number(this.x2)}" y2="${Format.number(this.y2)}"${this.styleEntries().map(([k,v])=>` ${k}="${Format.xml(v)}"`).join("")}/>`;}
  clone():LineShape{const r=new LineShape(this.id,this.x1,this.y1,this.x2,this.y2);this.copyStylesTo(r);return r;}
  protected setGeometry(name:string,value:string):boolean{if(!["x1","y1","x2","y2"].includes(name))return false;const n=this.parseNumber(name,value);if(name==="x1")this.x1=n;else if(name==="y1")this.y1=n;else if(name==="x2")this.x2=n;else this.y2=n;return true;}
}
