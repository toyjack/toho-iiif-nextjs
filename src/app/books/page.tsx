import BooksComp from '@/components/books'
import  { Suspense } from 'react'
import { tohoData } from "@/constants/TohoData";
import { AvailableBook } from "@/constants/AvailableBook";


function BooksPage() {
  return (
    <Suspense>
      <BooksComp tohoData={tohoData} AvailableBook={AvailableBook}/>
    </Suspense>
  )
}

export default BooksPage