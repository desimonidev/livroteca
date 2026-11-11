import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { ApproveButton } from './ApproveButton'

export async function BookTable() {
  await connection()

  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select(`
      id, title, publication_year, publisher, status, created_at,
      authors (name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
      <table className="w-full text-left text-sm text-zinc-400">
        <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
          <tr>
            <th className="px-6 py-4">Livro</th>
            <th className="px-6 py-4">Autor</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {books?.map((book: any) => (
            <tr key={book.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-white">{book.title}</div>
                <div className="text-xs">{book.publication_year || 'Ano desc.'}</div>
              </td>
              <td className="px-6 py-4">{book.authors?.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  book.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                  book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {book.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-400 hover:text-blue-300 mr-4 transition-colors">Editar</button>
                {book.status === 'pending' && (
                  <ApproveButton bookId={book.id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(!books || books.length === 0) && (
        <div className="p-8 text-center text-zinc-500">
          Nenhum livro cadastrado ainda.
        </div>
      )}
    </div>
  )
}