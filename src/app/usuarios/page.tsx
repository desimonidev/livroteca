import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'

async function UserGrid() {
    await connection()
    const supabase = await createClient()

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })

    if (!profiles || profiles.length === 0) {
        return <div className="text-zinc-500">Nenhum usuário encontrado.</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => (
                <Link
                    key={profile.id}
                    href={`/usuarios/${profile.id}`}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-zinc-700 transition-colors group"
                >
                    <div className="w-20 h-20 rounded-full bg-zinc-800 mb-4 overflow-hidden border-2 border-zinc-700 group-hover:border-blue-500 transition-colors">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || 'Usuário'} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-500">
                                U
                            </div>
                        )}
                    </div>
                    <h3 className="font-bold text-white text-lg">{profile.full_name || 'Leitor Anônimo'}</h3>
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{profile.bio || 'Sem descrição.'}</p>
                </Link>
            ))}
        </div>
    )

}

export default function Usuarios() {
    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Comunidade</h1>
                <p className="text-zinc-400">Conheça outros leitores e veja o que eles estão lendo.</p>
            </div>

            <Suspense fallback={<div className="animate-pulse text-zinc-500">Carregando leitores...</div>}>
                <UserGrid />
            </Suspense>
        </div>
    )
}