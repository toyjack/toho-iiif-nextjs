import { bookTypeLabel } from "@/lib/book-type";
import { BookEntry, BookVolume, IIIFAnnotation, IIIFBehavior, IIIFAnnotationPage, IIIFCanvas, IIIFManifest, IIIFRange, LibraryData } from "@/types";

const IMAGE_SERVICE_BASE_URL: string = "https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif";

/** Site name in traditional (zh) and Japanese shinjitai (ja) forms. */
const SITE_NAME = { zh: ["東方學IIIF圖書館"], ja: ["東方学IIIF図書館"] };

/**
 * Volumes in reading order (by `sequence`, falling back to data order).
 */
export function sortVolumes(volumes: BookVolume[]): BookVolume[] {
  return volumes
    .map((volume, index) => ({ volume, index }))
    .sort(
      (a, b) =>
        (a.volume.sequence ?? a.index) - (b.volume.sequence ?? b.index) ||
        a.index - b.index
    )
    .map(({ volume }) => volume);
}

/**
 * Inclusive range of book-wide image numbers covered by a volume.
 *
 * Images are numbered continuously across the whole book, and `startPage`
 * is the authoritative first image of each volume. Adjacent volumes may share
 * one image when a 卷 boundary falls inside a scanned spread.
 * Returns null when the volume has no usable page count.
 */
export function volumePageRange(volume: BookVolume): [number, number] | null {
  const start = volume.startPage ?? 1;
  const count = volume.maxPage ?? 0;
  if (count < 1) return null;
  return [start, start + count - 1];
}

/**
 * Manifest-level `behavior` of a book.
 *
 * A 卷子本 (`behavior: continuous`) with one scroll is continuous as a whole.
 * With several scrolls each volume's Range is continuous instead, and the
 * manifest is `individuals` so viewers do not stitch one scroll onto the next
 * (Tify also turns off its two-page view for either value).
 * Other books get no behavior.
 */
export function manifestBehavior(
  book: BookEntry,
  rangeCount: number
): IIIFBehavior[] | undefined {
  if (book.behavior !== "continuous") return undefined;
  return rangeCount > 1 ? ["individuals"] : ["continuous"];
}

/**
 * One image on the image server: `<prefix>%2F<prefix>NNNN`.
 *
 * The prefix is the book's ID unless a volume names another one in
 * `bookNumber` (the legacy site's `bookNum`), as for works whose 上下卷 were
 * scanned under different IDs. Numbers count within a prefix and may start
 * at 0 (the back of a map sheet).
 */
export interface ImageRef {
  prefix: string;
  imageNo: number;
}

/** Image prefix of a volume. */
export function volumePrefix(book: BookEntry, volume: BookVolume): string {
  return volume.bookNumber ?? book.id;
}

/**
 * Distinct images of a book in reading order: volumes by `sequence`, each
 * volume's images ascending, an image shared with an earlier volume (a
 * spread on a 卷 boundary) kept at its first place. For a book with one
 * prefix this is ascending image order. Books without structure get a single
 * placeholder image (1).
 */
export function getImages(book: BookEntry): ImageRef[] {
  const seen = new Set<string>();
  const images: ImageRef[] = [];
  for (const volume of sortVolumes(book.structure ?? [])) {
    const range = volumePageRange(volume);
    if (!range) continue;
    const prefix = volumePrefix(book, volume);
    for (let imageNo = range[0]; imageNo <= range[1]; imageNo++) {
      const key = imageKey(book, { prefix, imageNo });
      if (seen.has(key)) continue;
      seen.add(key);
      images.push({ prefix, imageNo });
    }
  }
  return images.length > 0 ? images : [{ prefix: book.id, imageNo: 1 }];
}

/** Image file name without the directory, e.g. `D101B0003`. */
export function imageName({ prefix, imageNo }: ImageRef): string {
  return `${prefix}${String(imageNo).padStart(4, "0")}`;
}

