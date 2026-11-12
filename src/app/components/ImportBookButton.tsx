'use client'

import { useState, useTransition } from 'react'
import { importBook } from '@/app/acervo/actions'
import { BookStatusSelect } from './BookStatusSelect'
import type { ExternalBook } from '@/lib/books/search'

export function ImportBookButton({ book }: { book: ExternalBook }) {
  const [bookId, setBookId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (bookId) {
    return (
      <div>
        <p className="text-xs text-green-400 mb-2">✓ No seu acervo</p>
        <BookStatusSelect bookId={bookId} current={null} />
      </div>
    )
  }

  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const res = await importBook(book)
            if (res.error) setError(res.error)
            else setBookId(res.bookId)
          })
        }
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {pending ? 'Adicionando...' : 'Adicionar ao acervo'}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}