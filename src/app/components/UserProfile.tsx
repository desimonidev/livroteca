import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

export async function UserProfile() {
    await connection()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Pega a primeira letra do email para o avatar
    const initial = user.email?.charAt(0).toUpperCase()

    return (
        <div className="flex items-center gap-4">
            {/* Info do Usuário (Oculto no celular para não quebrar o layout) */}
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-zinc-300">{user.email}</span>
                <span className="text-xs text-zinc-500">Leitor</span>
            </div>

            {/* Avatar Gerado */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                {initial}
            </div>

            {/* Botão de Sair Minimalista */}
            <form action={async () => {
                'use server'
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect('/login')
            }}>
                <button 
                    className="text-sm text-zinc-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                    title="Sair da conta"
                >
                    Sair
                </button>
            </form>
        </div>
    )
}