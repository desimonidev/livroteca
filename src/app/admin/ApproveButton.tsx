'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ApproveButton({ bookId }: { bookId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleApprove = async () => {
        setLoading(true)

        const { error } = await supabase
            .from('books')
            .update({ status: 'approved' })
            .eq('id', bookId)

        if (error) {
            alert("Erro ao aprovar o livro: " + error.message)
            setLoading(false)
        } else {
            router.refresh()
        }
    }

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="text-green-400 hover:text-green-300 transition-colors font-medium disabled:opacity-50"
        >
            {loading ? 'Aprovando...' : 'Aprovar'}
        </button>
    )
}