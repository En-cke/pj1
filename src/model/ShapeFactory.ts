import { CircleShape } from "./CircleShape.js";
import { ContainerShape } from "./ContainerShape.js";
import { EditorError } from "./EditorError.js";
import { EllipseShape } from "./EllipseShape.js";
import { LineShape } from "./LineShape.js";
import { RectShape } from "./RectShape.js";
import { Shape } from "./Shape.js";
import { TextShape } from "./TextShape.js";

export class ShapeFactory {
  create(type: string, id: string, args: string[]): Shape {
    const numeric = (index: number): number => {
      const value = Number(args[index]);
      if (!Number.isFinite(value)) throw new EditorError(`invalid number: ${args[index] ?? "missing"}`);
      return value;
    };
    switch (type) {
      case "rect": this.expect(type,args,4,5); return new RectShape(id,numeric(0),numeric(1),numeric(2),numeric(3),args[4]);
      case "circle": this.expect(type,args,3,4); return new CircleShape(id,numeric(0),numeric(1),numeric(2),args[3]);
      case "ellipse": this.expect(type,args,4,5); return new EllipseShape(id,numeric(0),numeric(1),numeric(2),numeric(3),args[4]);
      case "line": this.expect(type,args,4,5); return new LineShape(id,numeric(0),numeric(1),numeric(2),numeric(3),args[4]);
      case "text": this.expect(type,args,3,3); return new TextShape(id,numeric(0),numeric(1),args[2]);
      case "g": this.expect(type,args,0,0); return new ContainerShape(id);
      default: throw new EditorError(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
  }

  private expect(type:string,args:string[],min:number,max:number):void{
    if(args.length<min||args.length>max)throw new EditorError(`invalid parameters for ${type}`);
  }
}
