import { createRequire } from "node:module";
import { BuiltinPlugin } from "../../plugins/builtin/index.js";
import { CommandDispatcher } from "../editor/CommandDispatcher.js";
import { Editor } from "../editor/Editor.js";
import { Registry } from "../extension/Registry.js";
import { FileService } from "../io/FileService.js";
import { SvgParser } from "../io/SvgParser.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { Tokenizer } from "../parser/Tokenizer.js";
import { codePlugins } from "./codePlugins.js";
import { installPlugin, loadConfig, type Report } from "./pluginLoader.js";

const require = createRequire(import.meta.url);
const builtinManifest = require("../../plugins/builtin/package.json");

export type Assembly = { mode: "baseline" | "code" } | { mode: "config"; path: string };

export async function createEditor(
  assembly: Assembly = { mode: "baseline" },
  report: Report = console.log,
): Promise<Editor> {
  const registry = new Registry();
  const factory = new ShapeFactory(registry);
  const files = new FileService(new SvgParser(factory));
  const builtin = new BuiltinPlugin({
    create: factory.create.bind(factory),
    files,
    attributes: () => registry.list("attributes"),
    decorators: () => registry.list("decorators"),
    commandHelp: () => registry.list("commands").flatMap(command => command.help ? [command.help] : []),
    extraShapes: () => registry.list("shapes").map(shape => shape.name)
      .filter(name => !builtinManifest.contributes.shapes.includes(name)),
  });
  await installPlugin(registry, builtin, builtinManifest, message => { throw new Error(message); });
  if (assembly.mode === "code") await codePlugins(registry, report);
  if (assembly.mode === "config") await loadConfig(registry, assembly.path, report);
  return new Editor(new Tokenizer(), new CommandDispatcher(registry));
}
