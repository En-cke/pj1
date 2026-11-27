import {
  ContainerShape, EditorError, type Command, type CommandContext, type CommandInvocation,
  type Plugin, type PluginContext, type Shape,
} from "../../src/api.js";

export class StatsCommand implements Command {
  readonly name = "stats";
  readonly help = "Plugin:   stats — count leaf shapes and containers";

  bind(args: string[]): CommandInvocation {
    if (args.length) throw new EditorError("usage: stats");
    return { kind: "view", execute: context => this.count(context) };
  }

  private count(context: CommandContext): string {
    const counts = new Map<string, number>();
    let total = 0;
    let containers = 0;
    const visit = (shape: Shape): void => {
      if (shape instanceof ContainerShape) {
        containers++;
        shape.children.forEach(visit);
      } else {
        counts.set(shape.kind, (counts.get(shape.kind) ?? 0) + 1);
        total++;
      }
    };
    context.requireDocument().children.forEach(visit);
    const groups = [...counts].map(([name, count]) => name + ": " + count);
    groups.push("(total " + total + ", containers " + containers + ")");
    return groups.join("  ");
  }
}

class StatsPlugin implements Plugin {
  activate(context: PluginContext): void {
    context.register("commands", new StatsCommand());
  }
}

export default new StatsPlugin();
