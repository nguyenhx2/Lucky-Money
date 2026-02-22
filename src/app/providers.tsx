'use client'

import { SessionProvider } from 'next-auth/react'
import { TetToastProvider } from '@/components/TetToast'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <TetToastProvider>{children}</TetToastProvider>
        </SessionProvider>
    )
}