/**
 * Key of an image within its book, as used in `imageSizes` and
 * data/image-sizes/<id>.tsv: the number alone for the book's own prefix,
 * the full image name (`D101B0003`) for another prefix.
 */
export function imageKey(book: BookEntry, image: ImageRef): string {
  return image.prefix === book.id ? String(image.imageNo) : imageName(image);
}

/**
 * Image service ID: `<base>/<prefix>%2F<file>`. Files of the book's own prefix
 * are named with `book.imageFilePrefix` when it is set.
 */
export function imageServiceId(book: BookEntry, image: ImageRef): string {
  const filePrefix = image.prefix === book.id ? book.imageFilePrefix : undefined;
  const file = filePrefix ? imageName({ ...image, prefix: filePrefix }) : imageName(image);
  return `${IMAGE_SERVICE_BASE_URL}/${image.prefix}%2F${file}`;
}

/**
 * Used when a book has no recorded `imageSize`. The scans are landscape
 * spreads, so this only keeps the aspect ratio close; viewers fit the image
 * to the canvas.
 */
export const DEFAULT_IMAGE_SIZE = { width: 4000, height: 3400 } as const;

/** Canvas (and image) size of one image of a book. */
export function canvasSize(book: BookEntry, image: ImageRef): { width: number; height: number } {
  return book.imageSizes?.[imageKey(book, image)] ?? book.imageSize ?? DEFAULT_IMAGE_SIZE;
}

/** `…/canvas/<book>/p<n>`, or `…/canvas/<book>/<prefix>/p<n>` for another prefix. */
function canvasId(baseUrl: string, book: BookEntry, image: ImageRef): string {
  const prefix = image.prefix === book.id ? "" : `${image.prefix}/`;
  return `${baseUrl}/canvas/${book.id}/${prefix}p${image.imageNo}`;
}


export class IIIFManifestGenerator {
  private tohoData: LibraryData;
  private baseUrl: string;

