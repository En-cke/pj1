import { EditorError } from "../../../src/api.js";
import { Format } from "../../../src/api.js";
import type { SvgDocument } from "../../../src/api.js";
import { EditingCommand } from "../../../src/api.js";

export class MoveCommand extends EditingCommand {
  private undoName = "";
  private dx = 0;
  private dy = 0;
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==3)throw new EditorError("usage: move <id> <dx> <dy>");const id=this.args[0];this.dx=Number(this.args[1]);this.dy=Number(this.args[2]);if(!Number.isFinite(this.dx)||!Number.isFinite(this.dy))throw new EditorError("move distance must be numeric");const shape=document.require(id);this.undoName=shape.undoMoveName;shape.move(this.dx,this.dy);return `${shape.commandName} moved by (${Format.number(this.dx)},${Format.number(this.dy)})`;}
  protected undoResult():string{return `${this.undoName} moved back by (${Format.number(-this.dx)},${Format.number(-this.dy)})`;}
}
