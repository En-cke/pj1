import { EditorError, type Plugin, type PluginContext, type TreeDecorator, type TreeRow } from "../../src/api.js";
import { BoxAttributes, BoxProvider } from "./box.js";

export class BoxTypeLabel implements TreeDecorator {
  readonly name = "box-type-label";

  label({ shape }: TreeRow): string | undefined {
    return shape?.kind === "box" ? "(box)" : undefined;
  }
}

class BoxPlugin implements Plugin {
  activate(context: PluginContext, options?: unknown): void {
    let fill: string | undefined;
    if (options !== undefined) {
      if (options === null || typeof options !== "object" || Array.isArray(options)) {
        throw new EditorError("box options must be an object");
      }
      if ("fill" in options) {
        if (typeof options.fill !== "string") throw new EditorError("box fill must be a string");
        fill = options.fill;
      }
    }
    context.register("shapes", new BoxProvider(fill));
    context.register("attributes", new BoxAttributes());
    context.register("decorators", new BoxTypeLabel());
  }
}

export default new BoxPlugin();
