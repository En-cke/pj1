import type { CommandInvocation } from "../command/Command.js";
import type { Registry } from "../extension/Registry.js";
import { EditorError } from "../model/EditorError.js";

export class CommandDispatcher {
  constructor(private readonly registry: Registry) {}

  dispatch(tokens: string[]): CommandInvocation {
    const [name, ...args] = tokens;
    const command = this.registry.get("commands", name);
    if (!command) throw new EditorError("unknown command: " + name);
    const invocation = command.bind(args);
    if (!invocation || typeof invocation.execute !== "function" ||
        !["edit", "io", "view", "history"].includes(invocation.kind) ||
        (invocation.kind === "edit" &&
          (!("undo" in invocation) || typeof invocation.undo !== "function" ||
           !("redo" in invocation) || typeof invocation.redo !== "function"))) {
      throw new EditorError("invalid command invocation: " + name);
    }
    return invocation;
  }
}
