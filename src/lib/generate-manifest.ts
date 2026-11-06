import { BookEntry, BookVolume, IIIFAnnotation, IIIFAnnotationPage, IIIFCanvas, IIIFManifest, IIIFRange, LibraryData } from "@/types";

const IMAGE_SERVICE_BASE_URL: string = "https://image.kanji.zinbun.kyoto-u.ac.jp/toho/iiif";

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
 * Distinct image numbers of a book in ascending order.
 * Books without structure get a single placeholder image (1).
 */
export function getImageNumbers(book: BookEntry): number[] {
  const numbers = new Set<number>();
  for (const volume of book.structure ?? []) {
    const range = volumePageRange(volume);
    if (!range) continue;
    for (let imageNo = range[0]; imageNo <= range[1]; imageNo++) {
      numbers.add(imageNo);
    }
  }
  if (numbers.size === 0) return [1];
  return [...numbers].sort((a, b) => a - b);
}

export function imageServiceId(book: BookEntry, imageNo: number): string {
  return `${IMAGE_SERVICE_BASE_URL}/${book.id}%2F${book.id}${String(imageNo).padStart(4, "0")}`;
}

function canvasId(baseUrl: string, book: BookEntry, imageNo: number): string {
  return `${baseUrl}/canvas/${book.id}/p${imageNo}`;
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

    // Add book type
    const bookTypeMap: { [key: string]: string } = {
      manuscript: "手鈔本",
      printed: "刊本",
      rubbing: "拓本",
      unknown: "未知",
    };

    metadata.push({
      label: { en: ["Book Type"], zh: ["版本類型"] },
      value: { zh: [bookTypeMap[book.bookType] || book.bookType] },
    });

    // Create one canvas per distinct image. Volumes become ranges, which may
    // share an image when a 卷 boundary falls inside one scanned spread.
    const volumes = sortVolumes(book.structure ?? []);
    const imageNumbers = getImageNumbers(book);
    const canvases: IIIFCanvas[] = imageNumbers.map((imageNo) =>
      this.createCanvas(book, volumes, imageNo)
    );

    const structures: IIIFRange[] = volumes
      .filter((volume) => volumePageRange(volume))
      .map((volume) => {
        const [first, last] = volumePageRange(volume)!;
        const items: IIIFRange["items"] = [];
        for (let imageNo = first; imageNo <= last; imageNo++) {
          items.push({ id: canvasId(this.baseUrl, book, imageNo), type: "Canvas" });
        }
        return {
          id: `${this.baseUrl}/range/${book.id}/${volume.id}`,
          type: "Range",
          label: { zh: [volume.title] },
          items,
        };
      });

    const manifest: IIIFManifest = {
      "@context": [
        "http://www.w3.org/ns/anno.jsonld",
        "http://iiif.io/api/presentation/3/context.json",
      ],
      id: manifestId,
      type: "Manifest",
      label: {
        zh: [book.title],
        // en: [book.title],
      },
      metadata,
      summary: {
        zh: [book.publicationInfo || ""],
        // en: [book.publicationInfo || ""],
      },
      viewingDirection: "right-to-left",
      requiredStatement: {
        label: { en: ["Attribution"], zh: ["歸屬"] },
        value: {
          zh: ["東方學IIIF圖書館"],
          ja: ["東方学IIIF図書館"],
          // en: ["Oriental Studies Digital Library"],
        },
      },
      rights: "http://creativecommons.org/licenses/by/4.0/",
      provider: [
        {
          id: this.baseUrl,
          type: "Agent",
          label: {
            ja: ["東方学IIIF図書館"],
            zh: ["東方学IIIF図書館"],
            // "en": ["Oriental Studies Digital Library"]
          },
          homepage: [
            {
              id: this.baseUrl,
              type: "Text",
              label: {
                ja: ["東方学IIIF図書館"],
                zh: ["東方学IIIF図書館"],
                // "en": ["Oriental Studies Digital Library"]
              },
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
    imageNo: number
  ): IIIFCanvas {
    const id = canvasId(this.baseUrl, book, imageNo);

    // Standard page dimensions (can be adjusted based on actual scans)
    const width = 1000;
    const height = 1400;

    // A shared spread is labelled with every volume it belongs to.
    const labels = volumes.flatMap((volume) => {
      const range = volumePageRange(volume);
      if (!range || imageNo < range[0] || imageNo > range[1]) return [];
      return [`${volume.title} - 第${imageNo - range[0] + 1}頁`];
    });
    const pageLabel = labels.length > 0 ? labels.join("・") : `第${imageNo}頁`;

    const serviceId = imageServiceId(book, imageNo);

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

