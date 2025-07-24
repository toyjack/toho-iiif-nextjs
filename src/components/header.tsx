import Link from "next/link";

function HeaderComp() {
  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          <span className="hidden sm:inline">東方学IIIF図書館</span>
          <span className="sm:hidden">東IIIF</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/" className="font-medium">
              ホーム
            </Link>
          </li>
          <li>
            <Link href="/books" className="font-medium text-primary">
              漢籍一覧
            </Link>
          </li>
          <li>
            <Link href="/sitepolicy" className="font-medium">
              利用規約
            </Link>
          </li>
          <li>
            <Link href="/about" className="font-medium">
              このサイトについて
            </Link>
          </li>
        </ul>
      </div>
      {/* <div className="navbar-end">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">ホーム</Link>
            </li>
            <li>漢籍一覧</li>
          </ul>
        </div>
      </div> */}
    </div>
  );
}

export default HeaderComp;
