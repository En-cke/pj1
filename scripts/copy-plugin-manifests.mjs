import { copyFile, mkdir, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
for (const entry of await readdir(new URL("plugins/", root), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const source = new URL("plugins/" + entry.name + "/package.json", root);
  const target = new URL("dist/plugins/" + entry.name + "/", root);
  await mkdir(target, { recursive: true });
  await copyFile(source, new URL("package.json", target));
}
