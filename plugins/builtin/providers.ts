import { ContainerShape, EditorError, type Shape, type ShapeElement, type ShapeProvider } from "../../src/api.js";
import { CircleShape } from "./shapes/CircleShape.js";
import { EllipseShape } from "./shapes/EllipseShape.js";
import { LineShape } from "./shapes/LineShape.js";
import { RectShape } from "./shapes/RectShape.js";
import { TextShape } from "./shapes/TextShape.js";

type BuildShape = (id: string, args: readonly string[]) => Shape;

function numeric(args: readonly string[], index: number): number {
  const value = Number(args[index]);
  if (!Number.isFinite(value)) throw new EditorError("invalid number: " + (args[index] ?? "missing"));
  return value;
}

export class LeafProvider implements ShapeProvider {
  readonly svgTag: string;

  constructor(
    readonly name: string,
    private readonly geometry: readonly string[],
    private readonly build: BuildShape,
    private readonly hasText = false,
  ) { this.svgTag = name; }

  create(id: string, args: readonly string[]): Shape {
    const required = this.geometry.length + Number(this.hasText);
    if (args.length < required || args.length > this.geometry.length + 1) {
      throw new EditorError("invalid parameters for " + this.name);
    }
    return this.build(id, args);
  }

  read(id: string, element: ShapeElement): Shape {
    const args = this.geometry.map(name => element.getAttribute(name) ?? "0");
    if (this.hasText) args.push(element.textContent ?? "");
    return this.create(id, args);
  }
}

export class GroupProvider implements ShapeProvider {
  readonly name = "g";
  readonly svgTag = "g";
  readonly acceptsChildren = true;

  create(id: string, args: readonly string[]): ContainerShape {
    if (args.length) throw new EditorError("invalid parameters for g");
    return new ContainerShape(id);
  }

  read(id: string, _element: ShapeElement, children: readonly Shape[]): ContainerShape {
    const group = this.create(id, []);
    for (const child of children) group.add(child);
    return group;
  }
}

export function stockShapes(): ShapeProvider[] {
  return [
    new LeafProvider("rect", ["x", "y", "width", "height"], (id, a) =>
      new RectShape(id, numeric(a, 0), numeric(a, 1), numeric(a, 2), numeric(a, 3), a[4])),
    new LeafProvider("circle", ["cx", "cy", "r"], (id, a) =>
      new CircleShape(id, numeric(a, 0), numeric(a, 1), numeric(a, 2), a[3])),
    new LeafProvider("ellipse", ["cx", "cy", "rx", "ry"], (id, a) =>
      new EllipseShape(id, numeric(a, 0), numeric(a, 1), numeric(a, 2), numeric(a, 3), a[4])),
    new LeafProvider("line", ["x1", "y1", "x2", "y2"], (id, a) =>
      new LineShape(id, numeric(a, 0), numeric(a, 1), numeric(a, 2), numeric(a, 3), a[4])),
    new LeafProvider("text", ["x", "y"], (id, a) =>
      new TextShape(id, numeric(a, 0), numeric(a, 1), a[2]), true),
    new GroupProvider(),
  ];
}
