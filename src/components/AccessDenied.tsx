'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'

const FUN_MESSAGES = [
    '🏠 Gia chủ đi chúc Tết nên đóng cửa rồi!',
    '🐴 Ngựa phi nhanh quá, bạn chưa kịp lên yên!',
    '🎋 Cây mai nhà này chưa nở cho bạn rồi~',
    '🧧 Lì xì này dành cho người có tên trong sổ thôi!',
]

/**
 * Tết-themed Access Denied page.
 * Shown when a user\'s SSO email is not in the allowed list.
 * Fun & friendly messaging instead of cold security language.
 */
export const AccessDenied: React.FC<{ email?: string }> = ({ email }) => {
    const funMsg = FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <div className="bg-gradient-to-b from-[#3D0000]/90 to-[#2D0000]/90 backdrop-blur-xl rounded-3xl border border-yellow-500/30 shadow-2xl shadow-red-900/40 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 px-8 pt-8 pb-6 text-center relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-5" />
                        <div className="relative z-10">
                            {/* Closed door icon */}
                            <div className="mx-auto w-16 h-16 mb-4 bg-red-700/50 rounded-full flex items-center justify-center border-2 border-red-500/30">
                                <span className="text-3xl">🚪</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 mb-2 font-[family-name:var(--font-dancing)] italic">
                                Ôi, Cửa Đóng Rồi!
                            </h2>
                            <p className="text-red-300/60 text-sm">
                                Bữa tiệc này chỉ dành cho khách mời thôi~
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8 pt-6 text-center">
                        {/* Fun random message */}
                        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 mb-5">
                            <p className="text-yellow-200 text-sm font-medium leading-relaxed">
                                {funMsg}
                            </p>
                        </div>

                        {email && (
                            <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/15 mb-5">
                                <p className="text-yellow-200/40 text-[10px] mb-1">Bạn đang đăng nhập với</p>
                                <p className="text-yellow-200 text-sm font-medium">{email}</p>
                            </div>
                        )}

                        <p className="text-yellow-100/50 text-sm leading-relaxed mb-6">
                            Tài khoản của bạn chưa có tên trong danh sách khách mời.
                            Hãy nhờ gia chủ thêm vào nhé! 🌸
                        </p>

                        {/* Sign out button */}
                        <button
                            onClick={() => signOut()}
                            className="w-full py-3 bg-red-800/60 hover:bg-red-700/60 text-yellow-200 font-medium rounded-xl transition-all border border-yellow-500/20 hover:border-yellow-500/30"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                Đăng xuất & thử tài khoản khác
                            </span>
                        </button>

                        <div className="mt-5 flex flex-col items-center gap-1.5">
                            <img src="/images/NTQ-logo-white.webp" alt="NTQ" className="h-5 opacity-30" />
                            <p className="text-yellow-200/25 text-xs">
                                From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-yellow-200/40 transition-colors">NTQ Technology</a> with ❤️
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
