"use client";

import { useState, type ReactNode } from "react";
import { kansekiDbUrl, legacySiteUrl } from "@/lib/book-display";
import { BETA, UI } from "@/lib/ui-text";
import Dialog from "./dialog";
import ExternalLink from "./external-link";
import Icon from "./icon";

export interface BookInfo {
  id: string;
  title: string;
  authors: string[];
  dynasty?: string;
  bookTypeLabel?: string;
  volumes?: string;
  publicationInfo: string;
  collectionInfo: string;
  category: string;
  nuNumber?: string;
  /** page on the legacy site, as in the book's `url` field */
  legacyUrl: string;
  /** site-relative manifest path */
  manifestPath: string;
}

/** 「書誌情報」 button and dialog for the reader toolbar (§4.6). */
export default function BookInfoDialog({ info }: { info: BookInfo }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyManifest = async () => {
    try {
      await navigator.clipboard.writeText(new URL(info.manifestPath, window.location.href).href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the URL stays visible and selectable
    }
  };

  const rows: Array<[string, ReactNode]> = [
    [UI.title, <span key="t" className="font-serif">{info.title}</span>],
    [UI.author, info.authors.join("、")],
    [UI.dynasty, info.dynasty],
    [UI.bookType, info.bookTypeLabel],
    [UI.volumes, info.volumes],
    [UI.publication, info.publicationInfo],
    [UI.collection, info.collectionInfo],
    [UI.category, info.category],
    [UI.id, <span key="i" className="font-mono">{info.id}</span>],
  ];

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm shrink-0 gap-1 px-2 font-normal"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Icon name="info" />
        <span className="max-sm:sr-only">{UI.bookInfo}</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={UI.bookInfo}>
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            {rows
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-xs leading-5 font-bold whitespace-nowrap text-muted">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
          </dl>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {info.nuNumber && <ExternalLink href={kansekiDbUrl(info.nuNumber)}>{UI.kansekiDb}</ExternalLink>}
            <ExternalLink href={legacySiteUrl(info.legacyUrl)}>{UI.legacySite}</ExternalLink>
          </p>
          <div className="flex flex-col gap-1.5 border-t border-base-300 pt-4">
            <p className="text-xs font-bold text-muted">{UI.manifest}</p>
            <div className="flex items-center gap-2">
              <a href={info.manifestPath} className="link-text min-w-0 flex-1 truncate font-mono text-[0.8125rem]">
                {info.manifestPath}
              </a>
              <button type="button" className="btn btn-sm btn-outline border-border-strong shrink-0" onClick={copyManifest}>
                <Icon name="copy" />
                {UI.copy}
              </button>
            </div>
            <p role="status" className="min-h-5 text-[0.8125rem] text-success">
              {copied ? UI.copied : ""}
            </p>
            <p className="text-[0.8125rem] leading-normal text-warning">{BETA.manifestShort}</p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
