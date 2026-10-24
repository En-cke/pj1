import type { Editor } from "../editor/Editor.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import type { UndoableCommand } from "./Command.js";

export abstract class EditingCommand implements UndoableCommand {
  readonly kind = "edit" as const;
  private before?: SvgDocument;
  private after?: SvgDocument;
  private result = "";

  execute(editor: Editor): string {
    const document = editor.requireDocument();
    this.before = document.clone();
    try {
      this.result = this.apply(document);
      this.after = document.clone();
      return this.result;
    } catch (error) {
      document.restore(this.before);
      throw error;
    }
  }

  undo(editor: Editor): string {
    editor.requireDocument().restore(this.before!);
    return this.undoResult();
  }

  redo(editor: Editor): string {
    editor.requireDocument().restore(this.after!);
    return this.result;
  }

  protected undoResult(): string {
    return "last edit undone";
  }

  protected abstract apply(document: SvgDocument): string;
}
