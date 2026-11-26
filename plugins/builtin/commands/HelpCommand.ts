import type { CommandInvocation } from "../../../src/api.js";

export class HelpCommand implements CommandInvocation {
  readonly kind="view" as const;
  constructor(private readonly pluginHelp: readonly string[], private readonly extraShapes: readonly string[]) {}
  execute():string{return [
    "Document: init [w] [h] | read <file.svg> | save [file.svg] | canvas [w] [h]",
    "Create:   create <rect|circle|ellipse|line|text|g> <id> [params...] [in <gid>]",
    "Edit:     delete <id> | move <id> <dx> <dy> | scale <id> <factor>",
    "          set <id> <attr> <value> | group <gid> <id...> | ungroup <gid>",
    "          addto <gid> <id> | front <id> | back <id>",
    "Display:  tree [id] | show <id> | help",
    "History:  undo | redo",
    ...this.pluginHelp,
    ...this.extraShapes.map(name => "Shape:    " + name),
  ].join("\n");}
}
