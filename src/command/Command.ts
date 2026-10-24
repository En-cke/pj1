import type { Editor } from "../editor/Editor.js";

export type CommandKind = "edit" | "io" | "view" | "history";

export interface Command {
  readonly kind: CommandKind;
  execute(editor: Editor): Promise<string> | string;
}

export interface UndoableCommand extends Command {
  readonly kind: "edit";
  undo(editor: Editor): string;
  redo(editor: Editor): string;
}
