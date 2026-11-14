/**
 * Universal Viewer and Mirador are loaded from their prebuilt bundles, copied
 * to /vendor by scripts/copy-viewer-assets.ts, instead of being bundled by
 * Next: UV loads its own chunks relative to its script, and Mirador's
 * self-contained build carries its own React and MUI.
 */

const loaded = new Map<string, Promise<void>>();

/** Add a `<script>` once and resolve when it has run. */
export function loadScript(src: string): Promise<void> {
  let promise = loaded.get(src);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loaded.delete(src);
        script.remove();
        reject(new Error(`failed to load ${src}`));
      };
      document.head.append(script);
    });
    loaded.set(src, promise);
  }
  return promise;
}

/** Add a stylesheet `<link>` once. */
export function loadStylesheet(href: string): void {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}
