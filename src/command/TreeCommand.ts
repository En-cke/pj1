import type { TreeDecorator, TreeRow } from "../extension/contracts.js";
import { EditorError } from "../model/EditorError.js";
import type { CommandContext, CommandInvocation } from "./Command.js";

export class TreeCommand implements CommandInvocation {
  readonly kind = "view" as const;

  constructor(private readonly args: string[], private readonly decorators: readonly TreeDecorator[]) {}

  execute(editor: CommandContext): string {
    if (this.args.length > 1) throw new EditorError("usage: tree [id]");
    const document = editor.requireDocument();
    return document.tree(this.args[0], shape => {
      const row: TreeRow = { document, saved: editor.saved, shape };
      return this.decorators.map(decorator => {
        const label = decorator.label(row);
        if (label === undefined || label === "") return "";
        if (typeof label !== "string" || /[\r\n]/.test(label)) {
          throw new EditorError("invalid tree label: " + decorator.name);
        }
        return " " + label;
      }).join("");
    });
  }
}
