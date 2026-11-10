export interface CategoryGroupData {
  title: string;
  items: Array<{ name: string; count: number }>;
}

/**
 * Split categories into subject classes and 文庫 (collections), keeping the
 * display order of `categories` (data/site.yaml). A category is a 文庫 when
 * its name ends with 「文庫」; everything else (四部, 叢書部, 新學部) is a class.
 * Empty groups are dropped.
 */
export function groupCategories(categories: string[], bookCategories: string[]): CategoryGroupData[] {
  const counts = new Map<string, number>();
  for (const c of bookCategories) counts.set(c, (counts.get(c) ?? 0) + 1);
  const item = (name: string) => ({ name, count: counts.get(name) ?? 0 });
  return [
    { title: "分類", items: categories.filter((c) => !c.endsWith("文庫")).map(item) },
    { title: "文庫", items: categories.filter((c) => c.endsWith("文庫")).map(item) },
  ].filter((g) => g.items.length > 0);
}
