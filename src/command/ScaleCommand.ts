import { EditorError } from "../model/EditorError.js";
import { Format } from "../model/Format.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class ScaleCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==2)throw new EditorError("usage: scale <id> <factor>");const factor=Number(this.args[1]);if(!Number.isFinite(factor)||factor<=0)throw new EditorError("scale factor must be positive");const shape=document.require(this.args[0]);shape.scale(factor);return `${shape.tag}#${shape.id} scaled by ${Format.number(factor)}`;}
  protected undoResult():string{return "scale undone";}
}
