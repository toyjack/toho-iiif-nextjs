/**
 * Parser for the variant-character table (data/variants/variants.tsv).
 *
 * Format: UTF-8, tab-separated, first non-comment line is the header
 * `standard<TAB>variants<TAB>source<TAB>note`. Lines starting with `#` are
 * comments. `variants` holds one or more characters separated by spaces.
 * A header with only two columns (`字A<TAB>字B`, no header names) is also
 * accepted: each line is then one pair.
 *
 * Every entry must be exactly one Unicode code point. Each line is an
 * equivalence group; groups sharing a character are merged (union-find) and
 * the representative is the `standard` of the earliest line.
 */

export type VariantMap = Record<string, string>;

export interface VariantTableResult {
  /** character → representative, only for characters that differ from it */
  map: VariantMap;
  errors: string[];
  warnings: string[];
  groups: number;
}

const isPrivateUse = (cp: number) =>
  (cp >= 0xe000 && cp <= 0xf8ff) || (cp >= 0xf0000 && cp <= 0x10fffd);

export function parseVariantTable(text: string, file = "variants.tsv"): VariantTableResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parent = new Map<string, string>();
  const order = new Map<string, number>(); // first line a char appeared on, for representative choice
  const preferred = new Map<string, string>(); // root → standard of its earliest line

  const find = (c: string): string => {
    let root = c;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // path compression
    let node = c;
    while (parent.get(node) !== root) {
      const next = parent.get(node)!;
      parent.set(node, root);
      node = next;
    }
    return root;
  };
  const add = (c: string, line: number) => {
    if (!parent.has(c)) {
      parent.set(c, c);
      order.set(c, line);
    }
  };

  const lines = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  let headerSeen = false;
  let groups = 0;

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = rawLine.trimEnd();
    if (line.trim() === "" || line.trimStart().startsWith("#")) return;
    const cols = line.split("\t");
    if (!headerSeen) {
      headerSeen = true;
      if (cols[0].trim() === "standard") return; // named header
    }

    const where = `${file}:${lineNo}`;
    const standard = cols[0]?.trim() ?? "";
    const variants = (cols[1] ?? "").trim().split(/[ 　]+/).filter(Boolean);
    const chars = [standard, ...variants];

    let ok = true;
    for (const c of chars) {
      const cps = [...c];
      if (cps.length !== 1) {
        errors.push(`${where}: "${c}" is not exactly one character`);
        ok = false;
        continue;
      }
      if (isPrivateUse(c.codePointAt(0)!)) warnings.push(`${where}: "${c}" is a private-use character`);
    }
    if (!ok) return;
    if (variants.length === 0) {
      errors.push(`${where}: no variants for "${standard}"`);
      return;
    }
    if (variants.includes(standard)) warnings.push(`${where}: "${standard}" is listed as its own variant`);

    groups++;
    const existing = chars.filter((c) => parent.has(c));
    if (existing.length > 0) {
      warnings.push(`${where}: ${existing.join(" ")} already appeared earlier; groups merged`);
    }
    for (const c of chars) add(c, lineNo);

    // Union into the group seen first; it keeps its representative.
    const roots = [...new Set(chars.map(find))].sort((a, b) => order.get(a)! - order.get(b)!);
    const target = roots[0];
    if (!preferred.has(target)) preferred.set(target, standard);
    for (const r of roots.slice(1)) {
      parent.set(r, target);
      preferred.delete(r);
    }
  });

  const map: VariantMap = {};
  for (const c of parent.keys()) {
    const representative = preferred.get(find(c))!;
    if (c !== representative) map[c] = representative;
  }
  return { map, errors, warnings, groups };
}
