/**
 * Site name in the interface (header, footer, home, page titles); decided
 * 2026-11-10 (ui-design-system.md §7-1). Prose in /about and /sitepolicy and
 * the IIIF manifest's provider label (generate-manifest.ts) spell it out
 * separately; /about's 「東方學デジタル圖書館」 is the original site's name.
 */
export const SITE_NAME = "東方学IIIF図書館";

/**
 * Interface wording (docs/ui-design-system.md §6). Catalogue data — titles,
 * authors, categories, dynasties, book-type labels — is source text and is
 * not defined here.
 */
export const UI = {
  author: "著者",
  read: "閲覧",
  available: "閲覧可能",
  onlyAvailable: "閲覧可能のみ",
  preparing: "準備中",
  volumes: "巻数",
  hasSeals: "印あり",
  hasNotes: "注あり",
  incomplete: "殘",
  title: "書名",
  category: "分類",
  dynasty: "時代",
  bookType: "版種",
  status: "状態",
  id: "ID",
  all: "すべて",
  search: "検索",
  filter: "絞り込み",
  clearFilters: "条件をクリア",
  clearAll: "すべてクリア",
  sort: "並び順",
  sortRelevance: "関連度",
  sortId: "ID",
  sortTitle: "書名",
  sortCategory: "分類",
  sortDynasty: "時代",
  ascending: "昇順",
  descending: "降順",
  viaVariant: "異体字で一致",
  viaPinyin: "拼音で一致",
  kansekiDb: "全国漢籍DB",
  legacySite: "旧サイト",
  newTab: "（新しいタブで開く）",
  close: "閉じる",
  prev: "前へ",
  next: "次へ",
  pagination: "ページ送り",
  unknownBookType: "不明",
  backToList: "漢籍一覧",
  bookInfo: "書誌情報",
  manifest: "IIIF マニフェスト",
  copy: "コピー",
  copied: "コピーしました",
  publication: "出版事項",
  collection: "所蔵",
  loadingImages: "画像を読み込んでいます…",
  viewer: "ビューア",
  viewerLoadError: "ビューアを読み込めませんでした。ページを再読み込みするか、別のビューアをお試しください。",
  changelog: "更新履歴",
} as const;

/**
 * Test-release cautions (beta notice). Shown on the home page, /about,
 * /sitepolicy and in the reader's bibliographic dialog; one wording for all.
 */
export const BETA = {
  badge: "試験公開",
  title: "試験公開版についてのご注意",
  lead: "本サイトは試験公開中のシステムです。",
  points: [
    "IIIF マニフェストの URL は確定しておらず、予告なく変わることがあります。",
    "公開している書誌・画像などの内容は、予告なく変更・削除されることがあります。",
    "ライセンス（利用条件）は今後変更される可能性があります。",
    "論文などでの参照先としての利用はお勧めしません。引用が必要な場合は、旧サイト（東方學デジタル圖書館）の URL をお使いください。",
  ],
  manifestShort: "試験公開中のため、マニフェストの URL は予告なく変わることがあります。引用には旧サイトの URL をお使いください。",
} as const;

/**
 * 1234 → "1,234". Written out rather than `toLocaleString` so server and
 * browser output can never differ (hydration).
 */
export function formatNumber(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 「12 件」 */
export function countLabel(n: number): string {
  return `${formatNumber(n)} 件`;
}

/** 「335 件中 1–50 件」; 「0 件」 when empty. */
export function rangeLabel(total: number, start: number, end: number): string {
  if (total === 0) return countLabel(0);
  return `${formatNumber(total)} 件中 ${formatNumber(start + 1)}–${formatNumber(end)} 件`;
}
