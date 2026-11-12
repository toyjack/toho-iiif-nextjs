/**
 * Record each available book's scan size as `imageSize` in data/books/<id>.md.
 *
 *   bun scripts/fetch-image-sizes.ts [--full] [--cache <file.tsv>] [ID ...]
 *
 * For every available book without `imageSize` (or only the given IDs), reads
 * info.json of four images (first, second, middle, last) from the image
 * server, one request at a time with a pause, and writes the size when they
 * agree within 1%. Otherwise the book is reported and left unchanged, unless
 * `--full` is given: then every image of the book is read, the most common
 * size is written as `imageSize`, and images differing from it by more than
 * 1% are written to data/image-sizes/<id>.tsv. Use --full with explicit IDs;
 * it makes one request per image.
 *
 * `--cache` names a TSV (`id<TAB>image<TAB>width<TAB>height`) of earlier
 * results, which are reused and appended to, so an interrupted run resumes.
 *
 * Run `bun run data` first; this reads src/generated/books.json.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { BookEntry, LibraryData } from "../src/types";
import { getImages, imageKey, imageServiceId, type ImageRef } from "../src/lib/generate-manifest";

const PAUSE_MS = 700;
const TOLERANCE = 0.01;

const args = process.argv.slice(2);
const cacheIndex = args.indexOf("--cache");
const cachePath = cacheIndex >= 0 ? args.splice(cacheIndex, 2)[1] : undefined;
const fullIndex = args.indexOf("--full");
const full = fullIndex >= 0 && args.splice(fullIndex, 1).length > 0;
const onlyIds = new Set(args);

type Size = { width: number; height: number };
const cache = new Map<string, Size>();
if (cachePath && existsSync(cachePath)) {
  for (const line of readFileSync(cachePath, "utf8").split("\n")) {
    const [id, n, w, h] = line.split("\t");
    if (Number(w) > 0 && Number(h) > 0) cache.set(`${id}\t${n}`, { width: Number(w), height: Number(h) });
  }
}

let consecutiveFailures = 0;
async function infoSize(book: BookEntry, image: ImageRef): Promise<Size | null> {
  const imageNo = imageKey(book, image);
  const key = `${book.id}\t${imageNo}`;
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const response = await fetch(`${imageServiceId(book, image)}/info.json`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      if (response.status >= 500) consecutiveFailures++;
      console.warn(`  ${book.id} image ${imageNo}: HTTP ${response.status}`);
      return null;
    }
    const { width, height } = (await response.json()) as Size;
    consecutiveFailures = 0;
    const size = { width, height };
    cache.set(key, size);
    if (cachePath) appendFileSync(cachePath, `${key}\t${width}\t${height}\n`);
    return size;
  } catch (error) {
    consecutiveFailures++;
    console.warn(`  ${book.id} image ${imageNo}: ${(error as Error).name}`);
    return null;
  } finally {
    if (consecutiveFailures >= 3) {
      console.error("Image server is failing; stopping. Rerun later to resume.");
      process.exit(2);
    }
    await Bun.sleep(consecutiveFailures ? 10_000 : PAUSE_MS);
  }
}

/** Sizes agree when width and height differ by at most TOLERANCE. */
function agree(sizes: Size[]): boolean {
  const close = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE * Math.max(a, b);
  return sizes.every((s) => close(s.width, sizes[0].width) && close(s.height, sizes[0].height));
}

/** Most frequent size (first one on ties). */
function representative(sizes: Size[]): Size {
  const counts = new Map<string, number>();
  for (const s of sizes) counts.set(`${s.width}x${s.height}`, (counts.get(`${s.width}x${s.height}`) ?? 0) + 1);
  const best = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  const [width, height] = best.split("x").map(Number);
  return { width, height };
}

/** Insert `imageSize` before `structure:` in the frontmatter. */
function writeImageSize(id: string, size: Size) {
  const path = join("data", "books", `${id}.md`);
  const text = readFileSync(path, "utf8");
  const block = `imageSize:\n  width: ${size.width}\n  height: ${size.height}\n`;
  if (/^imageSize:/m.test(text)) {
    writeFileSync(path, text.replace(/^imageSize:\n(?:  .*\n)+/m, block));
  } else if (/^structure:/m.test(text)) {
    writeFileSync(path, text.replace(/^structure:/m, `${block}structure:`));
  } else {
    writeFileSync(path, text.replace(/\n---\n/, `\n${block}---\n`));
  }
}

/** Write data/image-sizes/<id>.tsv, or remove it when there are none. */
function writeExceptions(id: string, exceptions: [string, Size][]) {
  const path = join("data", "image-sizes", `${id}.tsv`);
  if (exceptions.length === 0) {
    if (existsSync(path)) rmSync(path);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  const rows = exceptions.map(([n, s]) => `${n}\t${s.width}\t${s.height}`);
  writeFileSync(path, ["image\twidth\theight", ...rows].join("\n") + "\n");
}

const library = (await Bun.file("src/generated/books.json").json()) as LibraryData;
const books = library.books.filter((b) =>
  onlyIds.size > 0 ? onlyIds.has(b.id) : b.available && !b.imageSize && (b.structure?.length ?? 0) > 0
);

const mismatched: string[] = [];
for (const book of books) {
  const numbers = getImages(book);
  const picks = [...new Set([0, 1, Math.floor(numbers.length / 2), numbers.length - 1])]
    .filter((i) => i < numbers.length)
    .map((i) => numbers[i]);
  const results: [string, Size | null][] = [];
  for (const image of picks) results.push([imageKey(book, image), await infoSize(book, image)]);
  const sizes = results.flatMap(([, size]) => (size ? [size] : []));
  const detail = results
    .map(([n, s]) => `${n}=${s ? `${s.width}x${s.height}` : "?"}`)
    .join(" ");
  if (sizes.length < results.length) {
    mismatched.push(`${book.id}: some info.json could not be read: ${detail}`);
  } else if (agree(sizes)) {
    const size = representative(sizes);
    writeImageSize(book.id, size);
    writeExceptions(book.id, []);
    console.log(`${book.id}: ${size.width}x${size.height}`);
  } else if (!full) {
    mismatched.push(`${book.id}: sizes differ (rerun with --full ${book.id}): ${detail}`);
  } else {
    // Read every image; the most common size becomes imageSize and the rest
    // are listed as exceptions.
    const all: [string, Size][] = [];
    const unread: string[] = [];
    for (const image of numbers) {
      const size = await infoSize(book, image);
      if (size) all.push([imageKey(book, image), size]);
      else unread.push(imageKey(book, image));
    }
    if (unread.length > 0) {
      mismatched.push(`${book.id}: info.json could not be read for image(s) ${unread.join(", ")}`);
      continue;
    }
    const size = representative(all.map(([, s]) => s));
    const exceptions = all.filter(([, s]) => !agree([size, s]));
    writeImageSize(book.id, size);
    writeExceptions(book.id, exceptions);
    console.log(`${book.id}: ${size.width}x${size.height}, ${exceptions.length} exception(s)`);
  }
}

if (mismatched.length > 0) {
  console.log(`\nNot written (${mismatched.length}), check by hand:`);
  for (const line of mismatched) console.log(`  ${line}`);
}
