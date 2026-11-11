import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function NovoLivro() {

  // SERVER ACTION: Roda no servidor, com acesso seguro aos cookies do usuário
  async function cadastrarLivro(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const title = formData.get('title') as string
    const authorName = formData.get('author') as string
    const publicationYearStr = formData.get('year') as string
    const publisher = formData.get('publisher') as string
    const translator = formData.get('translator') as string
    const synopsis = formData.get('synopsis') as string

    const normalize = (text: string) => 
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

    const normalizedAuthor = normalize(authorName)
    const normalizedTitle = normalize(title)
    const publicationYear = publicationYearStr ? parseInt(publicationYearStr) : null

    try {
      // 1. Verificar se o autor existe
      let authorId = null
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('normalized_name', normalizedAuthor)
        .maybeSingle() // maybeSingle não dá erro se não achar nada

      if (existingAuthor) {
        authorId = existingAuthor.id
      } else {
        // Cria o autor
        const { data: newAuthor, error: authorError } = await supabase
          .from('authors')
          .insert({
            name: authorName,
            normalized_name: normalizedAuthor,
            created_by: user.id,
            status: 'pending'
          })
          .select('id')
          .single()

        if (authorError) throw new Error("Erro ao criar autor: " + authorError.message)
        authorId = newAuthor.id
      }

      // 2. Verificar se o livro já existe
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('normalized_title', normalizedTitle)
        .eq('author_id', authorId)
        .maybeSingle()

      if (existingBook) {
        throw new Error("Este livro já está cadastrado no acervo.")
      }

      // 3. Inserir o livro
      const { error: bookError } = await supabase
        .from('books')
        .insert({
          title,
          normalized_title: normalizedTitle,
          author_id: authorId,
          publication_year: publicationYear,
          publisher,
          translator,
          description: synopsis,
          created_by: user.id,
          source: 'user_created',
          status: 'pending'
        })

      if (bookError) throw new Error("Erro ao criar livro: " + bookError.message)

    } catch (error: any) {
      // Redireciona de volta com uma mensagem de erro na URL (simples e efetivo)
      redirect(`/acervo/novo?error=${encodeURIComponent(error.message)}`)
    }

    // Se tudo der certo, volta pro acervo
    redirect('/acervo')
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto relative z-10">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="mb-8">
        <Link href="/acervo" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-4 transition-colors w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar para o Acervo
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Adicionar Novo Livro</h1>
        <p className="text-zinc-400">Preencha as informações básicas. A equipe revisará os dados em breve.</p>
      </div>

      {/* O form agora chama a Server Action diretamente */}
      <form action={cadastrarLivro} className="space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Título do Livro *</label>
            <input
              name="title"
              required
              placeholder="Ex: Dom Casmurro"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Autor *</label>
            <input
              name="author"
              required
              placeholder="Ex: Machado de Assis"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Ano de Publicação</label>
            <input
              name="year"
              type="number"
              placeholder="Ex: 1899"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Editora</label>
            <input
              name="publisher"
              placeholder="Ex: Companhia das Letras"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Tradutor</label>
            <input
              name="translator"
              placeholder="Ex: João da Silva"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Sinopse (Opcional)</label>
          <textarea
            name="synopsis"
            rows={4}
            placeholder="Escreva um breve resumo do livro..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          ></textarea>
        </div>

        {/* Área de Erro (se houver na URL) */}
        <div className="hidden">
          {/* O Next.js não deixa ler searchParams no Server Component sem passar como prop, 
              então para simplificar, apenas confiaremos no redirecionamento. */}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
          <Link 
            href="/acervo"
            className="px-6 py-3 text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            Cadastrar Livro
          </button>
        </div>
      </form>
    </div>
  )
}