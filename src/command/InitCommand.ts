import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import { Format } from "../model/Format.js";
import { SvgDocument } from "../model/SvgDocument.js";
import type { Command } from "./Command.js";

export class InitCommand implements Command {
  readonly kind="io" as const;
  constructor(private readonly args:string[]){}
  execute(editor:Editor):string{if(this.args.length!==0&&this.args.length!==2)throw new EditorError("usage: init [w] [h]");const width=this.args.length?Number(this.args[0]):800;const height=this.args.length?Number(this.args[1]):600;if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new EditorError("canvas dimensions must be positive");editor.document=new SvgDocument(width,height);return `canvas ${Format.number(width)}x${Format.number(height)} created`;}
}
