import type { CommandContext } from "../../../src/api.js";
import { EditorError } from "../../../src/api.js";
import type { SvgFiles } from "../../../src/api.js";
import type { CommandInvocation } from "../../../src/api.js";

export class SaveCommand implements CommandInvocation {
  readonly kind="io" as const;
  constructor(private readonly args:string[],private readonly files:SvgFiles){}
  async execute(editor:CommandContext):Promise<string>{if(this.args.length>1)throw new EditorError("usage: save [file.svg]");const document=editor.requireDocument();const target=await this.files.save(document,this.args[0]);editor.markSaved();return `saved to ${this.args[0]??target} (${document.count()} elements)`;}
}
