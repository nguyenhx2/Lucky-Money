'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { TetLoading } from '@/components/TetLoading'

// Rotating creative Tết wishes
const WELCOME_WISHES = [
    'Năm Bính Ngọ, chúc bạn mã đáo thành công, vạn sự như ý! 🐎✨🌸',
    'Xuân đến rồi, hãy cùng hái lộc đầu năm nhé! 🧧🌸🍀',
    'Chúc năm mới an khang thịnh vượng, tài lộc đầy nhà! 💰🏠✨',
    'Phi ngựa về đích, ước mơ thành hiện thực! 🏇🌟🎯',
    'NTQ chúc bạn một năm tràn đầy may mắn và niềm vui! 🎊❤️✨',
    'Mong 2026 của bạn: Mã đáo thành công, phú quý vinh hoa! 🐴🌺💎',
    'Chào đón năm mới tuyệt vời! Code clean, Bug free! 💻✅🚀',
    '🔥 Chúc bạn tăng tốc như chiến mã, đổi mới không ngừng, bứt phá mọi giới hạn! 🐎🚀✨',
    'Năm Bính Ngọ, chúc bạn một năm mạnh mẽ như chiến mã, vững vàng và bứt phá! 🐎💪🌟',
    'Xuân đến rồi, chúc bạn thật nhiều sức khỏe, bình an và may mắn! 🌸💖🍀',
    'Năm mới mong mọi việc hanh thông, điều mong ước đều thành hiện thực! ✨🎯🌈',
    'Bính Ngọ rộn ràng, chúc gia đình bạn sum vầy ấm áp, tiếng cười ngập tràn! 👨‍👩‍👧‍👦🏮🌸',
    'Chúc năm mới an khang, thuận lợi và thật nhiều niềm vui nhỏ mỗi ngày! 🌼✨😊',
]

export const LoginGate: React.FC = () => {
    const [wishIdx, setWishIdx] = useState(0)
    const [fadeClass, setFadeClass] = useState('opacity-100')
    const [signingIn, setSigningIn] = useState(false)

    // Rotate wishes every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setFadeClass('opacity-0')
            setTimeout(() => {
                setWishIdx(prev => (prev + 1) % WELCOME_WISHES.length)
                setFadeClass('opacity-100')
            }, 500)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const handleSignIn = () => {
        setSigningIn(true)
        signIn('google')
    }

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
            {/* Glass card — no floating emojis */}
            <div className="relative w-full max-w-md">
                <div className="bg-gradient-to-b from-[#2a5a3a]/95 to-[#1a4028]/95 backdrop-blur-xl rounded-3xl border border-yellow-500/30 shadow-2xl shadow-red-900/30 overflow-hidden">
                    {/* Red gradient header */}
                    <div className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 px-8 pt-10 pb-8 text-center relative overflow-hidden">
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-5" />

                        <div className="relative z-10">
                            <div className="text-6xl mb-4">🧧</div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 mb-2 leading-tight font-[family-name:var(--font-dancing)] italic">
                                Hái Lộc Đầu Xuân
                            </h2>
                            <p className="text-yellow-200/60 text-sm font-medium tracking-wider">
                                Tết Bính Ngọ 2026 🐴
                            </p>
                        </div>

                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8 pt-4 text-center">
                        {signingIn ? (
                            /* Loading state while SSO redirects */
                            <div className="py-8">
                                <TetLoading text="Đang chuyển đến Google..." />
                            </div>
                        ) : (
                            <>
                                {/* Rotating wish */}
                                <div className="min-h-[80px] flex items-center justify-center mb-6 relative">
                                    {/* Quote icon */}
                                    <svg className="absolute -top-1 left-0 w-6 h-6 text-yellow-500/30" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                                    </svg>
                                    <p className={`text-yellow-100/80 text-lg sm:text-xl font-[family-name:var(--font-dancing)] font-semibold leading-relaxed transition-opacity duration-500 px-4 ${fadeClass}`}>
                                        {WELCOME_WISHES[wishIdx]}
                                    </p>
                                </div>

                                {/* Divider with ornament */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/30" />
                                    <span className="text-yellow-500/50 text-xs">✦</span>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/30" />
                                </div>

                                {/* Login prompt */}
                                <p className="text-yellow-200/50 text-sm mb-5 tracking-wide">
                                    Đăng nhập để bắt đầu hái lộc 🧧
                                </p>

                                {/* Google Sign-In Button */}
                                <button
                                    onClick={handleSignIn}
                                    className="w-full group relative bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-yellow-500/10 active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm sm:text-base">🧧 Hái lộc bằng tài khoản Google</span>
                                </button>
                            </>
                        )}

                        {/* Footer */}
                        <div className="mt-6 flex flex-col items-center gap-1.5">
                            <img src="/images/NTQ-logo-white.webp" alt="NTQ" className="h-6 opacity-50" />
                            <p className="text-yellow-200/30 text-xs">
                                From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-yellow-200/50 transition-colors">NTQ Technology</a> with ❤️
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
