import { DOMParser } from "@xmldom/xmldom";
import { EditorError } from "../model/EditorError.js";
import type { Shape } from "../model/Shape.js";
import type { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";

export interface ParseResult {
  document: SvgDocument;
  warnings: string[];
}

function* elements(parent: Element): Iterable<Element> {
  for (let node = parent.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 1) yield node as Element;
  }
}

export class SvgParser {
  constructor(private readonly factory: ShapeFactory) {}

  parse(xml: string, sourcePath?: string): ParseResult {
    const errors: string[] = [];
    const dom = new DOMParser({
      errorHandler: { warning: () => {}, error: message => errors.push(message), fatalError: message => errors.push(message) },
    }).parseFromString(xml, "image/svg+xml");
    const root = dom.documentElement;
    if (errors.length || root?.tagName !== "svg") throw new EditorError("invalid SVG document");

    const document = new SvgDocument(this.dimension(root.getAttribute("width"), 800), this.dimension(root.getAttribute("height"), 600));
    document.sourcePath = sourcePath;
    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const reserved = new Set<string>();

    const reserveExplicitIds = (element: Element): void => {
      const id = this.factory.providerFor(element) && element.getAttribute("id");
      if (id) {
        if (reserved.has(id)) throw new EditorError("id already exists: " + id);
        reserved.add(id);
      }
      for (const child of elements(element)) reserveExplicitIds(child);
    };
    reserveExplicitIds(root);

    const visit = (element: Element): Shape | undefined => {
      const provider = this.factory.providerFor(element);
      if (!provider) return;
      const type = element.tagName;
      let id = element.getAttribute("id");
      if (!id) {
        let next = (counters.get(type) ?? 0) + 1;
        while (reserved.has(type + next)) next++;
        counters.set(type, next);
        id = type + next;
        reserved.add(id);
        warnings.push("warning: assigned id " + id + " to unnamed <" + type + ">");
      }
      const children: Shape[] = [];
      if (provider.acceptsChildren) {
        for (const child of elements(element)) {
          const parsed = visit(child);
          if (parsed) children.push(parsed);
        }
      }
      const shape = this.factory.read(provider, id, element, children);
      for (const style of ["fill", "stroke", "stroke-width"]) {
        const value = element.getAttribute(style);
        if (value) shape.setAttribute(style, value);
      }
      return shape;
    };

    for (const child of elements(root)) {
      const shape = visit(child);
      if (shape) document.add(shape);
    }
    document.validate();
    return { document, warnings };
  }

  private dimension(raw: string | null, fallback: number): number {
    if (raw === null || raw.trim() === "") return fallback;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value) || value <= 0) throw new EditorError("invalid canvas dimension: " + raw);
    return value;
  }
}
