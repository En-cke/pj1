import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Registry } from "../dist/src/extension/Registry.js";
import { installPlugin, loadConfig } from "../dist/src/host/pluginLoader.js";

const register = name => `context.register("commands", { name: "${name}", bind: () => ({kind:"view", execute: () => "${name}"}) });`;
const plugin = body => `export default { async activate(context, options) { ${body} } };`;

test("configuration validation and all module/activation failure paths are isolated", async () => {
  const root = await mkdtemp(join(tmpdir(), "svgframe-loader-"));
  try {
    const make = async (name, body, contributes, path = name) => {
      const target = join(root, path);
      await mkdir(target, { recursive: true });
      await writeFile(join(target, "package.json"), JSON.stringify({ name, type: "module", main: "index.js", contributes }));
      await writeFile(join(target, "index.js"), body);
    };
    await Promise.all([
      make("no-default", "export const named = 1;", {}),
      make("wrong", plugin(register("unlisted")), { commands: ["declared"] }),
      make("throwing", plugin(register("partial") + 'throw new Error("boom");'), { commands: ["partial"] }),
      make("broken", 'import "./missing-dependency.js";', {}),
      make("good", plugin(register("original")), { commands: ["original"] }),
      make("duplicate", plugin(register("staged") + 'try {' + register("original") + '} catch {}'), { commands: ["staged", "original"] }),
      make("@lab/last", plugin('if (options?.value !== "accepted") throw new Error("options lost");' + register("last")),
        { commands: ["last"] }, "node_modules/@lab/last"),
      make("skipped", 'throw new Error("should never evaluate");', {}),
    ]);
    const config = join(root, "plugins.config.json");
    const registry = new Registry();
    const messages = [];
    for (const invalid of ["{", '{"plugins":[{"module":"./good","enabled":"yes"}]}']) {
      await writeFile(config, invalid);
      await loadConfig(registry, config, message => messages.push(message));
    }
    await writeFile(config, JSON.stringify({ plugins: [
      { module: "./missing" }, { module: "./no-default" }, { module: "./wrong" },
      { module: "./throwing" }, { module: "./broken" }, { module: "./good" },
      { module: "./duplicate" }, { module: "./skipped", enabled: false },
      { module: "@lab/last", options: { value: "accepted" } },
    ] }));
    await loadConfig(registry, config, message => messages.push(message));
    assert.deepEqual(messages.slice(0, 6), [
      "error: invalid plugin config", "error: invalid plugin config",
      "error: plugin not found: ./missing", "error: plugin has no default export: ./no-default",
      "error: plugin manifest mismatch: wrong (declared: commands/declared, registered: commands/unlisted)",
      "error: plugin failed to activate: throwing (boom)",
    ]);
    assert.match(messages[6], /^error: plugin failed to activate: broken \(.*missing-dependency\.js/);
    assert.deepEqual(messages.slice(7), ["error: duplicate registration: commands/original"]);
    assert.deepEqual(registry.list("commands").map(command => command.name), ["original", "last"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("code assembly shares atomic registration and closes the activation context", async () => {
  const registry = new Registry();
  const messages = [];
  const report = message => messages.push(message);
  let captured;
  const view = { name: "view", bind: () => ({ kind: "view", execute: () => "view" }) };
  await installPlugin(registry, {
    activate(context) {
      captured = context;
      context.register("commands", view);
      context.register("decorators", { name: "undeclared", label: () => "*" });
    },
  }, { name: "wrong", contributes: { commands: ["view"] } }, report);
  assert.match(messages[0], /manifest mismatch/);
  assert.deepEqual(registry.list("commands"), []);
  assert.deepEqual(registry.list("decorators"), []);
  assert.throws(() => captured.register("commands", view), /registration is closed/);

  await installPlugin(registry, { activate(context) { context.register("commands", view); } },
    { name: "correct", contributes: { commands: ["view"] } }, report);
  assert.equal(registry.get("commands", "view"), view);
});
