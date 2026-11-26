import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Manifest, Plugin } from "../api.js";
import { categories, DuplicateRegistration, type Registry } from "../extension/Registry.js";

export type Report = (message: string) => void;
interface ConfigEntry { module: string; enabled?: boolean; options?: unknown }

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function manifest(value: unknown): Manifest {
  if (!object(value) || typeof value.name !== "string" || !value.name.trim()) {
    throw new Error("invalid plugin manifest");
  }
  const { contributes } = value;
  if (contributes !== undefined && (!object(contributes) ||
      Object.entries(contributes).some(([key, names]) =>
        !categories.some(category => category === key) ||
        !Array.isArray(names) ||
        !names.every(name => typeof name === "string" && name.trim())))) {
    throw new Error("invalid plugin contributes");
  }
  return value as unknown as Manifest;
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message.replace(/\r?\n.*/gs, "") : String(error);
}

export async function installPlugin(
  registry: Registry, plugin: Plugin, rawManifest: unknown, report: Report, options?: unknown,
  fallbackName = "<plugin>",
): Promise<void> {
  const stage = registry.stage();
  const name = object(rawManifest) && typeof rawManifest.name === "string" ? rawManifest.name : fallbackName;
  try {
    const declaration = manifest(rawManifest);
    await plugin.activate(stage.context, options);
    stage.check();
    const declared = categories.map(category => [...new Set(declaration.contributes?.[category] ?? [])].sort());
    const registered = categories.map(stage.names);
    if (JSON.stringify(declared) !== JSON.stringify(registered)) {
      const describe = (lists: string[][]) => lists.flatMap((list, i) =>
        list.map(item => categories[i] + "/" + item)).join(", ") || "(none)";
      report("error: plugin manifest mismatch: " + name +
        " (declared: " + describe(declared) + ", registered: " + describe(registered) + ")");
      return;
    }
    stage.commit();
  } catch (error) {
    report(error instanceof DuplicateRegistration ? "error: " + error.message :
      "error: plugin failed to activate: " + name + " (" + reason(error) + ")");
  } finally {
    stage.close();
  }
}

async function readManifest(entry: string): Promise<unknown> {
  let directory = dirname(entry);
  while (true) {
    try {
      return JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(directory);
      if (parent === directory) throw new Error("missing package.json");
      directory = parent;
    }
  }
}

function validEntry(value: unknown): value is ConfigEntry {
  return object(value) && typeof value.module === "string" && !!value.module.trim() &&
    (value.enabled === undefined || typeof value.enabled === "boolean");
}

export async function loadConfig(registry: Registry, configPath: string, report: Report): Promise<void> {
  const config = resolve(configPath);
  let loaded: ConfigEntry[];
  try {
    const parsed: unknown = JSON.parse(await readFile(config, "utf8"));
    if (!object(parsed) || !Array.isArray(parsed.plugins) || !parsed.plugins.every(validEntry)) {
      throw new Error("invalid plugin config");
    }
    loaded = parsed.plugins;
  } catch {
    report("error: invalid plugin config");
    return;
  }

  const require = createRequire(config);
  for (const item of loaded) {
    if (item.enabled === false) continue;
    const specifier = item.module;
    let entry: string;
    try {
      entry = require.resolve(specifier.startsWith(".") ? resolve(dirname(config), specifier) : specifier);
      if (!isAbsolute(entry)) throw new Error("plugin must resolve to a package file");
    } catch {
      report("error: plugin not found: " + specifier);
      continue;
    }

    let name = specifier;
    try {
      const declaration = await readManifest(entry);
      if (object(declaration) && typeof declaration.name === "string") name = declaration.name;
      const exports = await import(pathToFileURL(entry).href);
      if (exports.default === undefined) {
        report("error: plugin has no default export: " + specifier);
        continue;
      }
      await installPlugin(registry, exports.default, declaration, report, item.options, specifier);
    } catch (error) {
      report("error: plugin failed to activate: " + name + " (" + reason(error) + ")");
    }
  }
}
