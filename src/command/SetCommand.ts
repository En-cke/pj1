import type { AttributeHandler } from "../extension/contracts.js";
import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class SetCommand extends EditingCommand {
  constructor(private readonly args: string[], private readonly handlers: readonly AttributeHandler[]) {
    super();
  }

  protected apply(document: SvgDocument): string {
    if (this.args.length !== 3) throw new EditorError("usage: set <id> <attr> <value>");
    const [id, name, value] = this.args;
    const shape = document.require(id);
    const matches = this.handlers.filter(handler => handler.handles(shape, name));
    if (matches.length > 1) throw new EditorError("conflicting attribute handlers: " + name);
    if (matches.length === 1) matches[0].apply(shape, name, value);
    else shape.setAttribute(name, value);
    return shape.tag + "#" + shape.id + " updated: " + name + '="' + value + '"';
  }

  protected undoResult(): string { return "attribute change undone"; }
}
