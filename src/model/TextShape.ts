import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class TextShape extends Shape {
  constructor(id:string,private x:number,private y:number,private content:string){super(id,"text");}
  move(dx:number,dy:number):void{this.x+=dx;this.y+=dy;}
  scale(factor:number):void{this.x*=factor;this.y*=factor;}
  summary():string{return `text#${this.id}  (${Format.number(this.x)},${Format.number(this.y)}) "${this.content}"${this.styleSummary()?` ${this.styleSummary()}`:""}`;}
  detailLines():string[]{return [`x=${Format.number(this.x)} y=${Format.number(this.y)}`,`text="${this.content}"`,...this.styleEntries().map(([k,v])=>`${k}=${v}`)];}
  toSvg(indent:number):string{return `${"  ".repeat(indent)}<text id="${Format.xml(this.id)}" x="${Format.number(this.x)}" y="${Format.number(this.y)}"${this.styleEntries().map(([k,v])=>` ${k}="${Format.xml(v)}"`).join("")}>${Format.text(this.content)}</text>`;}
  clone():TextShape{const r=new TextShape(this.id,this.x,this.y,this.content);this.copyStylesTo(r);return r;}
  protected setGeometry(name:string,value:string):boolean{if(name==="text"){this.content=value;return true;}if(name!=="x"&&name!=="y")return false;const n=this.parseNumber(name,value);if(name==="x")this.x=n;else this.y=n;return true;}
}
