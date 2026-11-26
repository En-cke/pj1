import type { ShapeElement, ShapeProvider } from "../extension/contracts.js";
import type { Registry } from "../extension/Registry.js";
import { EditorError } from "./EditorError.js";
import type { Shape } from "./Shape.js";

export class ShapeFactory {
  constructor(private readonly registry: Registry) {}

  create(type: string, id: string, args: readonly string[]): Shape {
    const provider = this.registry.get("shapes", type);
    if (!provider) throw new EditorError("unknown shape type: " + type + " (is the plugin loaded?)");
    return this.check(provider, id, provider.create(id, args, this.create.bind(this)));
  }

  providerFor(element: ShapeElement): ShapeProvider | undefined {
    const marker = element.getAttribute("data-kind");
    const variant = marker ? this.registry.get("shapes", marker) : undefined;
    if (variant?.svgTag === element.tagName) return variant;
    const plain = this.registry.get("shapes", element.tagName);
    return plain?.svgTag === element.tagName ? plain : undefined;
  }

  read(provider: ShapeProvider, id: string, element: ShapeElement, children: Shape[]): Shape {
    return this.check(provider, id, provider.read(id, element, children));
  }

  private check(provider: ShapeProvider, id: string, shape: Shape): Shape {
    if (!shape || shape.id !== id || shape.kind !== provider.name || shape.tag !== provider.svgTag) {
      throw new EditorError("invalid shape from provider: " + provider.name);
    }
    return shape;
  }
}
