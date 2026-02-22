'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnvelopeCard } from '@/components/EnvelopeCard'
import { TetLoading } from '@/components/TetLoading'

interface EnvelopeGridProps {
    gameSession: any
    availableEnvelopes: any[]
    loading: boolean
    onEnvelopeClick: (envelope: any) => void
}

/* Decorative images placed between bamboo rows */
const DECORATIONS = [
    '/images/plum-flower.webp',
    '/images/new-year-greeting.webp',
    '/images/fireworks-2.webp',
]

const DecorationRow = memo(function DecorationRow({ index }: { index: number }) {
    const img = DECORATIONS[index % DECORATIONS.length]
    return (
        <div className="flex justify-center py-1 pointer-events-none select-none">
            <img
                src={img}
                alt=""
                className="h-10 sm:h-14 w-auto opacity-50 drop-shadow-lg"
                loading="lazy"
                decoding="async"
                draggable={false}
            />
        </div>
    )
})

/**
 * EnvelopeGrid — responsive vertical-scroll grid for lì xì envelopes
 * Arranges envelopes on bamboo poles, horizontal-priority (fill width first).
 * Inserts decorative Tết images between some bamboo rows.
 * Shows a floating "scroll down" indicator when content overflows.
 */
export const EnvelopeGrid = memo(function EnvelopeGrid({ gameSession, availableEnvelopes, loading, onEnvelopeClick }: EnvelopeGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showScrollHint, setShowScrollHint] = useState(false)

    // Detect if content overflows → show scroll-down bubble
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        const check = () => {
            const hasOverflow = el.scrollHeight > el.clientHeight + 20
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
            setShowScrollHint(hasOverflow && !nearBottom)
        }
        check()
        el.addEventListener('scroll', check, { passive: true })
        window.addEventListener('resize', check)
        return () => {
            el.removeEventListener('scroll', check)
            window.removeEventListener('resize', check)
        }
    }, [availableEnvelopes.length])

    if (gameSession) {
        const envelopes = availableEnvelopes
        const perRow = Math.min(14, Math.max(6, envelopes.length))
        const rowCount = Math.ceil(envelopes.length / perRow)
        const bambooRows = Array.from({ length: rowCount }, (_, i) =>
            envelopes.slice(i * perRow, (i + 1) * perRow)
        ).filter(row => row.length > 0)

        const renderRows: React.ReactNode[] = []
        let decoIdx = 0
        bambooRows.forEach((row, rowIdx) => {
            // Decorative image between every 3 bamboo rows
            if (rowIdx > 0 && rowIdx % 3 === 0) {
                renderRows.push(<DecorationRow key={`deco-${rowIdx}`} index={decoIdx++} />)
            }
            renderRows.push(
                <div key={`bamboo-${rowIdx}`} className="relative">
                    <div className="bamboo-pole w-full h-1.5 sm:h-2 md:h-3 rounded-full relative z-10" />
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 relative z-[9]">
                        {row.map((env: any, envIdx: number) => (
                            <EnvelopeCard
                                key={env.id}
                                data={env}
                                onClick={onEnvelopeClick}
                                stringLength={12 + (envIdx % 3) * 8}
                            />
                        ))}
                    </div>
                </div>
            )
        })

        const opened = gameSession.quantity - envelopes.length
        const total = gameSession.quantity
        const pct = total > 0 ? Math.round((opened / total) * 100) : 0

        // ── All envelopes claimed → decorative bamboo with flowers & ghost envelopes ──
        if (envelopes.length === 0 && total > 0) {
            const DECO_ITEMS = ['🌸', 'ghost', '🏵️', 'ghost', '🌺', 'ghost', '🌸', 'ghost']
            return (
                <div className="relative z-10 flex flex-col pt-2 sm:pt-4 px-1 sm:px-3 md:px-4">
                    {/* Decorative bamboo row */}
                    <div className="relative">
                        <div className="bamboo-pole w-full h-1.5 sm:h-2 md:h-3 rounded-full relative z-10" />
                        <div className="flex justify-center gap-3 sm:gap-5 md:gap-6 relative z-[9] py-2">
                            {DECO_ITEMS.map((item, i) => (
                                item === 'ghost' ? (
                                    <div key={i} className="envelope-hang opacity-20 grayscale pointer-events-none select-none" style={{ '--sway-duration': `${3.5 + i * 0.3}s` } as React.CSSProperties}>
                                        <div className="envelope-string h-3 sm:h-4 mx-auto" />
                                        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-red-700/60 to-red-900/60 rounded-md border border-yellow-500/20 flex items-center justify-center">
                                            <span className="text-yellow-500/30 text-xs">🧧</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={i} className="flex flex-col items-center select-none floating-lixi" style={{ '--float-duration': `${4 + i * 0.5}s`, '--float-delay': `${i * 0.3}s` } as React.CSSProperties}>
                                        <div className="envelope-string h-3 sm:h-4 mx-auto" />
                                        <span className="text-xl sm:text-2xl drop-shadow-lg">{item}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Completed message */}
                    <div className="text-center py-6">
                        <p className="text-yellow-300/80 text-lg font-medium">🎊 Hết lộc rồi! 🎊</p>
                        <p className="text-yellow-200/40 text-sm mt-1">Tất cả hồng bao đã được nhận</p>
                    </div>

                    {/* Stats Counter */}
                    <div className="flex justify-center pb-6">
                        <div className="relative bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 backdrop-blur-xl rounded-2xl px-5 sm:px-8 py-3 sm:py-4 border border-yellow-500/30 shadow-2xl shadow-red-900/30 min-w-[220px] sm:min-w-[280px]">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-2xl" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/50 rounded-br-2xl" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-lg sm:text-xl">🧧</span>
                                    <span className="text-yellow-300 font-bold text-sm sm:text-base tracking-wide">Hồng Bao</span>
                                    <span className="text-lg sm:text-xl">🧧</span>
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-yellow-400 font-extrabold text-2xl sm:text-3xl tabular-nums">0</span>
                                    <span className="text-yellow-200/40 text-sm">/</span>
                                    <span className="text-yellow-200/60 font-semibold text-base sm:text-lg">{total}</span>
                                    <span className="text-yellow-200/40 text-xs ml-1">còn lại</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-yellow-200/30 text-[10px] mt-1">100% đã được nhận</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="relative z-10 flex flex-col pt-2 sm:pt-4">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-x-hidden px-1 sm:px-3 md:px-4 space-y-2 sm:space-y-3 md:space-y-4 pb-8 envelope-scroll"
                >
                    {renderRows}

                    {/* Premium Stats Counter */}
                    <div className="flex justify-center pt-4 pb-6">
                        <div className="relative bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 backdrop-blur-xl rounded-2xl px-5 sm:px-8 py-3 sm:py-4 border border-yellow-500/30 shadow-2xl shadow-red-900/30 min-w-[220px] sm:min-w-[280px]">
                            {/* Gold corner accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-2xl" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/50 rounded-br-2xl" />

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-lg sm:text-xl">🧧</span>
                                    <span className="text-yellow-300 font-bold text-sm sm:text-base tracking-wide">Hồng Bao</span>
                                    <span className="text-lg sm:text-xl">🧧</span>
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-yellow-400 font-extrabold text-2xl sm:text-3xl tabular-nums">{envelopes.length}</span>
                                    <span className="text-yellow-200/40 text-sm">/</span>
                                    <span className="text-yellow-200/60 font-semibold text-base sm:text-lg">{total}</span>
                                    <span className="text-yellow-200/40 text-xs ml-1">còn lại</span>
                                </div>
                                {/* Mini progress bar */}
                                <div className="mt-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-yellow-200/30 text-[10px] mt-1">{pct}% đã được nhận</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating scroll-down indicator */}
                <AnimatePresence>
                    {showScrollHint && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
                        >
                            <motion.button
                                onClick={() => scrollRef.current?.scrollBy({ top: 300, behavior: 'smooth' })}
                                animate={{ y: [0, 6, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                className="bg-yellow-500/90 text-red-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-yellow-500/30 backdrop-blur-sm border border-yellow-400/50 flex items-center gap-1.5"
                            >
                                <span>🧧</span>
                                <span>Cuộn xuống — còn hồng bao!</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
                <TetLoading text="Đang chuẩn bị phiên hái lộc..." />
            </div>
        )
    }

    return (
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
            <div className="text-center bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20 max-w-sm mx-4">
                <div className="text-5xl mb-4">🎋</div>
                <p className="text-yellow-200 text-xl font-medium mb-2">
                    Đang chờ phiên hái lộc...
                </p>
                <p className="text-yellow-100/50 text-sm">
                    Chủ trò hãy nhấn <kbd className="bg-gray-700 px-2 py-0.5 rounded text-xs">Ctrl</kbd> + <kbd className="bg-gray-700 px-2 py-0.5 rounded text-xs">Shift</kbd> + <kbd className="bg-gray-700 px-2 py-0.5 rounded text-xs">G</kbd> để thiết lập
                </p>
            </div>
        </div>
    )
})
