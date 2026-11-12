
// IIIF Presentation API 3.0 Types
export interface IIIFManifest {
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "http://iiif.io/api/presentation/3/context.json"
  ];
  id: string;
  type: "Manifest";
  label: { [lang: string]: string[] };
  metadata: Array<{
    label: { [lang: string]: string[] };
    value: { [lang: string]: string[] };
  }>;
  summary?: { [lang: string]: string[] };
  viewingDirection?: "left-to-right" | "right-to-left";
  requiredStatement?: {
    label: { [lang: string]: string[] };
    value: { [lang: string]: string[] };
  };
  rights?: string;
  provider: Array<{
    id: string;
    type: "Agent";
    label: { [lang: string]: string[] };
    homepage: Array<{
      id: string;
      type: "Text";
      label: { [lang: string]: string[] };
      format: "text/html";
    }>;
  }>;
  items: IIIFCanvas[];
  structures?: IIIFRange[];
}

export interface IIIFRange {
  id: string;
  type: "Range";
  label: { [lang: string]: string[] };
  items: Array<{ id: string; type: "Canvas" }>;
}

export interface IIIFCanvas {
  id: string;
  type: "Canvas";
  label: { [lang: string]: string[] };
  height: number;
  width: number;
  items: IIIFAnnotationPage[];
}

export interface IIIFAnnotationPage {
  id: string;
  type: "AnnotationPage";
  items: IIIFAnnotation[];
}

export interface IIIFAnnotation {
  id: string;
  type: "Annotation";
  motivation: "painting";
  body: {
    id: string;
    type: "Image";
    format: "image/jpeg";
    height: number;
    width: number;
    service?: Array<{
      id: string;
      type: "ImageService3";
      profile: "http://iiif.io/api/image/3/level2.json";
    }>;
  };
  target: string;
}

// Book structure interfaces (from existing code)
export interface BookVolume {
  id: string;
  title: string;
  url: string;
  volumeNumber?: number;
  chapterNumber?: number;
  /** First image of the volume (numbered within its prefix); may be 0. */
  startPage?: number;
  maxPage?: number;
  /** Image prefix when it is not the book ID (the legacy site's `bookNum`). */
  bookNumber?: string;
  sequence?: number;
}

export interface BookEntry {
  id: string;
  category: string;
  title: string;
  volumes?: string;
  authors: string[];
  dynasty?: string;
  publicationInfo: string;
  collectionInfo: string;
  url: string;
  bookType: "manuscript" | "printed" | "rubbing" | "unknown";
  isIncomplete: boolean;
  hasSeals: boolean;
  hasNotes: boolean;
  /** Images can be viewed (formerly AvailableBook.ts). */
  available: boolean;
  /** Record number in 全国漢籍データベース (formerly NuNumber.ts). */
  nuNumber?: string;
  /**
   * Pixel size of the book's scans, from the image server's info.json.
   * Most images of a book share it (within a pixel or two); exceptions are
   * listed in `imageSizes`.
   */
  imageSize?: { width: number; height: number };
  /**
   * Images whose size differs from `imageSize` (e.g. covers), keyed by
   * image number, or by image name (`D101B0003`) for a volume prefix other
   * than the book ID (from data/image-sizes/<id>.tsv; see `imageKey`).
   */
  imageSizes?: Record<string, { width: number; height: number }>;
  /**
   * File-name prefix of the book's own images when it differs from the
   * folder (the book ID), e.g. folder W002 holds S0020001, D163 holds d1630001.
   */
  imageFilePrefix?: string;
  /** Markdown body of data/books/<id>.md (解題, notes), when present. */
  notes?: string;
  structure?: BookVolume[];
  totalVolumes?: number;
}

export interface LibraryData {
  metadata: {
    title: string;
    totalBooks: number;
    categories: string[];
    extractedAt: string;
    totalVolumes: number;
  };
  books: BookEntry[];
}