import type { CommandContext } from "../../../src/api.js";
import { EditorError } from "../../../src/api.js";
import { Format } from "../../../src/api.js";
import type { CommandInvocation, CommandKind } from "../../../src/api.js";

export class CanvasCommand implements CommandInvocation {
  readonly kind:CommandKind;
  constructor(private readonly args:string[]){this.kind=args.length===0?"view":"io";}
  execute(editor:CommandContext):string{const document=editor.requireDocument();if(this.args.length===0)return `canvas ${Format.number(document.width)}x${Format.number(document.height)}`;if(this.args.length!==2)throw new EditorError("usage: canvas [w] [h]");const width=Number(this.args[0]);const height=Number(this.args[1]);if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new EditorError("canvas dimensions must be positive");document.width=width;document.height=height;return `canvas resized to ${Format.number(width)}x${Format.number(height)}`;}
}
