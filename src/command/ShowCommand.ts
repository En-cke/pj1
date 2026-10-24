import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import type { Command } from "./Command.js";

export class ShowCommand implements Command {readonly kind="view" as const;constructor(private readonly args:string[]){}execute(editor:Editor):string{if(this.args.length!==1)throw new EditorError("usage: show <id>");return editor.requireDocument().show(this.args[0]);}}
