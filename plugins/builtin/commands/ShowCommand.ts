import type { CommandContext } from "../../../src/api.js";
import { EditorError } from "../../../src/api.js";
import type { CommandInvocation } from "../../../src/api.js";

export class ShowCommand implements CommandInvocation {readonly kind="view" as const;constructor(private readonly args:string[]){}execute(editor:CommandContext):string{if(this.args.length!==1)throw new EditorError("usage: show <id>");return editor.requireDocument().show(this.args[0]);}}
