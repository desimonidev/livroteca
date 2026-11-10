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

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="p-8 bg-white rounded-lg shadow-md text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Bem vindo(a) à LivroTeca!</h1>
                <p className="text-gray-600">Você está logado como: <strong>{user.email}</strong></p>

                <form action={async () => {
                    'use server'
                    const supabase = await createClient()
                    await supabase.auth.signOut()
                    redirect('/login')
                }}>
                    <button className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">
                        Sair da conta
                    </button>
                </form>
            </div>
        </div>
    )
}