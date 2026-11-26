import {
  SetCommand, TreeCommand, type AttributeHandler, type Command, type CommandInvocation,
  type CreateShape, type Plugin, type PluginContext, type SvgFiles, type TreeDecorator,
} from "../../src/api.js";
import { AddToCommand } from "./commands/AddToCommand.js";
import { CanvasCommand } from "./commands/CanvasCommand.js";
import { CreateCommand } from "./commands/CreateCommand.js";
import { DeleteCommand } from "./commands/DeleteCommand.js";
import { GroupCommand } from "./commands/GroupCommand.js";
import { HelpCommand } from "./commands/HelpCommand.js";
import { InitCommand } from "./commands/InitCommand.js";
import { MoveCommand } from "./commands/MoveCommand.js";
import { ReadCommand } from "./commands/ReadCommand.js";
import { RedoCommand } from "./commands/RedoCommand.js";
import { ReorderCommand } from "./commands/ReorderCommand.js";
import { SaveCommand } from "./commands/SaveCommand.js";
import { ScaleCommand } from "./commands/ScaleCommand.js";
import { ShowCommand } from "./commands/ShowCommand.js";
import { UndoCommand } from "./commands/UndoCommand.js";
import { UngroupCommand } from "./commands/UngroupCommand.js";
import { stockShapes } from "./providers.js";

class BuiltinCommand implements Command {
  constructor(readonly name: string, readonly bind: (args: string[]) => CommandInvocation) {}
}

export interface BuiltinServices {
  readonly create: CreateShape;
  readonly files: SvgFiles;
  readonly attributes: () => readonly AttributeHandler[];
  readonly decorators: () => readonly TreeDecorator[];
  readonly commandHelp: () => readonly string[];
  readonly extraShapes: () => readonly string[];
}

export class BuiltinPlugin implements Plugin {
  constructor(private readonly services: BuiltinServices) {}

  activate(context: PluginContext): void {
    const { create, files, attributes, decorators, commandHelp, extraShapes } = this.services;
    const commands = [
      new BuiltinCommand("init", args => new InitCommand(args)),
      new BuiltinCommand("read", args => new ReadCommand(args, files)),
      new BuiltinCommand("save", args => new SaveCommand(args, files)),
      new BuiltinCommand("canvas", args => new CanvasCommand(args)),
      new BuiltinCommand("create", args => new CreateCommand(args, create)),
      new BuiltinCommand("delete", args => new DeleteCommand(args)),
      new BuiltinCommand("move", args => new MoveCommand(args)),
      new BuiltinCommand("scale", args => new ScaleCommand(args)),
      new BuiltinCommand("set", args => new SetCommand(args, attributes())),
      new BuiltinCommand("group", args => new GroupCommand(args)),
      new BuiltinCommand("ungroup", args => new UngroupCommand(args)),
      new BuiltinCommand("addto", args => new AddToCommand(args)),
      new BuiltinCommand("front", args => new ReorderCommand(args, true)),
      new BuiltinCommand("back", args => new ReorderCommand(args, false)),
      new BuiltinCommand("tree", args => new TreeCommand(args, decorators())),
      new BuiltinCommand("show", args => new ShowCommand(args)),
      new BuiltinCommand("help", () => new HelpCommand(commandHelp(), extraShapes())),
      new BuiltinCommand("undo", () => new UndoCommand()),
      new BuiltinCommand("redo", () => new RedoCommand()),
    ];
    for (const command of commands) context.register("commands", command);
    for (const shape of stockShapes()) context.register("shapes", shape);
  }
}
