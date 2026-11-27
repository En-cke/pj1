import {
  ContainerShape, EditorError, type AttributeChange, type AttributeHandler, type CreateShape, type Shape, type ShapeElement, type ShapeProvider,
} from "../../src/api.js";

export class BoxShape extends ContainerShape {
  override get kind(): string { return "box"; }
  override get undoMoveName(): string { return this.commandName; }

  override get creationDetails(): string {
    return " (g#" + this.id + " + rect#" + this.part("rect").id + " + text#" + this.part("label").id + ")";
  }

  override get canUngroup(): boolean { return false; }

  protected override svgMetadata(): string { return ' data-kind="box"'; }

  part(suffix: "rect" | "label"): Shape {
    const id = this.id + "-" + suffix;
    const kind = suffix === "rect" ? "rect" : "text";
    const item = this.children.find(child => child.id === id && child.kind === kind && child.tag === kind);
    if (!item) throw new EditorError("invalid box: " + this.id + " requires " + kind + "#" + id);
    return item;
  }

  override validate(): void {
    this.part("rect");
    this.part("label");
  }

  override clone(): BoxShape {
    const result = new BoxShape(this.id);
    this.copyStylesTo(result);
    for (const child of this.children) result.add(child.clone());
    return result;
  }
}

export class BoxProvider implements ShapeProvider {
  readonly name = "box";
  readonly svgTag = "g";
  readonly acceptsChildren = true;

  constructor(private readonly fill = "#4a90d9") {}

  create(id: string, args: readonly string[], createShape: CreateShape): BoxShape {
    if (args.length !== 5) throw new EditorError("invalid parameters for box");
    const [x, y, width, height] = args.slice(0, 4).map(value => {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new EditorError("invalid number: " + value);
      return number;
    });
    const box = new BoxShape(id);
    box.add(createShape("rect", id + "-rect", [String(x), String(y), String(width), String(height), this.fill]));
    box.add(createShape("text", id + "-label", [String(x + 20), String(y + height / 2 + 5), args[4]]));
    box.validate();
    return box;
  }

  read(id: string, _element: ShapeElement, children: readonly Shape[]): BoxShape {
    const box = new BoxShape(id);
    for (const child of children) box.add(child);
    box.validate();
    return box;
  }
}

export class BoxAttributes implements AttributeHandler {
  readonly name = "box-attributes";

  handles(shape: Shape, attr: string): boolean {
    return shape instanceof BoxShape && (attr === "fill" || attr === "label");
  }

  apply(shape: Shape, attr: string, value: string): AttributeChange {
    if (!(shape instanceof BoxShape)) throw new EditorError("expected a box");
    if (attr === "fill") {
      const rect = shape.part("rect");
      rect.setAttribute("fill", value);
      return { message: shape.commandName + " fill propagated to " + rect.id };
    }
    if (attr === "label") {
      const label = shape.part("label");
      const previous = label.textContent;
      label.setAttribute("text", value);
      return {
        message: shape.commandName + ' label updated: "' + value + '"',
        undoMessage: previous === undefined ? undefined : shape.commandName + ' label restored: "' + previous + '"',
      };
    }
    throw new EditorError("unknown attribute: " + attr);
  }
}
