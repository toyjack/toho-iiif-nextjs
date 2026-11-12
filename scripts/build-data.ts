/**
 * Build-time data pipeline: data/site.yaml + data/books/*.md
 * → src/generated/books.json (LibraryData).
 *
 * Schema errors fail the build; suspicious-but-valid data is reported as
 * warnings. Text is passed through unchanged.
 *
 * Usage: bun scripts/build-data.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { z } from "zod";
import { isKnownDynasty } from "../src/lib/dynasty";
import { getImages, imageKey } from "../src/lib/generate-manifest";
import type { BookEntry } from "../src/types";
import { parseVariantTable } from "../src/lib/search/variants";
import { buildPinyinDict } from "./pinyin";

const root = join(import.meta.dir, "..");
const dataDir = join(root, "data");
const booksDir = join(dataDir, "books");
const generatedDir = join(root, "src", "generated");
const outFile = join(generatedDir, "books.json");
const imageSizesDir = join(dataDir, "image-sizes");
const variantsFile = join(dataDir, "variants", "variants.tsv");
const variantsOut = join(generatedDir, "variants.json");
const pinyinOut = join(generatedDir, "pinyin.json");

const positiveInt = z.number().int().positive();

const volumeSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string(),
  url: z.string(),
  volumeNumber: z.number().int().optional(),
  chapterNumber: z.number().int().optional(),
  // numbered within the volume's image prefix; 0 is the back of a map sheet (B109)
  startPage: z.number().int().nonnegative(),
  maxPage: positiveInt,
  // image prefix when it differs from the book id (the legacy site's bookNum)
  bookNumber: z.string().regex(/^[A-Za-z0-9]+$/).optional(),
  sequence: z.number().int(),
});

const bookSchema = z.strictObject({
  id: z.string().regex(/^[A-Za-z0-9]+$/),
  category: z.string(),
  title: z.string().min(1),
  volumes: z.string().optional(),
  authors: z.array(z.string()),
  dynasty: z.string().optional(),
  publicationInfo: z.string(),
  collectionInfo: z.string(),
  url: z.string(),
  bookType: z.enum(["manuscript", "printed", "rubbing", "unknown"]),
  isIncomplete: z.boolean(),
  hasSeals: z.boolean(),
  hasNotes: z.boolean(),
  available: z.boolean(),
  nuNumber: z.string().regex(/^\d{7}$/).optional(),
  imageSize: z.strictObject({ width: positiveInt, height: positiveInt }).optional(),
  // file-name prefix of the book's own images when it differs from the id (W002 → S002)
  imageFilePrefix: z.string().regex(/^[A-Za-z0-9]+$/).optional(),
  structure: z.array(volumeSchema),
});

const siteSchema = z.strictObject({
  title: z.string(),
  extractedAt: z.string(),
  categories: z.array(z.string()).min(1),
});

const errors: string[] = [];
const warnings: string[] = [];

function parseYaml(text: string, file: string): unknown {
  try {
    return Bun.YAML.parse(text);
  } catch (e) {
    errors.push(`${file}: YAML parse error: ${(e as Error).message}`);
    return undefined;
  }
}

function splitFrontmatter(text: string, file: string) {
  const normalized = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/.exec(normalized);
  if (!match) {
    errors.push(`${file}: missing YAML frontmatter (--- ... ---)`);
    return null;
  }
  return { frontmatter: match[1], body: match[2].trim() };
}

/**
 * data/image-sizes/<id>.tsv: sizes of the images that differ from the book's
 * `imageSize` (typically covers). Columns: image, width, height. The image is
 * its number, or its full name (`D101B0003`) for a volume prefix other than
 * the book id (see `imageKey`).
 */
