// src/app/usuarios/[id]/ProfileData.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { FavoriteBookPicker } from '@/app/components/FavoriteBookPicker'

const STATUS_SECTIONS = [
  { status: 'reading', title: 'Lendo atualmente', dot: 'bg-blue-500', empty: null },
  { status: 'read', title: 'Já leu', dot: 'bg-green-500', empty: 'Nenhum livro lido ainda.' },
  { status: 'want_to_read', title: 'Quero ler', dot: 'bg-yellow-500', empty: null },
  { status: 'dropped', title: 'Dropados', dot: 'bg-red-500', empty: null },
] as const

export async function ProfileData({ params }: { params: Promise<{ id: string }> }) {
  await connection()

  const { id: userId } = await params

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, favorite_book:books(id, title, cover_url, authors(name))')
    .eq('id', userId)
    .single()

  if (!profile) redirect('/usuarios')

  const { data: userBooks, error: userBooksError } = await supabase
    .from('user_books')
    .select('status, rating, books(id, title, cover_url)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (userBooksError) console.error('Erro ao buscar estante:', userBooksError.message)

  const porStatus = (s: string) => userBooks?.filter((b) => b.status === s) ?? []
  const lidos = porStatus('read')
  const lendo = porStatus('reading')
  const total = userBooks?.length ?? 0

  const fav: any = profile.favorite_book
  const isOwnProfile = currentUser?.id === userId

  // Opções do seletor: livros lidos (+ o favorito atual, se já não estiver na lista)
  const favOptions: { id: string; title: string }[] = lidos
    .map((item: any) => item.books)
    .filter(Boolean)
    .map((b: any) => ({ id: b.id as string, title: b.title as string }))
  if (fav && !favOptions.some((o) => o.id === fav.id)) {
    favOptions.unshift({ id: fav.id, title: fav.title })
  }

  const dataEntrada = new Date(profile.updated_at || Date.now()).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* ===== CARD DO PERFIL ===== */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm mb-8 relative">
        {isOwnProfile && (
          <Link
            href="/perfil"
            className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-zinc-700"
          >
            Editar Perfil
          </Link>
        )}

        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden border-4 border-zinc-950 shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white shadow-inner">
              {(profile.full_name?.[0] || currentUser?.email?.[0] || 'L').toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-3xl font-bold text-white mb-2">
            {profile.full_name || 'Leitor(a)'}
          </h1>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto md:mx-0">
            {profile.bio || 'Este leitor ainda não escreveu uma bio.'}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm text-zinc-300">
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Na plataforma desde</span>
              <strong className="text-white">{dataEntrada}</strong>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Livros Lidos</span>
              <strong className="text-white">{lidos.length}</strong>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Lendo agora</span>
              <strong className="text-white">{lendo.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIVRO FAVORITO ===== */}
      {(fav || isOwnProfile) && (
        <div className="flex items-center gap-5 bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl backdrop-blur-sm mb-8">
          <div className="w-16 shrink-0 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
            {fav?.cover_url ? (
              <img src={fav.cover_url} alt={fav.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">⭐</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Livro favorito</span>
            {fav ? (
              <>
                <p className="text-lg font-bold text-white line-clamp-2">{fav.title}</p>
                <p className="text-sm text-zinc-400">{fav.authors?.name}</p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Nenhum favorito escolhido ainda.</p>
            )}

            {isOwnProfile && (
              <div className="mt-3 max-w-xs">
                <FavoriteBookPicker options={favOptions} currentId={fav?.id ?? null} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ESTANTE (abre e fecha) ===== */}
      <details className="group bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm">
        <summary className="flex items-center justify-between gap-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 md:p-8">
          <div>
            <h2 className="text-xl font-bold text-white">Estante</h2>
            <p className="text-sm text-zinc-400">
              {total === 0
                ? 'Nenhum livro na estante ainda.'
                : `${total} ${total === 1 ? 'livro' : 'livros'} · ${lidos.length} ${lidos.length === 1 ? 'lido' : 'lidos'}`}
            </p>
          </div>

          <span className="flex items-center gap-2 bg-blue-600 group-hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0">
            <span className="group-open:hidden">Abrir estante</span>
            <span className="hidden group-open:inline">Fechar estante</span>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>

        <div className="space-y-10 px-6 pb-8 md:px-8 border-t border-zinc-800 pt-8">
          {STATUS_SECTIONS.map(({ status, title, dot, empty }) => {
            const items = porStatus(status)

            if (items.length === 0 && !empty) return null

            return (
              <section key={status}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dot}`}></span> {title} ({items.length})
                </h3>

                {items.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item: any) => (
                      <div
                        key={item.books?.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 relative"
                      >
                        <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2 overflow-hidden">
                          {item.books?.cover_url ? (
                            <img
                              src={item.books.cover_url}
                              alt={item.books.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              Sem capa
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white line-clamp-2">{item.books?.title}</p>
                        {item.rating != null && (
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs text-yellow-500 font-bold">
                            ★ {Number(item.rating)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl p-8 text-center text-zinc-500">
                    {empty}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </details>
    </>
  )
}