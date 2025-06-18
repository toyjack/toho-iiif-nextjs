import { BookEntry, BookVolume, IIIFAnnotation, IIIFAnnotationPage, IIIFCanvas, IIIFManifest, LibraryData } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const BASE_URL: string = "https://toyjack.github.io/toho-html-data";
const IMAGE_SERVICE_BASE_URL: string = "https://iiif.toyjack.net/iiif";
const OUTPUT_DIR = "./docs"; // Directory to save manifests


export class IIIFManifestGenerator {
  private tohoData: LibraryData;
  constructor(tohoData: LibraryData) {
    this.tohoData = tohoData;
  }

  /**
   * Generate a IIIF manifest for a single book
   */
  generateManifest(book: BookEntry): IIIFManifest {
    const manifestId = `${BASE_URL}/manifests/${book.id}.json`;

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
        label: { en: ["Author(s)"], zh: ["作者"] },
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
        label: { en: ["Publication Info"], zh: ["版本信息"] },
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

    // Create canvases from volumes
    const canvases: IIIFCanvas[] = [];

    if (book.structure && book.structure.length > 0) {
      for (const volume of book.structure) {
        // Create canvases for each page in the volume
        const maxPage = volume.maxPage || 1;
        const startPage = volume.startPage || 1;

        for (let pageNum = 1; pageNum <= maxPage; pageNum++) {
          const globalPageNum = startPage + pageNum - 1;
          const canvas = this.createCanvas(
            book,
            volume,
            pageNum,
            globalPageNum
          );
          canvases.push(canvas);
        }
      }
    } else {
      // If no structure, create a single canvas as placeholder
      const canvas = this.createCanvas(book, null, 1, 1);
      canvases.push(canvas);
    }

    const manifest: IIIFManifest = {
      "@context": [
        "http://www.w3.org/ns/anno.jsonld",
        "http://iiif.io/api/presentation/3/context.json",
      ],
      id: manifestId,
      type: "Manifest",
      label: {
        zh: [book.title],
        en: [book.title],
      },
      metadata,
      summary: {
        zh: [book.publicationInfo || ""],
        en: [book.publicationInfo || ""],
      },
      viewingDirection: "right-to-left",
      requiredStatement: {
        label: { en: ["Attribution"], zh: ["歸屬"] },
        value: {
          zh: ["東方學数字圖書館"],
          ja: ["東方學デジタル圖書館"],
          en: ["Oriental Studies Digital Library"],
        },
      },
      rights: "http://creativecommons.org/licenses/by-nc/4.0/",
      provider: [
        {
          id: BASE_URL,
          type: "Agent",
          label: {
            ja: ["東方學デジタル圖書館"],
            // "en": ["Oriental Studies Digital Library"]
          },
          homepage: [
            {
              id: BASE_URL,
              type: "Text",
              label: {
                ja: ["東方學デジタル圖書館"],
                // "en": ["Oriental Studies Digital Library"]
              },
              format: "text/html",
            },
          ],
        },
      ],
      items: canvases,
    };

    return manifest;
  }

  /**
   * Create a canvas for a page
   */
  private createCanvas(
    book: BookEntry,
    volume: BookVolume | null,
    pageNum: number,
    globalPageNum: number
  ): IIIFCanvas {
    const canvasId = `${BASE_URL}/canvas/${book.id}/${
      volume?.id || "p"
    }_${pageNum}`;

    // Standard page dimensions (can be adjusted based on actual scans)
    const width = 1000;
    const height = 1400;

    const pageLabel = volume
      ? `${volume.title} - 第${pageNum}頁`
      : `第${pageNum}頁`;

    // Create image annotation
    const imageId = `${IMAGE_SERVICE_BASE_URL}/${book.id}/${
      volume?.id || "default"
    }_${String(pageNum).padStart(3, "0")}.jpg`;

    const annotation: IIIFAnnotation = {
      id: `${canvasId}/annotation/1`,
      type: "Annotation",
      motivation: "painting",
      body: {
        id: imageId,
        type: "Image",
        format: "image/jpeg",
        height,
        width,
        service: [
          {
            "@id": `${IMAGE_SERVICE_BASE_URL}/${book.id}%2F${book.id}${String(
              pageNum
            ).padStart(4, "0")}`,
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level2.json",
          },
        ],
      },
      target: canvasId,
    };

    const annotationPage: IIIFAnnotationPage = {
      id: `${canvasId}/page/1`,
      type: "AnnotationPage",
      items: [annotation],
    };

    const canvas: IIIFCanvas = {
      id: canvasId,
      type: "Canvas",
      label: {
        zh: [pageLabel],
        en: [pageLabel],
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

