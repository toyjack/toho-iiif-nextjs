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
          <p className="font-bold text-lg">東方學デジタル圖書館</p>
          <p className="text-base-content/70">致力於保存和傳承珍貴的古代文獻</p>
          <p className="text-sm text-base-content/60">© 2024 Oriental Studies Digital Library. All rights reserved.</p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-hover" href="#">關於我們</a>
            <a className="link link-hover" href="#">聯絡方式</a>
            <a className="link link-hover" href="#">使用條款</a>
            <a className="link link-hover" href="#">隱私政策</a>
          </div>
        </nav>
      </footer>
  )
}

export default FooterComp