function readImageSizes(id: string, images: Set<string>): Record<string, { width: number; height: number }> | undefined {
  const path = join(imageSizesDir, `${id}.tsv`);
  if (!existsSync(path)) return undefined;
  const file = `data/image-sizes/${id}.tsv`;
  const sizes: Record<string, { width: number; height: number }> = {};
  const lines = readFileSync(path, "utf8").replace(/^﻿/, "").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (i === 0 || line === "" || line.startsWith("#")) {
      if (i === 0 && line.trim() !== "image\twidth\theight") errors.push(`${file}: header must be image<TAB>width<TAB>height`);
      return;
    }
    const [image, ...rest] = line.split("\t");
    const dims = rest.map(Number);
    if (!/^(\d+|[A-Za-z0-9]+\d{4})$/.test(image) || dims.length !== 2 || !dims.every((n) => Number.isInteger(n) && n > 0)) {
      errors.push(`${file}:${i + 1}: expected an image number or name and two positive integers`);
      return;
    }
    const imageNo = /^\d+$/.test(image) ? String(Number(image)) : image;
    const [width, height] = dims;
    if (!images.has(imageNo)) errors.push(`${file}:${i + 1}: image ${imageNo} is not in the book's structure`);
    if (sizes[imageNo]) errors.push(`${file}:${i + 1}: duplicate image ${imageNo}`);
    sizes[imageNo] = { width, height };
  });
  return sizes;
}

