import { EditorError } from "../../../src/api.js";
import type { SvgDocument } from "../../../src/api.js";
import { EditingCommand } from "../../../src/api.js";

export class AddToCommand extends EditingCommand {
  constructor(private readonly args:string[]){super();}
  protected apply(document:SvgDocument):string{if(this.args.length!==2)throw new EditorError("usage: addto <gid> <id>");document.addTo(this.args[0],this.args[1]);return `${this.args[1]} moved into g#${this.args[0]}`;}
  protected undoResult():string{return "container move undone";}
}
