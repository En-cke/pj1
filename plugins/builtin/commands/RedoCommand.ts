import type { CommandContext } from "../../../src/api.js";
import type { CommandInvocation } from "../../../src/api.js";
export class RedoCommand implements CommandInvocation {readonly kind="history" as const;execute(editor:CommandContext):string{return editor.redo();}}
