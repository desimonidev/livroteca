'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { normalize, enrichBook, type ExternalBook } from '@/lib/books/search'

export type ReadingStatus = 'want_to_read' | 'reading' | 'read' | 'dropped'

// Livros vindos de API entram aprovados. Se o status de books/authors não
// aceitar 'approved', troque por 'pending'.
const IMPORT_STATUS = 'approved'

export async function setBookStatus(bookId: string, status: ReadingStatus | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado.' }

  if (status === null) {
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('user_id', user.id)
      .eq('book_id', bookId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('user_books')
      .upsert(
        { user_id: user.id, book_id: bookId, status, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,book_id' }
      )
    if (error) return { error: error.message }
  }

  revalidatePath('/acervo')
  revalidatePath(`/usuarios/${user.id}`)
  return { error: null }
}

type ImportResult = { error: string | null; bookId: string | null; existed: boolean }

export async function importBook(input: ExternalBook): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado.', bookId: null, existed: false }

  const title = input.title?.trim().slice(0, 300)
  const authorName = input.author?.trim().slice(0, 200)
  if (!title || !authorName) {
    return { error: 'Dados do livro incompletos.', bookId: null, existed: false }
  }

  const normalizedTitle = normalize(title)
  const normalizedAuthor = normalize(authorName)

  // 1. Autor: acha ou cria
  let authorId: string
  const { data: existingAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('normalized_name', normalizedAuthor)
    .maybeSingle()

  if (existingAuthor) {
    authorId = existingAuthor.id
  } else {
    const { data: newAuthor, error: authorError } = await supabase
      .from('authors')
      .insert({
        name: authorName,
        normalized_name: normalizedAuthor,
        created_by: user.id,
        status: IMPORT_STATUS,
      })
      .select('id')
      .single()

    if (authorError) {
      return { error: 'Erro ao criar autor: ' + authorError.message, bookId: null, existed: false }
    }
    authorId = newAuthor.id
  }

  // 2. Já existe? (por ISBN, por id externo ou por título + autor)
  let existing: { id: string } | null = null

  if (input.isbn) {
    const { data } = await supabase
      .from('books').select('id').eq('isbn', input.isbn).maybeSingle()
    existing = data
  }
  if (!existing) {
    const { data } = await supabase
      .from('books').select('id')
      .eq('external_source', input.source)
      .eq('external_id', input.externalId)
      .maybeSingle()
    existing = data
  }
  if (!existing) {
    const { data } = await supabase
      .from('books').select('id')
      .eq('normalized_title', normalizedTitle)
      .eq('author_id', authorId)
      .maybeSingle()
    existing = data
  }

  const full = await enrichBook(input)

  if (existing) return { error: null, bookId: existing.id, existed: true }

  // 3. Insere
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      title,
      normalized_title: normalizedTitle,
      author_id: authorId,
      publication_year: full.year,
      publisher: full.publisher,
      description: full.description,
      cover_url: full.coverUrl,
      isbn: full.isbn,
      external_id: input.externalId,
      external_source: input.source,
      created_by: user.id,
      source: 'api_import',
      status: IMPORT_STATUS,
    })
    .select('id')
    .single()

  if (bookError) {
    return { error: 'Erro ao salvar livro: ' + bookError.message, bookId: null, existed: false }
  }

  revalidatePath('/acervo')
  return { error: null, bookId: book.id, existed: false }
}

export async function updateProgress(bookId: string, currentPage: number, totalPages: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado.' }

  if (!Number.isInteger(currentPage) || !Number.isInteger(totalPages)) {
    return { error: 'Informe números inteiros.' }
  }
  if (totalPages < 1 || totalPages > 20000) return { error: 'Total de páginas inválido.' }
  if (currentPage < 0 || currentPage > totalPages) {
    return { error: 'A página atual não pode passar do total.' }
  }

  const { error } = await supabase
    .from('user_books')
    .update({
      current_page: currentPage,
      total_pages: totalPages,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { error: null }
}

export async function setRating(bookId: string, rating: number | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado.' }

  if (rating !== null) {
    const valid =
      typeof rating === 'number' && rating >= 0.5 && rating <= 5 && Number.isInteger(rating * 2)
    if (!valid) return { error: 'Nota inválida.' }
  }

  const { data, error } = await supabase
    .from('user_books')
    .update({ rating })
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .select('book_id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Coloque o livro na estante antes de dar nota.' }

  revalidatePath('/acervo')
  revalidatePath(`/usuarios/${user.id}`)
  return { error: null }
}

export async function setFavoriteBook(bookId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Você precisa estar logado.' }

  if (bookId) {
    // Só pode favoritar um livro que já leu
    const { data: owned } = await supabase
      .from('user_books')
      .select('book_id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .eq('status', 'read')
      .maybeSingle()
    if (!owned) return { error: 'Escolha um livro que você já leu.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ favorite_book_id: bookId })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/usuarios/${user.id}`)
  return { error: null }
}