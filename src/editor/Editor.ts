import type { UndoableCommand } from "../command/Command.js";
import type { CommandDispatcher } from "./CommandDispatcher.js";
import { EditorError } from "../model/EditorError.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import type { Tokenizer } from "../parser/Tokenizer.js";

export class Editor {
  document?:SvgDocument;
  private readonly undoStack:UndoableCommand[]=[];
  private readonly redoStack:UndoableCommand[]=[];
  private historyBlocked=true;

  constructor(private readonly tokenizer:Tokenizer,private readonly dispatcher:CommandDispatcher){}

  requireDocument():SvgDocument{if(!this.document)throw new EditorError("no document. use 'init' or 'read' first");return this.document;}

  async executeLine(line:string):Promise<string>{
    try{
      const tokens=this.tokenizer.tokenize(line);if(tokens.length===0)return "";
      const command=this.dispatcher.dispatch(tokens);const result=await command.execute(this);
      if(command.kind==="edit"){
        if(this.historyBlocked){this.undoStack.length=0;this.redoStack.length=0;this.historyBlocked=false;}
        this.undoStack.push(command as UndoableCommand);this.redoStack.length=0;
      }else if(command.kind==="io"){
        this.historyBlocked=true;
      }
      return result;
    }catch(error){return `error: ${error instanceof Error?error.message:String(error)}`;}
  }

  undo():string{
    this.requireDocument();if(this.historyBlocked)throw new EditorError("undo not allowed after io command");
    const command=this.undoStack.pop();if(!command)throw new EditorError("nothing to undo");const result=command.undo(this);this.redoStack.push(command);return result;
  }

  redo():string{
    this.requireDocument();if(this.historyBlocked)throw new EditorError("undo not allowed after io command");
    const command=this.redoStack.pop();if(!command)throw new EditorError("nothing to redo");const result=command.redo(this);this.undoStack.push(command);return result;
  }
}
