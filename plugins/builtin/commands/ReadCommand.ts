import type { CommandContext } from "../../../src/api.js";
import { EditorError } from "../../../src/api.js";
import type { SvgFiles } from "../../../src/api.js";
import type { CommandInvocation } from "../../../src/api.js";

export class ReadCommand implements CommandInvocation {
  readonly kind="io" as const;
  constructor(private readonly args:string[],private readonly files:SvgFiles){}
  async execute(editor:CommandContext):Promise<string>{if(this.args.length!==1)throw new EditorError("usage: read <file.svg>");const result=await this.files.read(this.args[0]);editor.document=result.document;editor.markSaved();return [...result.warnings,`read ${this.args[0]} (${result.document.count()} elements)`].join("\n");}
}
