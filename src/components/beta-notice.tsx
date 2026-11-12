import Link from "next/link";
import { LEGACY_SITE_BASE } from "@/lib/book-display";
import { BETA, UI } from "@/lib/ui-text";
import ExternalLink from "./external-link";

/**
 * Test-release cautions: manifest URLs, content and licence may change; cite
 * the legacy site. A bordered box with a warning-coloured rule on the left;
 * no fill (§4.10), the text carries the meaning.
 */
export default function BetaNotice({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const last = BETA.points.length - 1;
  return (
    <aside
      aria-labelledby="beta-notice-title"
      className="flex flex-col gap-2 rounded-box border border-base-300 border-l-4 border-l-warning bg-base-100 px-5 py-4 text-sm leading-[1.8]"
    >
      <Heading id="beta-notice-title" className="font-serif text-base leading-[1.5] font-bold text-warning">
        {BETA.title}
      </Heading>
      <p>{BETA.lead}</p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {BETA.points.map((point, i) => (
          <li key={point}>
            {point}
            {i === last && (
              <>
                {" "}
                <ExternalLink href={`${LEGACY_SITE_BASE}top.html`}>旧サイト</ExternalLink>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="text-muted">
        変更の内容は
        <Link href="/changelog" className="link-text">
          {UI.changelog}
        </Link>
        でお知らせします。
      </p>
    </aside>
  );
}
