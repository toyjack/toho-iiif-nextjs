import Link from 'next/link'
import React from 'react'

function FooterComp() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="font-bold text-lg">東方学IIIF図書館</p>
          <p className="text-base-content/70">
          <Link href="https://www.ciih.zinbun.kyoto-u.ac.jp/" target="_blank" rel="noopener noreferrer" className="link link-primary">
            京都大学人文科学研究所附属人文情報学創新センター
          </Link>
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-base-content/60">© 2025 INSTITUTE FOR RESEARCH IN HUMANITIES, KYOTO UNIVERSITY.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/60">本サイトの漢籍コンテンツは</span>
              <a 
                href="https://creativecommons.org/licenses/by/4.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-base-content/60 hover:text-primary transition-colors"
              >
                
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 14.5h-1V11c0-.55.45-1 1-1s1 .45 1 1v3.5zm0-5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5.5 5.5h-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H8V11c0-1.66 1.34-3 3-3s3 1.34 3 3v3.5z"/>
                </svg>
                CC BY 4.0
              </a>
              <span className="text-xs text-base-content/60">でライセンスされています</span>
            </div>
          </div>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <Link className="link link-hover" href={`/about`}>このサイトについて</Link>
            {/* <a className="link link-hover" href="#">お問い合わせ</a> */}
            <Link className="link link-hover" href="/sitepolicy">利用規約</Link>
            {/* <a className="link link-hover" href="#">プライバシーポリシー</a> */}
          </div>
        </nav>
      </footer>
  )
}

export default FooterComp