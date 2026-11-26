import { EditorError } from "../../../src/api.js";
import type { SvgDocument } from "../../../src/api.js";
import { EditingCommand } from "../../../src/api.js";

export class ReorderCommand extends EditingCommand {
  constructor(private readonly args:string[],private readonly front:boolean){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==1)throw new EditorError(`usage: ${this.front?"front":"back"} <id>`);document.reorder(this.args[0],this.front);return `${this.args[0]} moved to ${this.front?"front":"back"}`;}
  protected undoResult():string{return "z-order change undone";}
}
