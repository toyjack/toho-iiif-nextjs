function SitePolicyPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-8">利用規約</h1>
      <p className="text-base-content/70 mb-4">
        このサイトは、京都大学人文科学研究所附属人文情報学創新センターが提供する東アジア古典籍のデジタル図書館です。
      </p>
      <p className="text-base-content/70 mb-4">
        利用者は、本サイトを利用することにより、以下の利用規約に同意したものとみなされます。
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">ライセンスについて</h2>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <a 
            href="https://creativecommons.org/licenses/by/4.0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 14.5h-1V11c0-.55.45-1 1-1s1 .45 1 1v3.5zm0-5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5.5 5.5h-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H8V11c0-1.66 1.34-3 3-3s3 1.34 3 3v3.5z"/>
            </svg>
            <span className="text-lg font-medium">Creative Commons 表示 4.0 国際ライセンス (CC BY 4.0)</span>
          </a>
        </div>
        <p className="text-base-content/70 mb-4">
          本サイトの漢籍コンテンツは、<strong>Creative Commons 表示 4.0 国際ライセンス (CC BY 4.0)</strong> の下で提供されています。
        </p>
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-2">ご利用いただけること：</h3>
          <ul className="list-disc list-inside space-y-1 text-base-content/70">
            <li><strong>共有</strong> — どのようなメディアやフォーマットでも資料を複製し、頒布することができます</li>
            <li><strong>翻案</strong> — 資料をリミックスし、改変し、別の作品のベースにすることができます</li>
            <li><strong>営利目的での利用</strong> — 商用利用も可能です</li>
          </ul>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-2">守っていただく条件：</h3>
          <ul className="list-disc list-inside space-y-1 text-base-content/70">
            <li><strong>表示</strong> — 適切なクレジットを表示し、ライセンスへのリンクを提供し、変更があったらその旨を示してください</li>
            <li>適切な表示例：「出典：東方学IIIF図書館（京都大学人文科学研究所）CC BY 4.0」</li>
          </ul>
        </div>
        <p className="text-base-content/70 text-sm">
          詳細は <a href="https://creativecommons.org/licenses/by/4.0/deed.ja" target="_blank" rel="noopener noreferrer" className="link link-primary">CC BY 4.0 ライセンス条項</a> をご確認ください。
        </p>
      </div>
      <h2 className="text-2xl font-semibold mt-6 mb-4">免責事項</h2>
      <p className="text-base-content/70 mb-4">
        本サイトの情報は、正確性を期していますが、その内容について保証するものではありません。利用者は自己責任で本サイトを利用してください。
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-4">お問い合わせ</h2>
      <p className="text-base-content/70 mb-4">
        本サイトに関するお問い合わせは、京都大学人文科学研究所までご連絡ください。
      </p>
    </div>
  )
}
export default SitePolicyPage