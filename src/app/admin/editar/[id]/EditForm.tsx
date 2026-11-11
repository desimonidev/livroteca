// src/app/admin/editar/[id]/EditForm.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { connection } from 'next/server'

// O componente agora recebe a Promise do params
export async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  await connection() // Isola a renderização dinâmica

  // Agora sim podemos ler o id com segurança aqui dentro
  const resolvedParams = await params
  const bookId = resolvedParams.id

  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('*, authors(name)')
    .eq('id', bookId)
    .single()

  if (!book) {
    redirect('/admin')
  }

  async function salvarEdicao(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = formData.get('title') as string
    const publicationYear = formData.get('year') ? parseInt(formData.get('year') as string) : null
    const publisher = formData.get('publisher') as string
    const translator = formData.get('translator') as string
    const description = formData.get('synopsis') as string
    const file = formData.get('cover') as File

    let coverUrl = book.cover_url

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error('Erro ao fazer upload da imagem: ' + uploadError.message)
      }

      const { data: publicUrl } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName)
        
      coverUrl = publicUrl.publicUrl
    }

    const { error: updateError } = await supabase
      .from('books')
      .update({
        title,
        publication_year: publicationYear,
        publisher,
        translator,
        description,
        cover_url: coverUrl
      })
      .eq('id', bookId)

    if (updateError) {
      throw new Error('Erro ao atualizar livro: ' + updateError.message)
    }

    redirect('/admin')
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Editar Livro</h1>
        <p className="text-zinc-400">Ajuste as informações críticas de "{book.title}".</p>
      </div>

      <form action={salvarEdicao} className="space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Capa do Livro (Opcional)</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-24 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 border border-zinc-700">
              {book.cover_url ? (
                <img src={book.cover_url} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">Sem capa</div>
              )}
            </div>
            <input 
              type="file" 
              name="cover" 
              accept="image/*"
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Título do Livro *</label>
            <input
              name="title"
              defaultValue={book.title}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Ano de Publicação</label>
            <input
              name="year"
              type="number"
              defaultValue={book.publication_year || ''}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Editora</label>
            <input
              name="publisher"
              defaultValue={book.publisher || ''}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Tradutor</label>
            <input
              name="translator"
              defaultValue={book.translator || ''}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Sinopse</label>
          <textarea
            name="synopsis"
            rows={5}
            defaultValue={book.description || ''}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
          <Link href="/admin" className="px-6 py-3 text-zinc-400 hover:text-white font-medium transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </>
  )
}