/**
 * The last /books URL (with its filters) in this tab, so the reader's
 * 「漢籍一覧」 link can return to the same list. sessionStorage is
 * per-tab and may be unavailable (private mode, blocked storage); callers
 * fall back to plain /books.
 */
const KEY = "toho:last-list";

export function rememberListUrl(url: string): void {
  try {
    window.sessionStorage.setItem(KEY, url);
  } catch {
    // storage unavailable: the back link just goes to /books
  }
}

/** A remembered /books URL, or null. Only same-site /books paths are returned. */
export function recallListUrl(): string | null {
  try {
    const url = window.sessionStorage.getItem(KEY);
    return url && isListUrl(url) ? url : null;
  } catch {
    return null;
  }
}

export function isListUrl(url: string): boolean {
  return url === "/books" || url.startsWith("/books?");
}
