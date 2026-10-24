import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class SetCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==3)throw new EditorError("usage: set <id> <attr> <value>");const [id,name,value]=this.args;const shape=document.require(id);shape.setAttribute(name,value);return `${shape.tag}#${shape.id} updated: ${name}="${value}"`;}
  protected undoResult():string{return "attribute change undone";}
}
