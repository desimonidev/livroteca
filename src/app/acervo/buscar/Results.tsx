import Link from 'next/link'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchExternalBooks, normalize } from '@/lib/books/search'
import { BookStatusSelect } from '@/app/components/BookStatusSelect'
import { ImportBookButton } from '@/app/components/ImportBookButton'
import type { ReadingStatus } from '@/app/acervo/actions'

function Cover({ url, title }: { url: string | null; title: string }) {
    return (
        <div className="aspect-[2/3] bg-zinc-800 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
            {url ? (
                <img src={url} alt={`Capa de ${title}`} className="w-full h-full object-cover" />
            ) : (
                <span className="text-zinc-600 text-sm">Sem capa</span>
            )}
        </div>
    )
}

export async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    await connection()

    const { q } = await searchParams
    const query = q?.trim()
    if (!query) return null

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <p className="text-zinc-400">Faça login para buscar livros.</p>

    // 1. Seu acervo primeiro
    const { data: local } = await supabase
        .from('books')
        .select('id, title, cover_url, isbn, normalized_title, authors(name)')
        .ilike('title', `%${query.replace(/[%_]/g, '')}%`)
        .limit(10)

    const localIds = (local ?? []).map((b: any) => b.id)
    const { data: estante } = localIds.length
        ? await supabase.from('user_books').select('book_id, status, rating').eq('user_id', user.id).in('book_id', localIds)
        : { data: [] }
    const estantePorLivro = new Map<string, { status: ReadingStatus; rating: number | null }>(
        (estante ?? []).map((r) => [r.book_id, { status: r.status as ReadingStatus, rating: r.rating }])
    )

    // 2. APIs externas, sem repetir o que já está no acervo
    const external = await searchExternalBooks(query)
    const localIsbns = new Set((local ?? []).map((b: any) => b.isbn).filter(Boolean))
    const localTitles = new Set((local ?? []).map((b: any) => b.normalized_title))
    const novos = external.filter(
        (b) => !(b.isbn && localIsbns.has(b.isbn)) && !localTitles.has(normalize(b.title))
    )

    return (
        <div className="space-y-12">
            {local && local.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">No acervo ({local.length})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {local.map((book: any) => (
                            <div key={book.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 flex flex-col">
                                <Cover url={book.cover_url} title={book.title} />
                                <h3 className="font-bold text-white text-sm line-clamp-2">{book.title}</h3>
                                <p className="text-xs text-zinc-400 mb-3">{book.authors?.name}</p>
                                <div className="mt-auto">
                                    <BookStatusSelect bookId={book.id} current={estantePorLivro.get(book.id)?.status ?? null} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold text-white mb-4">Encontrados online ({novos.length})</h2>
                {novos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {novos.map((book) => (
                            <div key={`${book.source}-${book.externalId}`} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 flex flex-col">
                                <Cover url={book.coverUrl} title={book.title} />
                                <h3 className="font-bold text-white text-sm line-clamp-2">{book.title}</h3>
                                <p className="text-xs text-zinc-400">{book.author}</p>
                                <p className="text-xs text-zinc-500 mb-3">{book.year ?? 'Ano desconhecido'}</p>
                                <div className="mt-auto">
                                    <ImportBookButton book={book} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500">Nada novo encontrado online.</p>
                )}
            </section>

            <p className="text-sm text-zinc-500">
                Não achou?{' '}
                <Link href="/acervo/novo" className="text-blue-400 hover:underline">
                    Cadastre o livro manualmente
                </Link>
                .
            </p>
        </div>
    )
}