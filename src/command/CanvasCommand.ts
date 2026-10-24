import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import { Format } from "../model/Format.js";
import type { Command, CommandKind } from "./Command.js";

export class CanvasCommand implements Command {
  readonly kind:CommandKind;
  constructor(private readonly args:string[]){this.kind=args.length===0?"view":"io";}
  execute(editor:Editor):string{const document=editor.requireDocument();if(this.args.length===0)return `canvas ${Format.number(document.width)}x${Format.number(document.height)}`;if(this.args.length!==2)throw new EditorError("usage: canvas [w] [h]");const width=Number(this.args[0]);const height=Number(this.args[1]);if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new EditorError("canvas dimensions must be positive");document.width=width;document.height=height;return `canvas resized to ${Format.number(width)}x${Format.number(height)}`;}
}
