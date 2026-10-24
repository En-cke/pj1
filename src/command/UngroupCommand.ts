import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class UngroupCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==1)throw new EditorError("usage: ungroup <gid>");const count=document.ungroup(this.args[0]);return `g#${this.args[0]} ungrouped (${count} children promoted)`;}
  protected undoResult():string{return "group restored";}
}
