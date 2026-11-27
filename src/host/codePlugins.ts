import { createRequire } from "node:module";
import box from "../../plugins/box/index.js";
import dir from "../../plugins/dir/index.js";
import stats from "../../plugins/stats/index.js";
import type { Registry } from "../extension/Registry.js";
import { installPlugin, type Report } from "./pluginLoader.js";

const require = createRequire(import.meta.url);

export async function codePlugins(registry: Registry, report: Report): Promise<void> {
  await installPlugin(registry, stats, require("../../plugins/stats/package.json"), report);
  await installPlugin(registry, dir, require("../../plugins/dir/package.json"), report);
  await installPlugin(registry, box, require("../../plugins/box/package.json"), report);
}
