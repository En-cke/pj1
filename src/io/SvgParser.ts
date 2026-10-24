import { DOMParser } from "@xmldom/xmldom";
import { ContainerShape } from "../model/ContainerShape.js";
import { EditorError } from "../model/EditorError.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";

export interface ParseResult {
  document: SvgDocument;
  warnings: string[];
}

export class SvgParser {
  constructor(private readonly factory: ShapeFactory) {}

  parse(xml: string, sourcePath?: string): ParseResult {
    const errors: string[] = [];
    const dom = new DOMParser({ errorHandler: { warning:()=>{}, error:(message)=>errors.push(message), fatalError:(message)=>errors.push(message) } }).parseFromString(xml, "image/svg+xml");
    if (errors.length > 0 || dom.documentElement.tagName !== "svg") throw new EditorError("invalid SVG document");
    const root = dom.documentElement;
    const width = this.dimension(root.getAttribute("width"), 800);
    const height = this.dimension(root.getAttribute("height"), 600);
    const document = new SvgDocument(width, height);
    document.sourcePath = sourcePath;
    const warnings: string[] = [];
    const counters = new Map<string, number>();

    const visit = (element: Element, parentId?: string): void => {
      const type = element.tagName;
      if (!["rect", "circle", "ellipse", "line", "text", "g"].includes(type)) return;
      let id = element.getAttribute("id") ?? "";
      if (!id) {
        let next = (counters.get(type) ?? 0) + 1;
        while (document.find(`${type}${next}`)) next++;
        counters.set(type, next);
        id = `${type}${next}`;
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const attr = (name:string, fallback="0") => element.getAttribute(name) ?? fallback;
      let args: string[];
      switch(type) {
        case "rect": args=[attr("x"),attr("y"),attr("width"),attr("height")]; break;
        case "circle": args=[attr("cx"),attr("cy"),attr("r")]; break;
        case "ellipse": args=[attr("cx"),attr("cy"),attr("rx"),attr("ry")]; break;
        case "line": args=[attr("x1"),attr("y1"),attr("x2"),attr("y2")]; break;
        case "text": args=[attr("x"),attr("y"),element.textContent ?? ""]; break;
        case "g": args=[]; break;
        default: args=[];
      }
      const shape=this.factory.create(type,id,args);
      for(const style of ["fill","stroke","stroke-width"]){const value=element.getAttribute(style);if(value!==null&&value!=="")shape.setAttribute(style,value);}
      document.add(shape,parentId);
      if(shape instanceof ContainerShape){for(let node=element.firstChild;node;node=node.nextSibling){if(node.nodeType===1)visit(node as Element,shape.id);}}
    };

    for(let node=root.firstChild;node;node=node.nextSibling){if(node.nodeType===1)visit(node as Element);}
    return {document,warnings};
  }

  private dimension(raw:string|null,fallback:number):number{
    if(raw===null)return fallback;const value=Number.parseFloat(raw);if(!Number.isFinite(value)||value<=0)throw new EditorError(`invalid canvas dimension: ${raw}`);return value;
  }
}
