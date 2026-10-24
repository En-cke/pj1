import type { Editor } from "../editor/Editor.js";
import type { Command } from "./Command.js";
export class RedoCommand implements Command {readonly kind="history" as const;execute(editor:Editor):string{return editor.redo();}}
