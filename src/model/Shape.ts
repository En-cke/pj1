import type { ContainerShape } from "./ContainerShape.js";
import { EditorError } from "./EditorError.js";

export type StyleName = "fill" | "stroke" | "stroke-width";

export abstract class Shape {
  private owner: ContainerShape | null = null;
  protected readonly styles = new Map<StyleName, string>();

  protected constructor(
    public readonly id: string,
    public readonly tag: string,
  ) {}

  get parent(): ContainerShape | null {
    return this.owner;
  }

  attachTo(parent: ContainerShape | null): void {
    this.owner = parent;
  }

  setAttribute(name: string, value: string): void {
    if (name === "fill" || name === "stroke" || name === "stroke-width") {
      this.styles.set(name, value);
      return;
    }
    if (!this.setGeometry(name, value)) {
      throw new EditorError(`unknown attribute: ${name}`);
    }
  }

  protected copyStylesTo(target: Shape): void {
    for (const [name, value] of this.styles) target.styles.set(name, value);
  }

  protected styleEntries(): Array<[string, string]> {
    return [...this.styles.entries()];
  }

  protected styleSummary(): string {
    return this.styleEntries().map(([name, value]) => `${name}=${value}`).join(" ");
  }

  protected parseNumber(name: string, value: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new EditorError(`invalid number for ${name}: ${value}`);
    return parsed;
  }

  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract summary(): string;
  abstract detailLines(): string[];
  abstract toSvg(indent: number): string;
  abstract clone(): Shape;
  protected abstract setGeometry(name: string, value: string): boolean;
}
