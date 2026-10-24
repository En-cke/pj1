import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class ReorderCommand extends EditingCommand {
  constructor(private readonly args:string[],private readonly front:boolean){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==1)throw new EditorError(`usage: ${this.front?"front":"back"} <id>`);document.reorder(this.args[0],this.front);return `${this.args[0]} moved to ${this.front?"front":"back"}`;}
  protected undoResult():string{return "z-order change undone";}
}
