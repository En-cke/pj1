import type { Command } from "../command/Command.js";
import type { Shape } from "../model/Shape.js";
import type { SvgDocument } from "../model/SvgDocument.js";

export interface ShapeElement {
  readonly tagName: string;
  readonly textContent: string | null;
  getAttribute(name: string): string | null;
}

export type CreateShape = (type: string, id: string, args: readonly string[]) => Shape;

export interface ShapeProvider {
  readonly name: string;
  readonly svgTag: string;
  readonly acceptsChildren?: boolean;
  create(id: string, args: readonly string[], createShape: CreateShape): Shape;
  read(id: string, element: ShapeElement, children: readonly Shape[]): Shape;
}

export interface TreeRow {
  readonly document: SvgDocument;
  readonly saved?: SvgDocument;
  readonly shape?: Shape;
}

export interface TreeDecorator {
  readonly name: string;
  label(row: TreeRow): string | undefined;
}

export interface AttributeChange {
  readonly message: string;
  readonly undoMessage?: string;
}

export interface AttributeHandler {
  readonly name: string;
  handles(shape: Shape, attr: string): boolean;
  apply(shape: Shape, attr: string, value: string): AttributeChange | void;
}

export interface Contributions {
  shapes: ShapeProvider;
  commands: Command;
  decorators: TreeDecorator;
  attributes: AttributeHandler;
}

export type Category = keyof Contributions;
export type Manifest = { name: string; contributes?: Partial<Record<Category, string[]>> };

export interface PluginContext {
  register<K extends Category>(category: K, implementation: Contributions[K]): void;
}

export interface Plugin {
  activate(context: PluginContext, options?: unknown): void | Promise<void>;
}

export interface SvgFiles {
  read(path: string): Promise<{ document: SvgDocument; warnings: string[] }>;
  save(document: SvgDocument, path?: string): Promise<string>;
}
