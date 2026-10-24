import type { Editor } from "../editor/Editor.js";
import { EditorError } from "../model/EditorError.js";
import type { Command } from "./Command.js";

export class TreeCommand implements Command {readonly kind="view" as const;constructor(private readonly args:string[]){}execute(editor:Editor):string{if(this.args.length>1)throw new EditorError("usage: tree [id]");return editor.requireDocument().tree(this.args[0]);}}
