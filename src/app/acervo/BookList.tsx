// src/app/acervo/BookList.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'

export async function BookList() {
  await connection() // <-- A MÁGICA ACONTECE AQUI

  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select(`
      id,
      title,
      publication_year,
      cover_url,
      status,
      authors (name)
    `)
    .order('created_at', { ascending: false })

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-3xl">
        <div className="text-zinc-600 mb-6">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-zinc-300 mb-2">Nenhum livro no acervo ainda</h3>
        <p className="text-zinc-500 max-w-md text-center">
          Seja o primeiro a compartilhar um livro com a comunidade.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book: any) => (
        <div key={book.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col group hover:border-zinc-700 transition-colors">
          <div className="aspect-[2/3] bg-zinc-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
            <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            {book.status === 'pending' && (
              <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-md border border-yellow-500/30 font-medium">
                Pendente
              </div>
            )}
          </div>
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-sm text-zinc-400 mb-2">{book.authors?.name}</p>
          <p className="text-xs text-zinc-500 mt-auto">{book.publication_year || 'Ano desconhecido'}</p>
        </div>
      ))}
    </div>
  )
}