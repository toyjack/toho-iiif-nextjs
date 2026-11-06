import BooksComp from '@/components/books'
import  { Suspense } from 'react'
import { library } from "@/lib/books";


function BooksPage() {
  return (
    <Suspense>
      <BooksComp tohoData={library}/>
    </Suspense>
  )
}

export default BooksPage
