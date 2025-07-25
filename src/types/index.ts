
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
  startPage?: number;
  maxPage?: number;
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