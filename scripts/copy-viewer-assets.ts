/**
 * Copy the prebuilt Universal Viewer and Mirador bundles to public/vendor/
 * (not committed). The reader loads them with <script> tags instead of
 * bundling them: UV loads its chunks relative to its own script, and
 * Mirador's self-contained build carries its own React and MUI.
 *
 * Run by `dev` and `build`; run alone with `bun run assets`.
 */
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const modules = join(root, "node_modules");
const vendor = join(root, "public", "vendor");

const copies: Array<[from: string, to: string]> = [
  ["universalviewer/dist/umd", "uv/umd"],
  ["universalviewer/dist/uv.css", "uv/uv.css"],
  ["universalviewer/LICENSE.txt", "uv/LICENSE.txt"],
  ["mirador/dist/mirador.min.js", "mirador/mirador.min.js"],
  ["mirador/LICENSE", "mirador/LICENSE"],
];

await rm(vendor, { recursive: true, force: true });
for (const [from, to] of copies) {
  const target = join(vendor, to);
  await mkdir(join(target, ".."), { recursive: true });
  await cp(join(modules, from), target, { recursive: true });
}
console.log(`viewer assets copied to ${vendor}`);
