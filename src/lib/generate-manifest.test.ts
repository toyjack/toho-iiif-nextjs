import { describe, expect, test } from "bun:test";
import { library } from "@/lib/books";
import { BookEntry, BookVolume, IIIFManifest } from "@/types";
import {
  getImageNumbers,
  IIIFManifestGenerator,
  sortVolumes,
  volumePageRange,
} from "./generate-manifest";

function volume(
  sequence: number,
  startPage: number,
  maxPage: number | undefined
): BookVolume {
  return {
    id: `T001${String(sequence).padStart(4, "0")}`,
    title: `卷${sequence}`,
    url: "",
    sequence,
    startPage,
    maxPage,
  };
}

function book(structure: BookVolume[]): BookEntry {
  return {
    id: "T001",
    category: "經部",
    title: "test",
    authors: [],
    publicationInfo: "",
    collectionInfo: "",
    url: "",
    bookType: "printed",
    isIncomplete: false,
    hasSeals: false,
    hasNotes: false,
    available: true,
    structure,
  };
}

function serviceNumbers(manifest: IIIFManifest): number[] {
  return manifest.items.map((canvas) =>
    Number(canvas.items[0].items[0].body.service![0].id.slice(-4))
  );
}

const generator = new IIIFManifestGenerator(library, "https://example.test");

describe("page mapping", () => {
  test("uses book-wide image numbers from startPage", () => {
    const b = book([volume(1, 1, 3), volume(2, 4, 2)]);
    const manifest = generator.generateManifest(b);
    expect(serviceNumbers(manifest)).toEqual([1, 2, 3, 4, 5]);
    expect(manifest.items[3].items[0].items[0].body.service![0].id).toEndWith(
      "/T001%2FT0010004"
    );
  });

  test("a spread shared by two volumes becomes one canvas in both ranges", () => {
    const b = book([volume(1, 1, 3), volume(2, 3, 2)]);
    const manifest = generator.generateManifest(b);
    expect(serviceNumbers(manifest)).toEqual([1, 2, 3, 4]);
    const shared = manifest.items[2].id;
    expect(manifest.structures![0].items.map((i) => i.id)).toContain(shared);
    expect(manifest.structures![1].items[0].id).toBe(shared);
    expect(manifest.items[2].label.zh[0]).toBe("卷1 - 第3頁・卷2 - 第1頁");
  });

  test("volumes are ordered by sequence, not array order", () => {
    const sorted = sortVolumes([volume(3, 10, 2), volume(1, 1, 5), volume(2, 6, 4)]);
    expect(sorted.map((v) => v.sequence)).toEqual([1, 2, 3]);
  });

  test("volumes without a page count contribute no images", () => {
    expect(volumePageRange(volume(1, 5, undefined))).toBeNull();
    expect(getImageNumbers(book([volume(1, 5, undefined)]))).toEqual([1]);
  });

  test("book without structure gets a single placeholder canvas", () => {
    expect(generator.generateManifest(book([])).items).toHaveLength(1);
  });
});

describe("real data", () => {
  test("A029 second volume starts at image 84 and the book ends at 341", () => {
    const manifest = generator.getManifest("A029")!;
    const numbers = serviceNumbers(manifest);
    expect(numbers).toHaveLength(341);
    expect(numbers[83]).toBe(84);
    expect(manifest.structures![1].items[0].id).toBe(manifest.items[83].id);
  });

  test("A046 ends at image 139 (checked against the image server)", () => {
    const a046 = library.books.find((b) => b.id === "A046")!;
    expect(getImageNumbers(a046).at(-1)).toBe(139);
  });

  test("B004 ranges follow sequence order", () => {
    const manifest = generator.getManifest("B004")!;
    const ids = manifest.structures!.map((r) => r.id.slice(-8));
    expect(ids).toEqual([...ids].sort());
  });

  test("every volume of an available book has a page count", () => {
    const missing = library.books
      .filter((b) => b.available)
      .flatMap((b) => b.structure ?? [])
      .filter((v) => !v.maxPage)
      .map((v) => v.id);
    expect(missing).toEqual([]);
  });
});
