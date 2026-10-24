import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class DeleteCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==1)throw new EditorError("usage: delete <id>");const shape=document.remove(this.args[0]);return `${shape.tag}#${shape.id} deleted`;}
  protected undoResult():string{return "deleted shape restored";}
}
