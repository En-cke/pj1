import type { SvgDocument } from "../model/SvgDocument.js";

export type CommandKind = "edit" | "io" | "view" | "history";

export interface CommandContext {
  document?: SvgDocument;
  readonly saved?: SvgDocument;
  requireDocument(): SvgDocument;
  markSaved(): void;
  undo(): string;
  redo(): string;
}

export interface Command {
  readonly name: string;
  readonly help?: string;
  bind(args: string[]): CommandInvocation;
}

export interface CommandInvocation {
  readonly kind: CommandKind;
  execute(context: CommandContext): Promise<string> | string;
}

export interface UndoableCommand extends CommandInvocation {
  readonly kind: "edit";
  undo(context: CommandContext): string;
  redo(context: CommandContext): string;
}
