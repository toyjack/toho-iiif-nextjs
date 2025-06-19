import Link from "next/link";
import React from "react";

function HeaderComp() {
  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          <span className="hidden sm:inline">東方學デジタル圖書館</span>
          <span className="sm:hidden">東方學</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/" className="font-medium">
              首頁
            </Link>
          </li>
          <li>
            <Link href="/books" className="font-medium text-primary">
              古籍瀏覽
            </Link>
          </li>
          <li>
            <Link href="/viewer" className="font-medium">
              閱讀器
            </Link>
          </li>
          <li>
            <Link href="/about" className="font-medium">
              關於我們
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">首頁</Link>
            </li>
            <li>古籍瀏覽</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HeaderComp;
