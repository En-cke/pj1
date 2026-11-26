import type { CommandContext } from "../../../src/api.js";
import type { CommandInvocation } from "../../../src/api.js";
export class UndoCommand implements CommandInvocation {readonly kind="history" as const;execute(editor:CommandContext):string{return editor.undo();}}
