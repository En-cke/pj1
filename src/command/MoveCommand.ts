import { EditorError } from "../model/EditorError.js";
import { Format } from "../model/Format.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class MoveCommand extends EditingCommand {
  private id="";private dx=0;private dy=0;
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==3)throw new EditorError("usage: move <id> <dx> <dy>");this.id=this.args[0];this.dx=Number(this.args[1]);this.dy=Number(this.args[2]);if(!Number.isFinite(this.dx)||!Number.isFinite(this.dy))throw new EditorError("move distance must be numeric");const shape=document.require(this.id);shape.move(this.dx,this.dy);return `${shape.tag}#${shape.id} moved by (${Format.number(this.dx)},${Format.number(this.dy)})`;}
  protected undoResult():string{return `${this.id} moved back by (${Format.number(-this.dx)},${Format.number(-this.dy)})`;}
}
