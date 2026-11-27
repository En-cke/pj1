import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));
const assets = join(repo, "doc", "transcript");
const cli = join(repo, "dist", "src", "cli.js");
const config = join(repo, "plugins.config.json");
const tsx = join(repo, "node_modules", "tsx", "dist", "cli.mjs");
const record = process.argv.includes("--record");
const root = mkdtempSync(join(tmpdir(), "svgframe-replay-"));
const cwd = join(root, "working-directory");
const baseline = join(root, "final");
const baselineConfig = join(root, "baseline.json");

function git(...args) { return execFileSync("git", args, { cwd: repo }); }

function prepareBaseline() {
  const files = git("ls-tree", "-r", "--name-only", "final", "--", "src", "package.json", "tsconfig.json")
    .toString().trim().split(/\r?\n/);
  for (const name of files) {
    const target = join(baseline, name);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, git("show", "final:" + name));
  }
  symlinkSync(join(repo, "node_modules"), join(baseline, "node_modules"),
    process.platform === "win32" ? "junction" : "dir");
  writeFileSync(baselineConfig, '{"plugins":[]}');
}

function run(args, name, outputFile) {
  if (outputFile) rmSync(join(cwd, outputFile), { force: true });
  const result = spawnSync(process.execPath, args, {
    cwd, input: readFileSync(join(assets, name + ".txt")), maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr.toString());
  assert.equal(result.stderr.length, 0, result.stderr.toString());
  return { stdout: result.stdout, svg: outputFile ? readFileSync(join(cwd, outputFile)) : undefined };
}

function expected(name, { stdout, svg }) {
  const fixtures = [[name + ".expected.txt", stdout]];
  if (svg) fixtures.push([name + ".expected.svg", svg]);
  for (const [file, value] of fixtures) {
    const path = join(assets, file);
    if (record) writeFileSync(path, value);
    else assert.deepEqual(value, readFileSync(path), file);
  }
}

try {
  mkdirSync(cwd);
  prepareBaseline();
  mkdirSync(join(cwd, "docs"));
  mkdirSync(join(cwd, "plugins"));
  const artwork = readFileSync(join(assets, "other.svg"));
  writeFileSync(join(cwd, "other.svg"), artwork);
  writeFileSync(join(cwd, ".keep"), "");
  writeFileSync(join(cwd, "notes.txt"), "fixed directory listing fixture\n");

  for (const [name, outputFile] of [["cli-1", "demo.svg"], ["cli-1-flow", "flowchart.svg"], ["cli-1-commands", "all.svg"]]) {
    const old = run([tsx, join(baseline, "src", "cli.ts")], name, outputFile);
    assert.deepEqual(run([cli, "--baseline"], name, outputFile), old, name + " baseline vs final");
    assert.deepEqual(run([cli, "--config", baselineConfig], name, outputFile), old, name + " empty config vs final");
    expected(name, old);
    rmSync(join(cwd, outputFile));
    console.log(name + " — final, --baseline, and empty config byte-identical");
  }

  for (const [name, outputFile] of [["cli-1", "demo.svg"], ["cli-1-flow", "flowchart.svg"],
    ["cli-2-box", "flowchart-box.svg"], ["cli-2-commands"]]) {
    const before = run([cli], name, outputFile);
    const after = run([cli, "--config", config], name, outputFile);
    assert.deepEqual(before, after, name + " dual assembly");
    expected(name.startsWith("cli-1") ? name + ".plugins" : name, before);
    if (outputFile) rmSync(join(cwd, outputFile));
    console.log(name + " — code/config byte-identical");
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}