function issues(file: string, error: z.ZodError) {
  for (const issue of error.issues) {
    errors.push(`${file}: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
}

// --- site settings ---
const siteFile = "data/site.yaml";
const siteResult = siteSchema.safeParse(
  parseYaml(readFileSync(join(dataDir, "site.yaml"), "utf8"), siteFile)
);
if (!siteResult.success) issues(siteFile, siteResult.error);
const site = siteResult.data;

// --- books ---
const books: Array<
  z.infer<typeof bookSchema> & {
    imageSizes?: Record<string, { width: number; height: number }>;
    notes?: string;
    totalVolumes: number;
  }
> = [];
const seen = new Set<string>();

for (const name of readdirSync(booksDir).filter((f) => f.endsWith(".md")).sort()) {
  const file = `data/books/${name}`;
  const parts = splitFrontmatter(readFileSync(join(booksDir, name), "utf8"), file);
  if (!parts) continue;
  const result = bookSchema.safeParse(parseYaml(parts.frontmatter, file));
  if (!result.success) {
    issues(file, result.error);
    continue;
  }
  const book = result.data;

  if (book.id !== basename(name, ".md")) errors.push(`${file}: id "${book.id}" does not match file name`);
  if (seen.has(book.id)) errors.push(`${file}: duplicate id "${book.id}"`);
  seen.add(book.id);
  if (site && !site.categories.includes(book.category)) {
    errors.push(`${file}: category "${book.category}" is not listed in data/site.yaml`);
  }

  const volumeIds = new Set<string>();
  for (const volume of book.structure) {
    if (volume.bookNumber === book.id) errors.push(`${file}: volume ${volume.id}: bookNumber equals the book id; omit it`);
    // legacy volume ids are named after their images, e.g. D101B0001 in book D101A
    if (!volume.id.startsWith(volume.bookNumber ?? book.id)) {
      errors.push(`${file}: volume ${volume.id} does not start with its image prefix ${volume.bookNumber ?? book.id}`);
    }
    if (volumeIds.has(volume.id)) errors.push(`${file}: duplicate volume id ${volume.id}`);
    volumeIds.add(volume.id);
  }

  const structure = [...book.structure].sort((a, b) => a.sequence - b.sequence);
  // Pages continue only within one image prefix, so each volume is checked
  // against the previous volume with the same prefix.
  const lastOfPrefix = new Map<string, (typeof structure)[number]>();
  for (let i = 0; i < structure.length; i++) {
    const cur = structure[i];
    const prefix = cur.bookNumber ?? book.id;
    const prevOfPrefix = lastOfPrefix.get(prefix);
    // image 0 (the back of a map sheet) is outside the page run
    if (cur.startPage > 0) lastOfPrefix.set(prefix, cur);
    if (i > 0) {
      const prev = structure[i - 1];
      if (cur.sequence === prev.sequence) errors.push(`${file}: duplicate sequence ${cur.sequence}`);
      if (cur.sequence !== prev.sequence + 1) {
        warnings.push(`${book.id}: sequence jumps from ${prev.sequence} to ${cur.sequence}`);
      }
    }
    if (!prevOfPrefix || cur.startPage === 0) continue;
    // Overlap of exactly one image is a spread shared by two 卷 and is expected.
    const diff = cur.startPage - (prevOfPrefix.startPage + prevOfPrefix.maxPage);
    if (diff !== 0 && diff !== -1) {
      warnings.push(
        `${book.id}: ${prevOfPrefix.id} ends at ${prevOfPrefix.startPage + prevOfPrefix.maxPage - 1}, ${cur.id} starts at ${cur.startPage} (${diff > 0 ? `gap ${diff}` : `overlap ${-diff}`})`
      );
    }
  }
  if (book.available && structure.length === 0) {
    warnings.push(`${book.id}: available but has no structure (single placeholder page)`);
  }
  if (book.dynasty && !isKnownDynasty(book.dynasty)) {
    warnings.push(`${book.id}: dynasty ${book.dynasty} is not in src/lib/dynasty.ts (sorted after the known ones)`);
  }
  if (book.available && !book.imageSize) {
    warnings.push(`${book.id}: available but has no imageSize (canvases use a default size)`);
  }
  const entry = { ...book, structure } as BookEntry;
  const images = new Set(structure.length > 0 ? getImages(entry).map((image) => imageKey(entry, image)) : []);
  const imageSizes = readImageSizes(book.id, images);
  if (imageSizes && !book.imageSize) {
    errors.push(`${file}: data/image-sizes/${book.id}.tsv exists but imageSize is not set`);
  }

  books.push({
    ...book,
    ...(imageSizes && Object.keys(imageSizes).length > 0 ? { imageSizes } : {}),
    structure,
    totalVolumes: structure.length,
    ...(parts.body ? { notes: parts.body } : {}),
  });
}

if (books.length === 0) errors.push("data/books: no books found");

// --- variant table (optional) ---
let variants: Record<string, string> = {};
let variantGroups = 0;
if (existsSync(variantsFile)) {
  const table = parseVariantTable(readFileSync(variantsFile, "utf8"), "data/variants/variants.tsv");
  errors.push(...table.errors);
  warnings.push(...table.warnings);
  variants = table.map;
  variantGroups = table.groups;
}

// --- pinyin for the fields pinyin search covers (keyed by original text) ---
const pinyinTexts = books.flatMap((book) => [
  book.title,
  ...book.authors,
  ...book.structure.map((v) => v.title),
  book.category,
  ...(book.dynasty ? [book.dynasty] : []),
]);
const { dict: pinyinDict, missing: noPinyin } = buildPinyinDict(pinyinTexts, variants);
if (noPinyin.length > 0) {
  warnings.push(
    `no pinyin for ${noPinyin.length} character(s): ${noPinyin.slice(0, 30).join(" ")}${noPinyin.length > 30 ? " …" : ""}`
  );
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\nbuild-data: ${errors.length} error(s); src/generated/books.json not written.`);
  process.exit(1);
}

const output = {
  metadata: {
    title: site!.title,
    totalBooks: books.length,
    categories: site!.categories,
    extractedAt: site!.extractedAt,
    totalVolumes: books.reduce((sum, book) => sum + book.totalVolumes, 0),
  },
  books,
};

mkdirSync(generatedDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(output)}\n`);
writeFileSync(variantsOut, `${JSON.stringify(variants)}\n`);
writeFileSync(pinyinOut, `${JSON.stringify(pinyinDict)}\n`);
console.log(
  `build-data: ${books.length} books, ${output.metadata.totalVolumes} volumes, ${variantGroups} variant group(s), ${warnings.length} warning(s) → src/generated/`
);
