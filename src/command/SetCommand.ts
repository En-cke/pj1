import type { AttributeHandler } from "../extension/contracts.js";
import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class SetCommand extends EditingCommand {
  private undoMessage?: string;

  constructor(private readonly args: string[], private readonly handlers: readonly AttributeHandler[]) {
    super();
  }

  protected apply(document: SvgDocument): string {
    if (this.args.length !== 3) throw new EditorError("usage: set <id> <attr> <value>");
    const [id, name, value] = this.args;
    const shape = document.require(id);
    const matches = this.handlers.filter(handler => {
      const accepts = handler.handles(shape, name);
      if (typeof accepts !== "boolean") throw new EditorError("invalid attribute handler: " + handler.name);
      return accepts;
    });
    if (matches.length > 1) throw new EditorError("conflicting attribute handlers: " + name);
    if (matches.length === 1) {
      const change = matches[0].apply(shape, name, value);
      if (change !== undefined) {
        if (typeof change?.message !== "string" ||
            (change.undoMessage !== undefined && typeof change.undoMessage !== "string")) {
          throw new EditorError("invalid attribute change: " + matches[0].name);
        }
        this.undoMessage = change.undoMessage;
        return change.message;
      }
    } else {
      shape.setAttribute(name, value);
    }
    return shape.commandName + " updated: " + name + '="' + value + '"';
  }

  protected undoResult(): string { return this.undoMessage ?? "attribute change undone"; }
}
