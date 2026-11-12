// src/app/acervo/BookList.tsx
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { BookStatusSelect } from '@/app/components/BookStatusSelect'
import type { ReadingStatus } from '@/app/acervo/actions'

export async function BookList() {
    await connection()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // Estante do usuário logado: uma query só, não uma por livro
    const { data: estante } = user
        ? await supabase
            .from('user_books')
            .select('book_id, status, rating')
            .eq('user_id', user.id)
        : { data: [] }

    const estantePorLivro = new Map<string, { status: ReadingStatus; rating: number | null }>(
        (estante ?? []).map((r) => [
            r.book_id,
            { status: r.status as ReadingStatus, rating: r.rating != null ? Number(r.rating) : null },
        ])
    )

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
            {books.map((book: any) => {
                const entry = estantePorLivro.get(book.id)

                return (
                    <div key={book.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col group hover:border-zinc-700 transition-colors">
                        <div className="aspect-[2/3] bg-zinc-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">

                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={`Capa de ${book.title}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            )}

                            {book.status === 'pending' && (
                                <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-md border border-yellow-500/30 font-medium">
                                    Pendente
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-sm text-zinc-400 mb-2">{book.authors?.name}</p>
                        <p className="text-xs text-zinc-500 mb-4">{book.publication_year || 'Ano desconhecido'}</p>

                        {/* Seletor de status e nota: só aparece para quem está logado */}
                        {user && (
                            <div className="mt-auto">
                                <BookStatusSelect
                                    bookId={book.id}
                                    current={entry?.status ?? null}
                                    rating={entry?.rating ?? null}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}