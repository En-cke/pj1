import type { Editor } from "../editor/Editor.js";
import type { Command } from "./Command.js";
export class UndoCommand implements Command {readonly kind="history" as const;execute(editor:Editor):string{return editor.undo();}}
