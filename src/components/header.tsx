"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/books", label: "漢籍一覧" },
  { href: "/sitepolicy", label: "利用規約" },
  { href: "/about", label: "このサイトについて" },
];

function HeaderComp() {
  const pathname = usePathname();

  const links = NAV_ITEMS.map(({ href, label }) => {
    const active = pathname === href;
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`font-medium ${active ? "text-primary" : ""}`}
        >
          {label}
        </Link>
      </li>
    );
  });

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          <span className="hidden sm:inline">東方学IIIF図書館</span>
          <span className="sm:hidden">東IIIF</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{links}</ul>
      </div>
      <div className="navbar-end lg:hidden">
        {/* key={pathname} remounts the menu after navigation so it closes. */}
        <details key={pathname} className="dropdown dropdown-end">
          <summary className="btn btn-ghost" aria-label="メニュー">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <ul className="menu dropdown-content bg-base-100 rounded-box z-50 mt-2 w-56 p-2 shadow border border-base-200">
            {links}
          </ul>
        </details>
      </div>
    </div>
  );
}

export default HeaderComp;
