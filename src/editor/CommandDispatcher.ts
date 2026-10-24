import { AddToCommand } from "../command/AddToCommand.js";
import { CanvasCommand } from "../command/CanvasCommand.js";
import type { Command } from "../command/Command.js";
import { CreateCommand } from "../command/CreateCommand.js";
import { DeleteCommand } from "../command/DeleteCommand.js";
import { GroupCommand } from "../command/GroupCommand.js";
import { HelpCommand } from "../command/HelpCommand.js";
import { InitCommand } from "../command/InitCommand.js";
import { MoveCommand } from "../command/MoveCommand.js";
import { ReadCommand } from "../command/ReadCommand.js";
import { RedoCommand } from "../command/RedoCommand.js";
import { ReorderCommand } from "../command/ReorderCommand.js";
import { SaveCommand } from "../command/SaveCommand.js";
import { ScaleCommand } from "../command/ScaleCommand.js";
import { SetCommand } from "../command/SetCommand.js";
import { ShowCommand } from "../command/ShowCommand.js";
import { TreeCommand } from "../command/TreeCommand.js";
import { UndoCommand } from "../command/UndoCommand.js";
import { UngroupCommand } from "../command/UngroupCommand.js";
import type { FileService } from "../io/FileService.js";
import { EditorError } from "../model/EditorError.js";
import type { ShapeFactory } from "../model/ShapeFactory.js";

type Builder=(args:string[])=>Command;

export class CommandDispatcher {
  private readonly builders:Map<string,Builder>;
  constructor(factory:ShapeFactory,files:FileService){
    this.builders=new Map<string,Builder>([
      ["init",args=>new InitCommand(args)], ["read",args=>new ReadCommand(args,files)], ["save",args=>new SaveCommand(args,files)], ["canvas",args=>new CanvasCommand(args)],
      ["create",args=>new CreateCommand(args,factory)], ["delete",args=>new DeleteCommand(args)], ["move",args=>new MoveCommand(args)], ["scale",args=>new ScaleCommand(args)], ["set",args=>new SetCommand(args)],
      ["group",args=>new GroupCommand(args)], ["ungroup",args=>new UngroupCommand(args)], ["addto",args=>new AddToCommand(args)], ["front",args=>new ReorderCommand(args,true)], ["back",args=>new ReorderCommand(args,false)],
      ["tree",args=>new TreeCommand(args)], ["show",args=>new ShowCommand(args)], ["help",()=>new HelpCommand()], ["undo",()=>new UndoCommand()], ["redo",()=>new RedoCommand()],
    ]);
  }
  dispatch(tokens:string[]):Command{const [name,...args]=tokens;const builder=this.builders.get(name);if(!builder)throw new EditorError(`unknown command: ${name}`);return builder(args);}
}
