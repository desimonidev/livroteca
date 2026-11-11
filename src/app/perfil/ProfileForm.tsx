import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

export async function ProfileForm() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Busca os livros que o usuário leu para ele poder escolher o favorito
  const { data: userBooks } = await supabase
    .from('user_books')
    .select('books(id, title)')
    .eq('user_id', user.id)
    .eq('status', 'read')

  async function salvarPerfil(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const favorite_book_id = formData.get('favorite_book_id') as string || null
    const file = formData.get('avatar') as File

    let avatar_url = profile?.avatar_url

    if (file && file.size > 0) {
      const fileName = `avatar-${user.id}-${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('book-covers').upload(fileName, file, { upsert: true })
      const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(fileName)
      avatar_url = urlData.publicUrl
    }

    const { error } = await supabase.from('profiles').update({
      full_name, bio, favorite_book_id, avatar_url
    }).eq('id', user.id)

    if (error) {
      redirect(`/perfil?error=${encodeURIComponent(error.message)}`)
    }

    redirect(`/usuarios/${user.id}`)
  }

  return (
    <form action={salvarPerfil} className="space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
      
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Foto de Perfil</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}
          </div>
          <input type="file" name="avatar" accept="image/*" className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600/10 file:text-blue-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Nome de Exibição</label>
        <input name="full_name" defaultValue={profile?.full_name || ''} placeholder="Como quer ser chamado?" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
        <textarea name="bio" rows={3} defaultValue={profile?.bio || ''} placeholder="Conte um pouco sobre você e seus gostos literários..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Livro Favorito</label>
        <select name="favorite_book_id" defaultValue={profile?.favorite_book_id || ''} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <option value="">Nenhum selecionado</option>
          {userBooks?.map((ub: any) => (
            ub.books && <option key={ub.books.id} value={ub.books.id}>{ub.books.title}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors">
          Salvar Perfil
        </button>
      </div>
    </form>
  )
}