  /**
   * @param baseUrl Public origin of this site, e.g. "https://example.org".
   *   Used for manifest, canvas and range IDs; a trailing slash is ignored.
   */
  constructor(tohoData: LibraryData, baseUrl: string) {
    this.tohoData = tohoData;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Generate a IIIF manifest for a single book
   */
  generateManifest(book: BookEntry): IIIFManifest {
    const manifestId = `${this.baseUrl}/manifest/${book.id}/manifest.json`;

    // Create metadata entries
    const metadata = [
      {
        label: { en: ["Title"], zh: ["書名"] },
        value: { zh: [book.title] },
      },
      {
        label: { en: ["Category"], zh: ["類別"] },
        value: { zh: [book.category] },
      },
    ];

    // Add authors if available
    if (book.authors && book.authors.length > 0) {
      metadata.push({
        label: { en: ["Author(s)"], zh: ["著者"] },
        value: { zh: book.authors },
      });
    }

    // Add dynasty if available
    if (book.dynasty) {
      metadata.push({
        label: { en: ["Dynasty"], zh: ["朝代"] },
        value: { zh: [book.dynasty] },
      });
    }

    // Add publication info
    if (book.publicationInfo) {
      metadata.push({
        label: { en: ["Publication Info"], zh: ["出版信息"] },
        value: { zh: [book.publicationInfo] },
      });
    }

    // Add volume info if available
    if (book.volumes) {
      metadata.push({
        label: { en: ["Volumes"], zh: ["卷數"] },
        value: { zh: [book.volumes] },
      });
    }

    metadata.push({
      label: { en: ["Book Type"], zh: ["版本類型"] },
      value: { zh: [bookTypeLabel(book.bookType)] },
    });

    // Create one canvas per distinct image. Volumes become ranges, which may
    // share an image when a 卷 boundary falls inside one scanned spread.
    const volumes = sortVolumes(book.structure ?? []);
    const canvases: IIIFCanvas[] = getImages(book).map((image) =>
      this.createCanvas(book, volumes, image)
    );

    const structures: IIIFRange[] = volumes
      .filter((volume) => volumePageRange(volume))
      .map((volume) => {
        const [first, last] = volumePageRange(volume)!;
        const prefix = volumePrefix(book, volume);
        const items: IIIFRange["items"] = [];
        for (let imageNo = first; imageNo <= last; imageNo++) {
          items.push({ id: canvasId(this.baseUrl, book, { prefix, imageNo }), type: "Canvas" });
        }
        return {
          id: `${this.baseUrl}/range/${book.id}/${volume.id}`,
          type: "Range",
          label: { zh: [volume.title] },
          ...(book.behavior === "continuous" ? { behavior: ["continuous"] as IIIFBehavior[] } : {}),
          items,
        };
      });

    const behavior = manifestBehavior(book, structures.length);

    const manifest: IIIFManifest = {
      "@context": [
        "http://www.w3.org/ns/anno.jsonld",
        "http://iiif.io/api/presentation/3/context.json",
      ],
      id: manifestId,
      type: "Manifest",
      label: { zh: [book.title] },
      metadata,
      ...(book.publicationInfo ? { summary: { zh: [book.publicationInfo] } } : {}),
      viewingDirection: "right-to-left",
      ...(behavior ? { behavior } : {}),
      requiredStatement: {
        label: { en: ["Attribution"], zh: ["歸屬"] },
        value: SITE_NAME,
      },
      rights: "http://creativecommons.org/licenses/by/4.0/",
      provider: [
        {
          id: this.baseUrl,
          type: "Agent",
          label: SITE_NAME,
          homepage: [
            {
              id: this.baseUrl,
              type: "Text",
              label: SITE_NAME,
              format: "text/html",
            },
          ],
        },
      ],
      items: canvases,
      ...(structures.length > 0 ? { structures } : {}),
    };

    return manifest;
  }

  /**
   * Create a canvas for a page
   */
  private createCanvas(
    book: BookEntry,
    volumes: BookVolume[],
    image: ImageRef
  ): IIIFCanvas {
    const id = canvasId(this.baseUrl, book, image);
    const { imageNo } = image;

    const { width, height } = canvasSize(book, image);

    // A shared spread is labelled with every volume it belongs to.
    const labels = volumes.flatMap((volume) => {
      const range = volumePageRange(volume);
      if (!range || volumePrefix(book, volume) !== image.prefix) return [];
      if (imageNo < range[0] || imageNo > range[1]) return [];
      return [`${volume.title} - 第${imageNo - range[0] + 1}頁`];
    });
    const pageLabel = labels.length > 0 ? labels.join("・") : `第${imageNo}頁`;

    const serviceId = imageServiceId(book, image);

    const annotation: IIIFAnnotation = {
      id: `${id}/annotation/1`,
      type: "Annotation",
      motivation: "painting",
      body: {
        id: `${serviceId}/full/max/0/default.jpg`,
        type: "Image",
        format: "image/jpeg",
        height,
        width,
        service: [
          {
            id: serviceId,
            type: "ImageService3",
            profile: "http://iiif.io/api/image/3/level2.json",
          },
        ],
      },
      target: id,
    };

    const annotationPage: IIIFAnnotationPage = {
      id: `${id}/page/1`,
      type: "AnnotationPage",
      items: [annotation],
    };

    const canvas: IIIFCanvas = {
      id,
      type: "Canvas",
      label: {
        zh: [pageLabel],
        // en: [pageLabel],
      },
      height,
      width,
      items: [annotationPage],
    };

    return canvas;
  }


  getManifest(manifestId: string): IIIFManifest | null {
    // load book 
    const book = this.tohoData.books.find((b) => b.id === manifestId);
    if (!book) {
      return null;
    }
    // Generate manifest for the book

    const manifest = this.generateManifest(book);
    return manifest;
  }
}

