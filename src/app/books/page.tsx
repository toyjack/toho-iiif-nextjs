import BooksComp from '@/components/books'
import  { Suspense } from 'react'
import { bookSummaries, library } from "@/lib/books";


function BooksPage() {
  return (
    <Suspense>
      <BooksComp
        books={bookSummaries()}
        totalBooks={library.metadata.totalBooks}
      />
    </Suspense>
  )
}

export default BooksPage
