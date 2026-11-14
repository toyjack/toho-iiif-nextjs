import { describe, expect, test } from "bun:test";
import { library } from "@/lib/books";
import { BookEntry, BookVolume, IIIFManifest } from "@/types";
import {
  DEFAULT_IMAGE_SIZE,
  getImages,
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
    expect(getImages(book([volume(1, 5, undefined)]))).toEqual([{ prefix: "T001", imageNo: 1 }]);
  });

  test("book without structure gets a single placeholder canvas", () => {
    expect(generator.generateManifest(book([])).items).toHaveLength(1);
  });
});

describe("volume image prefixes (bookNumber)", () => {
  const serviceIds = (manifest: IIIFManifest) =>
    manifest.items.map((c) => c.items[0].items[0].body.service![0].id.split("/").pop());

  // 上卷 under the book's own prefix, 下卷 under another, both numbered from 1
  const twoPrefixes = book([volume(1, 1, 2), { ...volume(2, 1, 2), bookNumber: "T001B" }]);

  test("each volume's images use its own prefix, in reading order", () => {
    expect(serviceIds(generator.generateManifest(twoPrefixes))).toEqual([
      "T001%2FT0010001",
      "T001%2FT0010002",
      "T001B%2FT001B0001",
      "T001B%2FT001B0002",
    ]);
  });

  test("canvas IDs stay distinct and ranges point at their own prefix", () => {
    const manifest = generator.generateManifest(twoPrefixes);
    const ids = manifest.items.map((c) => c.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids[0]).toBe("https://example.test/canvas/T001/p1");
    expect(ids[2]).toBe("https://example.test/canvas/T001/T001B/p1");
    expect(manifest.structures![1].items.map((i) => i.id)).toEqual(ids.slice(2));
    expect(manifest.items[2].label.zh[0]).toBe("卷2 - 第1頁");
  });

  test("image 0 is allowed and volume order decides the canvas order", () => {
    // front of a map sheet (0001) then its back (0000)
    const map = book([volume(1, 1, 1), volume(2, 0, 1)]);
    expect(getImages(map).map((i) => i.imageNo)).toEqual([1, 0]);
    expect(serviceIds(generator.generateManifest(map))[1]).toBe("T001%2FT0010000");
  });

  test("size exceptions of another prefix are keyed by image name", () => {
    const b = {
      ...twoPrefixes,
      imageSize: { width: 4000, height: 3000 },
      imageSizes: { "1": { width: 2000, height: 3000 }, T001B0002: { width: 1000, height: 3000 } },
    };
    expect(generator.generateManifest(b).items.map((c) => c.width)).toEqual([2000, 4000, 4000, 1000]);
  });
});

describe("image file prefix (imageFilePrefix)", () => {
  const base = "https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif";
  const body = (manifest: IIIFManifest, i: number) => manifest.items[i].items[0].items[0].body;

  test("files are named after the book id by default", () => {
    expect(body(generator.generateManifest(book([volume(1, 1, 1)])), 0).service![0].id).toBe(`${base}/T001%2FT0010001`);
  });

  test("imageFilePrefix renames the book's own files, in the book's folder", () => {
    const b = {
      ...book([volume(1, 1, 1), { ...volume(2, 1, 1), bookNumber: "T001B" }]),
      imageFilePrefix: "s001",
    };
    const manifest = generator.generateManifest(b);
    expect(body(manifest, 0).service![0].id).toBe(`${base}/T001%2Fs0010001`);
    expect(body(manifest, 0).id).toBe(`${base}/T001%2Fs0010001/full/max/0/default.jpg`);
    // another volume prefix keeps its own file names; canvas IDs are unchanged
    expect(body(manifest, 1).service![0].id).toBe(`${base}/T001B%2FT001B0001`);
    expect(manifest.items[0].id).toBe("https://example.test/canvas/T001/p1");
  });
});

