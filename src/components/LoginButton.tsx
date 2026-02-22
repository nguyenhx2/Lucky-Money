'use client'

import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

// SVG logout icon
const LogoutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
)

export const LoginButton: React.FC = () => {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return null
    }

    if (session?.user) {
        return (
            <>
                {/* Desktop: text + icon button (top-right) */}
                <button
                    onClick={() => signOut()}
                    className="hidden sm:flex items-center gap-2 bg-red-900/80 backdrop-blur-md hover:bg-red-800 border border-yellow-500/50 text-yellow-100 hover:text-yellow-50 font-medium px-4 py-2 rounded-full transition-all duration-300 text-sm shadow-lg"
                >
                    <LogoutIcon />
                    Đăng xuất
                </button>

                {/* Mobile: icon-only button (positioned bottom-right by parent) */}
                <button
                    onClick={() => signOut()}
                    className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-yellow-500/30 text-yellow-400 hover:bg-black/70 transition-all active:scale-95"
                    title="Đăng xuất"
                >
                    <LogoutIcon />
                </button>
            </>
        )
    }

    return (
        <button
            onClick={() => signIn('google')}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-yellow-500/30 text-yellow-200 font-medium px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#FFC107" d="M21.8,10.4h-0.5h-9v3.7h5.6c-0.5,2.5-2.7,3.7-5.6,3.7c-3.4,0-6.2-2.8-6.2-6.2s2.8-6.2,6.2-6.2c1.5,0,2.9,0.5,4,1.5l2.8-2.7C17.1,2.4,14.7,1.4,12,1.4C6.2,1.4,1.4,6.2,1.4,12s4.8,10.6,10.6,10.6c5.5,0,10.1-3.9,10.1-10.6C22.2,11.4,22,10.9,21.8,10.4z" />
                <path fill="#FF3D00" d="M3.2,7.3l3.2,2.3c0.9-2.2,3-3.7,5.5-3.7c1.5,0,2.9,0.5,4,1.5l2.8-2.7C17.1,2.4,14.7,1.4,12,1.4C8.1,1.4,4.7,3.9,3.2,7.3z" />
                <path fill="#4CAF50" d="M12,22.6c2.6,0,5-0.9,6.8-2.6l-3.1-2.5c-0.9,0.7-2.2,1.1-3.6,1.1c-2.8,0-5.1-1.9-5.9-4.5l-3.2,2.5C4.5,19.9,8,22.6,12,22.6z" />
                <path fill="#1976D2" d="M21.8,10.4h-0.5h-9v3.7h5.6c-0.3,1.2-0.9,2.2-1.9,2.9l3.1,2.5c-0.2,0.2,3.3-2.4,3.3-7.5C22.2,11.4,22,10.9,21.8,10.4z" />
            </svg>
            Đăng nhập
        </button>
    )
}
