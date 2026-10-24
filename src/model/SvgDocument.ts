import { ContainerShape } from "./ContainerShape.js";
import { EditorError } from "./EditorError.js";
import { Format } from "./Format.js";
import { Shape } from "./Shape.js";

export class SvgDocument {
  private root: ContainerShape;
  sourcePath?: string;

  constructor(public width=800,public height=600){this.root=new ContainerShape("__root__");}

  get children():readonly Shape[]{return this.root.children;}

  add(shape:Shape,parentId?:string):void{
    if(this.find(shape.id))throw new EditorError(`id already exists: ${shape.id}`);
    const parent=parentId===undefined?this.root:this.requireContainer(parentId);
    parent.add(shape);
  }

  find(id:string):Shape|undefined{
    const visit=(container:ContainerShape):Shape|undefined=>{
      for(const child of container.children){if(child.id===id)return child;if(child instanceof ContainerShape){const found=visit(child);if(found)return found;}}
      return undefined;
    };
    return visit(this.root);
  }

  require(id:string):Shape{const shape=this.find(id);if(!shape)throw new EditorError(`no such shape: ${id}`);return shape;}
  requireContainer(id:string):ContainerShape{const shape=this.find(id);if(!shape)throw new EditorError(`no such container: ${id}`);if(!(shape instanceof ContainerShape))throw new EditorError(`not a container: ${id}`);return shape;}
  remove(id:string):Shape{const shape=this.require(id);shape.parent!.remove(shape);return shape;}
  count():number{let n=0;const visit=(c:ContainerShape)=>{for(const s of c.children){n++;if(s instanceof ContainerShape)visit(s);}};visit(this.root);return n;}

  group(id:string,ids:string[]):ContainerShape{
    if(this.find(id))throw new EditorError(`id already exists: ${id}`);
    if(ids.length===0)throw new EditorError("group requires at least one shape");
    const selected=ids.map((value)=>this.require(value));
    if(new Set(selected).size!==selected.length)throw new EditorError("duplicate shape in group");
    for(const a of selected)for(const b of selected){if(a!==b&&a instanceof ContainerShape&&a.contains(b))throw new EditorError(`cannot group a container into its own descendant: ${a.id}`);}
    const anchor=selected[0];const parent=anchor.parent!;const index=parent.indexOf(anchor);const group=new ContainerShape(id);parent.add(group,index);
    for(const shape of selected)group.add(shape);
    return group;
  }

  ungroup(id:string):number{
    const group=this.requireContainer(id);const parent=group.parent!;
    if(parent===this.root)throw new EditorError(`cannot ungroup top-level container: ${id}`);
    const index=parent.indexOf(group);const children=[...group.children];parent.remove(group);
    children.forEach((child,offset)=>parent.add(child,index+offset));return children.length;
  }

  addTo(groupId:string,id:string):void{
    const group=this.requireContainer(groupId);const shape=this.require(id);
    if(shape===group||(shape instanceof ContainerShape&&shape.contains(group)))throw new EditorError(`cannot move a container into its own descendant: ${id}`);
    group.add(shape);
  }

  reorder(id:string,front:boolean):void{const shape=this.require(id);const parent=shape.parent!;parent.remove(shape);parent.add(shape,front?parent.children.length:0);}

  tree(id?:string):string{
    if(id===undefined){const lines=[`svg (${Format.number(this.width)}x${Format.number(this.height)})`];this.appendTree(lines,this.root,"",true);return lines.join("\n");}
    const shape=this.require(id);const lines=[shape.summary()];if(shape instanceof ContainerShape)this.appendTree(lines,shape,"",true);return lines.join("\n");
  }

  show(id:string):string{const shape=this.require(id);const parent=shape.parent===this.root?"svg":`g#${shape.parent!.id}`;return [`${shape.tag}#${shape.id}  parent=${parent}`,...shape.detailLines().map((line)=>`  ${line}`)].join("\n");}

  private appendTree(lines:string[],container:ContainerShape,prefix:string,skipSelf:boolean):void{
    const children=container.children;children.forEach((shape,index)=>{const last=index===children.length-1;lines.push(`${prefix}${last?"└── ":"├── "}${shape.summary()}`);if(shape instanceof ContainerShape)this.appendTree(lines,shape,`${prefix}${last?"    ":"│   "}`,false);});
  }

  toSvg():string{const content=this.root.children.map((shape)=>shape.toSvg(1)).join("\n");return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${Format.number(this.width)}" height="${Format.number(this.height)}" viewBox="0 0 ${Format.number(this.width)} ${Format.number(this.height)}">${content?`\n${content}\n`:""}</svg>\n`;}

  clone():SvgDocument{const result=new SvgDocument(this.width,this.height);result.sourcePath=this.sourcePath;for(const child of this.root.children)result.root.add(child.clone());return result;}
  restore(snapshot:SvgDocument):void{this.width=snapshot.width;this.height=snapshot.height;this.sourcePath=snapshot.sourcePath;this.root=new ContainerShape("__root__");for(const child of snapshot.root.children)this.root.add(child.clone());}
}
