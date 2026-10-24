import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import type { FileService } from "../io/FileService.js";
import type { Command } from "./Command.js";

export class ReadCommand implements Command {
  readonly kind="io" as const;
  constructor(private readonly args:string[],private readonly files:FileService){}
  async execute(editor:Editor):Promise<string>{if(this.args.length!==1)throw new EditorError("usage: read <file.svg>");const result=await this.files.read(this.args[0]);editor.document=result.document;return [...result.warnings,`read ${this.args[0]} (${result.document.count()} elements)`].join("\n");}
}