describe("descriptive properties", () => {
  test("site name uses traditional forms for zh and shinjitai for ja", () => {
    const manifest = generator.generateManifest(book([]));
    expect(manifest.provider![0].label).toEqual({ zh: ["東方學IIIF圖書館"], ja: ["東方学IIIF図書館"] });
    expect(manifest.requiredStatement!.value).toEqual(manifest.provider![0].label);
  });

  test("summary is omitted when there is no publication info", () => {
    expect(generator.generateManifest(book([])).summary).toBeUndefined();
    const withInfo = { ...book([]), publicationInfo: "乾隆刊本" };
    expect(generator.generateManifest(withInfo).summary).toEqual({ zh: ["乾隆刊本"] });
  });

  test("book type is labelled", () => {
    const value = generator.generateManifest(book([])).metadata!.find((m) => m.label.en?.[0] === "Book Type")!.value;
    expect(value).toEqual({ zh: ["刊本"] });
  });
});

describe("canvas size", () => {
  test("canvas and image use the book's imageSize", () => {
    const b = { ...book([volume(1, 1, 2)]), imageSize: { width: 4000, height: 3415 } };
    const canvas = generator.generateManifest(b).items[0];
    expect([canvas.width, canvas.height]).toEqual([4000, 3415]);
    const body = canvas.items[0].items[0].body;
    expect([body.width, body.height]).toEqual([4000, 3415]);
  });

  test("per-image exceptions override imageSize", () => {
    const b = {
      ...book([volume(1, 1, 3)]),
      imageSize: { width: 5800, height: 2570 },
      imageSizes: { 1: { width: 5800, height: 3185 } },
    };
    const sizes = generator.generateManifest(b).items.map((c) => [c.width, c.height]);
    expect(sizes).toEqual([[5800, 3185], [5800, 2570], [5800, 2570]]);
  });

  test("falls back to a landscape default without imageSize", () => {
    const canvas = generator.generateManifest(book([volume(1, 1, 1)])).items[0];
    expect([canvas.width, canvas.height]).toEqual([
      DEFAULT_IMAGE_SIZE.width,
      DEFAULT_IMAGE_SIZE.height,
    ]);
  });
});

describe("scrolls (behavior: continuous)", () => {
  const scroll = (structure: BookVolume[]): BookEntry => ({
    ...book(structure),
    behavior: "continuous",
  });

  test("each scroll's range is continuous; several scrolls are individuals", () => {
    const manifest = generator.generateManifest(scroll([volume(1, 1, 3), volume(2, 4, 2)]));
    expect(manifest.behavior).toEqual(["individuals"]);
    expect(manifest.structures!.map((r) => r.behavior)).toEqual([["continuous"], ["continuous"]]);
  });

  test("a single scroll is continuous as a whole", () => {
    const manifest = generator.generateManifest(scroll([volume(1, 1, 5)]));
    expect(manifest.behavior).toEqual(["continuous"]);
    expect(manifest.structures![0].behavior).toEqual(["continuous"]);
  });

  test("other books get no behavior", () => {
    const manifest = generator.generateManifest(book([volume(1, 1, 3), volume(2, 4, 2)]));
    expect(manifest.behavior).toBeUndefined();
    expect(manifest.structures!.every((r) => r.behavior === undefined)).toBe(true);
  });
});

describe("real data", () => {
  test("D005 is two continuous scrolls", () => {
    const manifest = generator.getManifest("D005")!;
    expect(manifest.behavior).toEqual(["individuals"]);
    expect(manifest.structures!.map((r) => r.behavior)).toEqual([["continuous"], ["continuous"]]);
  });

  test("A029 second volume starts at image 84 and the book ends at 341", () => {
    const manifest = generator.getManifest("A029")!;
    const numbers = serviceNumbers(manifest);
    expect(numbers).toHaveLength(341);
    expect(numbers[83]).toBe(84);
    expect(manifest.structures![1].items[0].id).toBe(manifest.items[83].id);
  });

  test("A046 ends at image 139 (checked against the image server)", () => {
    const a046 = library.books.find((b) => b.id === "A046")!;
    expect(getImages(a046).at(-1)).toEqual({ prefix: "A046", imageNo: 139 });
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
