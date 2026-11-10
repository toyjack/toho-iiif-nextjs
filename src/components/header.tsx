"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/ui-text";
import Icon from "./icon";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/books", label: "漢籍一覧" },
  { href: "/sitepolicy", label: "利用規約" },
  { href: "/about", label: "このサイトについて" },
];

function HeaderComp() {
  const pathname = usePathname();

  const links = (variant: "bar" | "menu") =>
    NAV_ITEMS.map(({ href, label }) => {
      const active = pathname === href;
      return (
        <li key={href}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              variant === "bar"
                ? // current: ink 700 + 2px gold underline; others: underline on hover
                  `flex h-14 items-center border-b-2 px-3 text-sm transition-colors duration-150 ${
                    active ? "border-primary font-bold" : "border-transparent hover:underline hover:underline-offset-4"
                  }`
                : `flex min-h-11 items-center px-3 text-sm ${active ? "font-bold underline decoration-primary decoration-2 underline-offset-4" : ""}`
            }
          >
            {label}
          </Link>
        </li>
      );
    });

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="mx-auto flex h-14 w-full max-w-page items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="font-serif text-base leading-tight font-bold sm:text-lg">
          {SITE_NAME}
        </Link>
        <nav aria-label="メイン" className="hidden md:block">
          <ul className="flex items-center">{links("bar")}</ul>
        </nav>
        {/* key={pathname} remounts the menu after navigation so it closes. */}
        <details key={pathname} className="dropdown dropdown-end md:hidden">
          <summary className="btn btn-ghost btn-square size-11" aria-label="メニュー">
            <Icon name="menu" size={20} />
          </summary>
          <nav aria-label="メイン">
            <ul className="dropdown-content z-50 mt-1 flex w-56 flex-col rounded-box border border-base-300 bg-base-100 p-1 shadow-md">
              {links("menu")}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}

export default HeaderComp;
