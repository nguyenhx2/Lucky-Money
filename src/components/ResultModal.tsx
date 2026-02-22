'use client'

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { formatCurrency, THIEP_IMAGES } from '@/lib/distribute'
import { ZoomableImage } from '@/components/ZoomableImage'

interface ResultModalProps {
    amount: number
    imageUrl?: string | null
    wish?: string | null
    thiepUrl?: string | null
    // Bonus round props
    hasBonusRound?: boolean
    isClaimingBonus?: boolean
    onBonusClaim?: () => void
    isBonus?: boolean
    // Retry props — retry = re-roll (replaces current pick)
    hasRetryAvailable?: boolean
    onRetryUse?: () => void
    onRetrySkip?: () => void
    onClose: () => void
}

export const ResultModal: React.FC<ResultModalProps> = ({
    amount, imageUrl, wish,
    thiepUrl: thiepUrlProp,
    hasBonusRound = false,
    isClaimingBonus = false,
    onBonusClaim,
    isBonus = false,
    hasRetryAvailable = false,
    onRetryUse,
    onRetrySkip,
    onClose,
}) => {
    const [showAmount, setShowAmount] = useState(false)
    const [showBonusInvite, setShowBonusInvite] = useState(false)
    const [retryDecided, setRetryDecided] = useState(false)
    const [canScrollDown, setCanScrollDown] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 20
        setCanScrollDown(hasMore)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        checkScroll()
        el.addEventListener('scroll', checkScroll, { passive: true })
        // Recheck after content changes (bonus/retry sections appear)
        const resizeObs = new ResizeObserver(checkScroll)
        resizeObs.observe(el)
        return () => {
            el.removeEventListener('scroll', checkScroll)
            resizeObs.disconnect()
        }
    }, [checkScroll, showAmount, showBonusInvite, retryDecided])

    const thiepUrl = useMemo(
        () => thiepUrlProp || THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)],
        [thiepUrlProp]
    )

    useEffect(() => {
        const timer = setTimeout(() => setShowAmount(true), 600)

        // Enhanced confetti for bonus
        const colors = isBonus
            ? ['#A855F7', '#F1C40F', '#D4AF37', '#8B5CF6', '#EC4899']
            : ['#D91E18', '#F1C40F', '#D4AF37', '#FF6B6B']

        const end = Date.now() + (isBonus ? 5000 : 3000)
        const frame = () => {
            confetti({
                particleCount: isBonus ? 8 : 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
            })
            confetti({
                particleCount: isBonus ? 8 : 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
            })
            if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()

        // Show bonus invite after amount reveal
        if (hasBonusRound) {
            const bonusTimer = setTimeout(() => setShowBonusInvite(true), 1800)
            return () => { clearTimeout(timer); clearTimeout(bonusTimer) }
        }

        return () => clearTimeout(timer)
    }, [isBonus, hasBonusRound])

    // Gradient based on type
    const bgGradient = isBonus
        ? 'from-purple-700 via-purple-800 to-indigo-900'
        : 'from-red-700 via-red-800 to-red-900'

    const borderColor = isBonus
        ? 'border-purple-400/80'
        : 'border-yellow-500/80'

    const amountColor = isBonus
        ? 'text-purple-200'
        : 'text-yellow-300'

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Rotating sunburst glow behind the modal */}
                <div className="sunburst-rotate" />
                <motion.div
                    ref={scrollRef}
                    className={`relative w-full max-w-sm rounded-2xl border-4 ${borderColor} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
                    initial={isBonus ? { scale: 0.1, rotateY: 360, opacity: 0 } : { scale: 0.3, y: 100, rotateY: 180 }}
                    animate={{ scale: 1, y: 0, rotateY: 0, opacity: 1 }}
                    exit={{ scale: 0.3, y: 100 }}
                    transition={isBonus
                        ? { type: 'spring', damping: 12, stiffness: 80, duration: 1 }
                        : { type: 'spring', damping: 15, stiffness: 100 }
                    }
                >
                    {/* Background */}
                    <div className={`bg-gradient-to-b ${bgGradient} p-6 sm:p-8 flex flex-col items-center text-center`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10" />

                        <div className="relative z-10 w-full">
                            {/* Bonus badge */}
                            {isBonus && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.3 }}
                                    className="mb-3"
                                >
                                    <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        🎰 LỘC THÊM 🎰
                                    </span>
                                </motion.div>
                            )}

                            {/* Lì xì image */}
                            {imageUrl && (
                                <motion.div
                                    className="mx-auto mb-4"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                >
                                    <ZoomableImage
                                        src={imageUrl}
                                        alt="Bao lì xì"
                                        wrapperClassName="inline-block rounded-lg overflow-hidden shadow-xl border-2 border-yellow-500/50"
                                        className="w-24 sm:w-28 h-auto object-contain"
                                    />
                                </motion.div>
                            )}

                            <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-2 text-shadow-gold whitespace-nowrap">
                                {isBonus ? '🎰 Lộc Thêm Bí Mật! 🎰' : '🎊 Chúc Mừng! 🎊'}
                            </h2>
                            <p className="text-sm sm:text-base text-white/90 mb-3 whitespace-nowrap">
                                {isBonus ? 'Bạn đã trúng phần lộc thêm đặc biệt!' : 'Bạn đã nhận được lộc đầu xuân'}
                            </p>

                            {showAmount && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                    className={`${isBonus ? 'bg-purple-500/20' : 'bg-white/10'} backdrop-blur-sm rounded-xl p-5 border ${isBonus ? 'border-purple-400/40' : 'border-yellow-400/40'} mb-4`}
                                >
                                    <span className={`text-3xl sm:text-4xl font-extrabold ${amountColor} drop-shadow-md`}>
                                        {formatCurrency(amount)}
                                    </span>
                                </motion.div>
                            )}

                            {/* Lời chúc Tết */}
                            {showAmount && wish && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/20 mb-4"
                                >
                                    <p className="text-yellow-100 text-base sm:text-lg leading-relaxed font-[family-name:var(--font-dancing)] font-semibold">
                                        &ldquo;{wish}&rdquo;
                                    </p>
                                </motion.div>
                            )}

                            {/* Thiệp chúc Tết */}
                            {showAmount && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-4"
                                >
                                    <ZoomableImage
                                        src={thiepUrl}
                                        alt="Thiệp chúc Tết"
                                        wrapperClassName="rounded-xl overflow-hidden shadow-lg border-2 border-yellow-500/30"
                                        className="w-full h-auto"
                                    />
                                </motion.div>
                            )}

                            {/* Retry Choice — retry = re-roll (replace current pick) */}
                            {showAmount && hasRetryAvailable && !isBonus && !retryDecided && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, delay: 1.2 }}
                                    className="mb-4 p-4 bg-gradient-to-r from-amber-600/30 to-orange-600/30 rounded-xl border border-amber-400/40"
                                >
                                    <motion.p
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="text-amber-200 text-lg font-bold mb-2 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                                        Bạn có lượt thử lại!
                                    </motion.p>
                                    <p className="text-white/70 text-sm mb-3">
                                        Bốc lại bao khác thay thế, hoặc giữ nguyên lộc này.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onRetryUse}
                                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all duration-300 shadow-lg active:scale-95 whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                                            Thử lại
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRetryDecided(true)
                                                onRetrySkip?.()
                                                if (hasBonusRound) {
                                                    setTimeout(() => setShowBonusInvite(true), 400)
                                                }
                                            }}
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-yellow-200 font-bold py-2 px-3 rounded-xl text-sm transition-all duration-300 border border-yellow-500/20 active:scale-95 whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg> Nhận luôn
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Bonus Round Invitation — only after retry is resolved */}
                            {showBonusInvite && hasBonusRound && (!hasRetryAvailable || retryDecided) && !isBonus && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    className="mb-4 p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/40"
                                >
                                    <p className="text-purple-200 text-base font-bold mb-2 flex items-center justify-center gap-2 whitespace-nowrap">
                                        🎁 Bạn có thể nhận thêm lộc! 🎁
                                    </p>
                                    <p className="text-white/70 text-sm mb-3 whitespace-nowrap">
                                        Bốc thêm một bao lì xì đặc biệt nữa nhé!
                                    </p>
                                    <button
                                        onClick={onBonusClaim}
                                        disabled={isClaimingBonus}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isClaimingBonus ? '⏳ Đang mở...' : (<><svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg> Mở Lộc Thêm!</>)}
                                    </button>
                                </motion.div>
                            )}

                            <div className="flex flex-col items-center gap-1.5 mb-4">
                                <img src="/images/NTQ-logo-white.webp" alt="NTQ" className="h-5 opacity-50" />
                                <p className="text-yellow-200/50 text-xs">
                                    From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-yellow-200/70 transition-colors">NTQ Technology</a> with ❤️
                                </p>
                            </div>

                            {/* Hide close button while retry choice is pending */}
                            {(!hasRetryAvailable || retryDecided || isBonus) && (
                                <button
                                    onClick={onClose}
                                    className={`w-full ${isBonus ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-red-900'} font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg active:scale-95 animate-nhan-loc-pulse`}
                                >
                                    {isBonus ? '🎉 Tuyệt Vời! 🎉' : '✨ Nhận Lộc ✨'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <AnimatePresence>
                    {canScrollDown && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
                        >
                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                className="flex flex-col items-center gap-1 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30 shadow-lg"
                            >
                                <span className="text-yellow-300 text-xs font-medium">↓ Kéo xuống xem thêm</span>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}
