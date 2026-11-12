/**
 * Collection figures and category groups shown on the home page and /about,
 * so both use the same numbers and wording (ui-design-system.md §4.11).
 * Server-only: reads the catalogue.
 */
import { availableBooks, library } from "@/lib/books";
import { getImages } from "@/lib/generate-manifest";
import { groupCategories, type CategoryGroupData } from "@/lib/category-groups";
import { UI } from "@/lib/ui-text";

export interface CollectionStat {
  label: string;
  value: number;
  unit?: string;
}

export function collectionStats(): CollectionStat[] {
  const viewable = availableBooks();
  const images = viewable
    .filter((book) => (book.structure?.length ?? 0) > 0)
    .reduce((acc, book) => acc + getImages(book).length, 0);
  return [
    { label: "収録", value: library.metadata.totalBooks, unit: "部" },
    { label: `うち${UI.available}`, value: viewable.length, unit: "部" },
    { label: "巻冊", value: library.metadata.totalVolumes },
    { label: "画像", value: images, unit: "枚" },
  ];
}

export function categoryGroups(): CategoryGroupData[] {
  return groupCategories(
    library.metadata.categories,
    library.books.map((b) => b.category)
  );
}
