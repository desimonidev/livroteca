// src/app/usuarios/[id]/ProfileData.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'

// Recebe a Promise do params
export async function ProfileData({ params }: { params: Promise<{ id: string }> }) {
  await connection()

  // Desempacota o ID aqui dentro do Suspense (onde é seguro)
  const resolvedParams = await params
  const userId = resolvedParams.id

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, favorite_book:books(title, cover_url)')
    .eq('id', userId)
    .single()

  if (!profile) redirect('/usuarios')

  const { data: userBooks } = await supabase
    .from('user_books')
    .select('status, rating, books(title, cover_url)')
    .eq('user_id', userId)

  const lidos = userBooks?.filter(b => b.status === 'read') || []
  const lendo = userBooks?.filter(b => b.status === 'reading') || []
  
  const dataEntrada = new Date(profile.updated_at || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const isOwnProfile = currentUser?.id === userId

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm mb-12 relative">
        
        {isOwnProfile && (
          <Link href="/perfil" className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-zinc-700">
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
            {profile.full_name || currentUser?.email || 'Leitor(a)'}
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
            {profile.favorite_book && (
              <div>
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Livro Favorito</span>
                <strong className="text-blue-400">{profile.favorite_book.title}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {lendo.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Lendo atualmente
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {lendo.map((item: any, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2 overflow-hidden">
                    {item.books?.cover_url ? <img src={item.books.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem capa</div>}
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-2">{item.books?.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Já leu ({lidos.length})
          </h2>
          {lidos.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {lidos.map((item: any, i) => (
               <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 relative group">
                 <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-2 overflow-hidden">
                   {item.books?.cover_url ? <img src={item.books.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem capa</div>}
                 </div>
                 <p className="text-sm font-medium text-white line-clamp-2">{item.books?.title}</p>
                 {item.rating && (
                   <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs text-yellow-500 font-bold">★ {item.rating}</div>
                 )}
               </div>
             ))}
           </div>
          ) : (
            <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl p-8 text-center text-zinc-500">Nenhum livro lido ainda.</div>
          )}
        </section>
      </div>
    </>
  )
}