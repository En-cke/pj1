import {
  ContainerShape, type Plugin, type PluginContext, type Shape, type TreeDecorator, type TreeRow,
} from "../../src/api.js";

export class ModifiedStar implements TreeDecorator {
  readonly name = "modified-star";

  label({ document, saved, shape }: TreeRow): string | undefined {
    if (!saved) return "*";
    if (!shape) return document.toSvg() === saved.toSvg() ? undefined : "*";

    const previous = saved.find(shape.id);
    if (!previous || this.signature(shape) !== this.signature(previous)) return "*";
  }

  private signature(shape: Shape): string {
    const content = shape instanceof ContainerShape
      ? [shape.summary(), shape.children.map(child => child.id)]
      : shape.toSvg(0);
    return JSON.stringify([shape.kind, shape.parent?.id, content]);
  }
}

class StarPlugin implements Plugin {
  activate(context: PluginContext): void {
    context.register("decorators", new ModifiedStar());
  }
}

export default new StarPlugin();
