import { ContainerShape } from "../model/ContainerShape.js";
import { EditorError } from "../model/EditorError.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import type { SvgDocument } from "../model/SvgDocument.js";
import { EditingCommand } from "./EditingCommand.js";

export class CreateCommand extends EditingCommand {
  constructor(private readonly args:string[],private readonly factory:ShapeFactory){super();}
  protected apply(document:SvgDocument):string{
    if(this.args.length<2)throw new EditorError("usage: create <type> <id> [params...] [in <containerId>]");
    const [type,id,...raw]=this.args;let parentId:string|undefined;let params=raw;
    if(raw.length>=2&&raw.at(-2)==="in"){parentId=raw.at(-1);params=raw.slice(0,-2);}
    const shape=this.factory.create(type,id,params);document.add(shape,parentId);
    return `${shape.tag}#${shape.id} created${parentId?` in g#${parentId}`:""}`;
  }
  protected undoResult():string{return "created shape removed";}
}
