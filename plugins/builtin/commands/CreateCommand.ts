import { ContainerShape } from "../../../src/api.js";
import { EditorError } from "../../../src/api.js";
import type { CreateShape } from "../../../src/api.js";
import type { SvgDocument } from "../../../src/api.js";
import { EditingCommand } from "../../../src/api.js";

export class CreateCommand extends EditingCommand {
  constructor(private readonly args:string[],private readonly create:CreateShape){super();}
  protected apply(document:SvgDocument):string{
    if(this.args.length<2)throw new EditorError("usage: create <type> <id> [params...] [in <containerId>]");
    const [type,id,...raw]=this.args;let parentId:string|undefined;let params=raw;
    if(raw.length>=2&&raw.at(-2)==="in"){parentId=raw.at(-1);params=raw.slice(0,-2);}
    const shape=this.create(type,id,params);document.add(shape,parentId);
    const destination = parentId ? " in g#" + parentId : "";
    return shape.commandName + " created" + destination + shape.creationDetails;
  }
  protected undoResult():string{return "created shape removed";}
}
