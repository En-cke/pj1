import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import type { FileService } from "../io/FileService.js";
import type { Command } from "./Command.js";

export class SaveCommand implements Command {
  readonly kind="io" as const;
  constructor(private readonly args:string[],private readonly files:FileService){}
  async execute(editor:Editor):Promise<string>{if(this.args.length>1)throw new EditorError("usage: save [file.svg]");const document=editor.requireDocument();const target=await this.files.save(document,this.args[0]);return `saved to ${target} (${document.count()} elements)`;}
}
