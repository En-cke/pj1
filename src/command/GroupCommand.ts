import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class GroupCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length<2)throw new EditorError("usage: group <newGid> <id1> <id2>...");const group=document.group(this.args[0],this.args.slice(1));return `g#${group.id} created with ${group.children.length} children`;}
  protected undoResult():string{return "group dissolved";}
}
