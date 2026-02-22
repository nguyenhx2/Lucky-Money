'use client'

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import { formatCurrency, THIEP_IMAGES } from '@/lib/distribute'

interface PickData {
    amount: number
    imageUrl?: string | null
    claimedAt?: string | null
    wish?: string | null
    thiepUrl?: string | null
}

interface BonusData {
    amount: number
    imageUrl?: string | null
    wish?: string | null
    thiepUrl?: string | null
}

interface AlreadyPickedProps {
    picks: PickData[]
    bonus?: BonusData | null
    hasPendingBonus?: boolean
    onBonusClaim?: () => void
    isClaimingBonus?: boolean
}

/** Click-to-expand thiệp viewer — uses portal to escape overflow clipping */
const ThiepZoom: React.FC<{ thiepUrl: string }> = ({ thiepUrl }) => {
    const [zoomed, setZoomed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl overflow-hidden shadow-lg border-2 border-yellow-400/50 mb-3 cursor-pointer"
                onClick={() => setZoomed(true)}
                whileTap={{ scale: 0.97 }}
            >
                <img src={thiepUrl} alt="Thiệp chúc Tết" className="w-full aspect-[7/5] object-cover" draggable={false} />
                <div className="bg-red-900/60 text-yellow-200/70 text-[10px] py-1.5 text-center">
                    👆 Nhấn để xem rõ hơn
                </div>
            </motion.div>
            {mounted && createPortal(
                <AnimatePresence>
                    {zoomed && (
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-zoom-out p-4"
                            style={{ zIndex: 99999 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setZoomed(false)}
                        >
                            <motion.img
                                src={thiepUrl}
                                alt="Thiệp chúc Tết"
                                className="max-w-[95vw] max-h-[85vh] rounded-2xl shadow-2xl border-2 border-yellow-400/60"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                draggable={false}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

/** 3D flip card — vertical axis rotation between front (Lượt 1) and back (Bonus) */
const FlipCard: React.FC<{
    firstDraw: PickData
    bonusDraw: BonusData
    flipped: boolean
    onFlip: (side: boolean) => void
}> = ({ firstDraw, bonusDraw, flipped, onFlip }) => {
    // Auto-flip every 10 seconds
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

    React.useEffect(() => {
        timerRef.current = setInterval(() => {
            onFlip(!flipped) // toggles; parent controls truth
        }, 10000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [flipped, onFlip])

    // Manual click resets auto-flip timer
    const handleManualFlip = (side: boolean) => {
        if (timerRef.current) clearInterval(timerRef.current)
        onFlip(side)
        timerRef.current = setInterval(() => {
            onFlip(!side)
        }, 10000)
    }

    return (
        <div className="mb-4">
            {/* Flip toggle */}
            <div className="flex gap-2 mb-3 justify-center">
                <button
                    onClick={() => handleManualFlip(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!flipped ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40' : 'bg-white/5 text-yellow-200/40 border border-transparent'}`}
                >
                    <span className="inline-flex items-center gap-1.5"><IconTreeBranch /> Lượt 1</span>
                </button>
                <button
                    onClick={() => handleManualFlip(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${flipped ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40' : 'bg-white/5 text-purple-200/40 border border-transparent'}`}
                >
                    <span className="inline-flex items-center gap-1.5"><IconSlotMachine /> Lộc thêm</span>
                </button>
            </div>

            {/* Cross-fade container — fixed height avoids layout jank */}
            <div
                className="relative w-full cursor-pointer"
                onClick={() => onFlip(!flipped)}
            >
                {/* First draw — always mounted */}
                <motion.div
                    className="w-full"
                    animate={{ opacity: flipped ? 0 : 1 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ pointerEvents: flipped ? 'none' : 'auto' }}
                >
                    <DrawCard
                        label="Lượt 1"
                        labelIcon={<IconTreeBranch />}
                        amount={firstDraw.amount}
                        wish={firstDraw.wish}
                        imageUrl={firstDraw.imageUrl}
                        theme="gold"
                    />
                </motion.div>

                {/* Bonus draw — absolutely positioned on top, cross-fades in */}
                <motion.div
                    className="absolute inset-0 w-full"
                    animate={{ opacity: flipped ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ pointerEvents: flipped ? 'auto' : 'none' }}
                >
                    <DrawCard
                        label="Lộc thêm"
                        labelIcon={<IconSlotMachine />}
                        amount={bonusDraw.amount}
                        wish={bonusDraw.wish}
                        imageUrl={bonusDraw.imageUrl}
                        theme="purple"
                    />
                </motion.div>
            </div>
        </div>
    )
}

/** Individual draw card (used for both sides of the flip) */
const DrawCard: React.FC<{
    label: string
    labelIcon: React.ReactNode
    amount: number
    wish?: string | null
    imageUrl?: string | null
    theme: 'gold' | 'purple'
}> = ({ label, labelIcon, amount, wish, imageUrl, theme }) => {
    const isGold = theme === 'gold'

    return (
        <div className={`rounded-xl p-4 border ${isGold ? 'border-yellow-400/30 bg-yellow-500/5' : 'border-purple-400/30 bg-purple-500/10'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isGold ? 'text-yellow-200/60' : 'text-purple-300/70'}`}>
                    {labelIcon} {label}
                </span>
                {imageUrl && (
                    <div className={`w-8 h-10 rounded overflow-hidden border ${isGold ? 'border-yellow-500/30' : 'border-purple-500/30'}`}>
                        <img src={imageUrl} alt="Lì xì" className="w-full h-full object-contain" />
                    </div>
                )}
            </div>
            <span className={`text-2xl font-extrabold ${isGold ? 'text-yellow-300' : 'text-purple-300'}`}>
                {formatCurrency(amount)}
            </span>
            {wish && (
                <p className={`text-sm mt-2 italic ${isGold ? 'text-yellow-100/50' : 'text-purple-200/50'} font-[family-name:var(--font-dancing)]`}>
                    &ldquo;{wish}&rdquo;
                </p>
            )}
        </div>
    )
}

// ─── Inline SVG icons ───
const IconTreeBranch = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
)
const IconSlotMachine = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
)

export const AlreadyPicked = React.memo(function AlreadyPicked({ picks, bonus, hasPendingBonus = false, onBonusClaim, isClaimingBonus = false }: AlreadyPickedProps) {
    if (picks.length === 0) return null

    const firstPick = picks[0]
    const hasBonusDraw = bonus && bonus.amount > 0
    const totalAmount = picks.reduce((s, p) => s + p.amount, 0) + (hasBonusDraw ? bonus.amount : 0)

    // Use persisted thiệp from DB, or fall back to random
    const thiepUrl = useMemo(
        () => firstPick.thiepUrl || THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)],
        [firstPick.thiepUrl]
    )
    const bonusThiepUrl = useMemo(
        () => {
            // Bonus thiệp must differ from first draw's thiệp
            if (bonus?.thiepUrl) return bonus.thiepUrl
            const candidates = THIEP_IMAGES.filter(t => t !== (firstPick.thiepUrl || thiepUrl))
            return candidates.length > 0
                ? candidates[Math.floor(Math.random() * candidates.length)]
                : THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)]
        },
        [bonus?.thiepUrl, firstPick.thiepUrl, thiepUrl]
    )

    // Flipped state — shared between FlipCard, wish, and thiệp
    const [flipped, setFlipped] = useState(false)

    // Derive wish/thiệp display from flipped state (0 = first, 1 = bonus)
    const wishCycleIdx = flipped ? 1 : 0
    const wishes = useMemo(() => {
        const list: { text: string; label: string }[] = []
        if (firstPick.wish) list.push({ text: firstPick.wish, label: '🌸 Lời chúc dành riêng cho bạn' })
        if (hasBonusDraw && bonus?.wish) list.push({ text: bonus.wish, label: '🎁 Lời chúc Lộc thêm' })
        return list
    }, [firstPick.wish, hasBonusDraw, bonus?.wish])

    const thieps = useMemo(() => {
        const list = [thiepUrl]
        if (hasBonusDraw) list.push(bonusThiepUrl)
        return list
    }, [thiepUrl, bonusThiepUrl, hasBonusDraw])

    const handleFlip = React.useCallback((side: boolean) => setFlipped(side), [])

    const currentWish = wishes.length > 0 ? wishes[wishCycleIdx % wishes.length] : null
    const currentThiep = thieps[wishCycleIdx % thieps.length]

    const innerCardRef = useRef<HTMLDivElement>(null) // refs the styled card (not the wrapper)
    const [capturing, setCapturing] = useState(false)

    const captureCard = useCallback(async (): Promise<string | null> => {
        const el = innerCardRef.current
        if (!el) return null
        setCapturing(true)

        // Hide action buttons during capture
        const hidden = el.querySelectorAll<HTMLElement>('[data-capture-hide]')
        hidden.forEach(h => { h.style.visibility = 'hidden' })

        // Temporarily clear ancestor overflow so the element isn't clipped
        const ancestors: Array<{ node: HTMLElement; ov: string }> = []
        let node = el.parentElement
        while (node && node !== document.body) {
            const cs = getComputedStyle(node)
            if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
                ancestors.push({ node, ov: node.style.overflow })
                node.style.overflow = 'visible'
            }
            node = node.parentElement
        }

        try {
            // Step 1: capture live element (images are loaded, no sizing collapse issues)
            // Must pass explicit width/height otherwise toPng uses clientHeight (viewport-constrained)
            const raw = await toPng(el, {
                pixelRatio: 2,
                cacheBust: true,
                width: el.offsetWidth,
                height: el.scrollHeight,
                style: {
                    height: `${el.scrollHeight}px`,
                    overflow: 'visible',
                },
            })

            // Step 2: composite onto a bigger canvas with equal padding on all 4 sides
            const img = new Image()
            img.src = raw
            await new Promise<void>(resolve => { img.onload = () => resolve() })

            const pad = 56 // physical px = 28 css px at pixelRatio:2 — enough breathing room on all sides
            const canvas = document.createElement('canvas')
            canvas.width = img.width + pad * 2
            canvas.height = img.height + pad * 2
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = '#700808' // match card dark-red gradient tone
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, pad, pad)

            return canvas.toDataURL('image/png')
        } catch {
            return null
        } finally {
            ancestors.forEach(({ node, ov }) => { node.style.overflow = ov })
            hidden.forEach(h => { h.style.visibility = '' })
            setCapturing(false)
        }
    }, [])

    const handleDownload = useCallback(async () => {
        const dataUrl = await captureCard()
        if (!dataUrl) return
        const link = document.createElement('a')
        link.download = `loc-tet-${Date.now()}.png`
        link.href = dataUrl
        link.click()
    }, [captureCard])

    const handleCopy = useCallback(async () => {
        const dataUrl = await captureCard()
        if (!dataUrl) return
        try {
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch {
            // fallback: download if clipboard fails
            handleDownload()
        }
    }, [captureCard, handleDownload])

    const [copySuccess, setCopySuccess] = useState(false)

    return (
        <motion.div
            className="absolute inset-0 z-[15] flex items-start justify-center p-4 pt-28 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Capture wrapper — visual layout only, capture uses body clone */}
            <div
                style={{ width: '100%', maxWidth: '28rem', margin: '0 1rem' }}
            >
                <div
                    ref={innerCardRef}
                    className="relative text-center backdrop-blur-md rounded-3xl p-5 sm:p-6 w-full shadow-2xl"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(139,0,0,0.92), rgba(120,10,10,0.90), rgba(100,15,5,0.92))',
                        border: '2px solid rgba(255,200,50,0.5)',
                        boxShadow: '0 0 20px rgba(255,200,50,0.2), 0 0 40px rgba(200,50,0,0.15), inset 0 1px 0 rgba(255,200,50,0.3)',
                    }}
                >
                    {/* Download / Copy buttons — top right */}
                    <div data-capture-hide className="absolute top-3 right-3 flex gap-1.5 z-10">
                        <button
                            onClick={handleDownload}
                            disabled={capturing}
                            title="Tải ảnh"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-yellow-400/20 text-yellow-200/70 hover:text-yellow-200 transition-all duration-200 active:scale-90 disabled:opacity-40"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={capturing}
                            title={copySuccess ? 'Đã copy!' : 'Copy ảnh'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200 active:scale-90 disabled:opacity-40 ${copySuccess
                                ? 'bg-green-500/20 border-green-400/40 text-green-300'
                                : 'bg-white/10 hover:bg-white/20 border-yellow-400/20 text-yellow-200/70 hover:text-yellow-200'
                                }`}
                        >
                            {copySuccess ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                            )}
                        </button>
                    </div>
                    {/* Lì xì envelope image */}
                    {firstPick.imageUrl && (
                        <motion.div
                            className="mx-auto mb-3 w-14 h-20 rounded-lg overflow-hidden shadow-lg border-2 border-yellow-500/40 bg-gradient-to-b from-red-600 to-red-800"
                            animate={{ rotate: [0, 3, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        >
                            <img src={firstPick.imageUrl} alt="Lì xì" className="w-full h-full object-contain" />
                        </motion.div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-1">
                        Bạn Đã Nhận Lộc! 🧧
                    </h2>
                    <p className="text-yellow-100/70 text-xs mb-3">
                        Chúc bạn năm mới an khang thịnh vượng
                    </p>

                    {/* Pending Bonus CTA */}
                    {hasPendingBonus && onBonusClaim && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="mb-4 p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/40"
                        >
                            <motion.p
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-purple-200 text-lg font-bold mb-2 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>
                                May mắn vẫn còn!
                            </motion.p>
                            <p className="text-white/70 text-sm mb-3">
                                Bạn có 1 cơ hội nhận thêm lộc chưa dùng. Mở thêm bao lì xì đặc biệt nhé!
                            </p>
                            <button
                                onClick={onBonusClaim}
                                disabled={isClaimingBonus}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-purple-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isClaimingBonus ? '⏳ Đang mở...' : (<><svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg> Mở Lộc Thêm!</>)}
                            </button>
                        </motion.div>
                    )}

                    {/* ── 3D Flip Card for dual draw ── */}
                    {hasBonusDraw ? (
                        <FlipCard firstDraw={firstPick} bonusDraw={bonus} flipped={flipped} onFlip={handleFlip} />
                    ) : (
                        /* Standard single/multi pick display */
                        <div className="space-y-2 mb-3">
                            {picks.map((pick, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white/10 rounded-xl p-3 border border-yellow-400/20"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-yellow-200/50 text-xs inline-flex items-center gap-1.5">
                                            {i === 0 ? <><IconTreeBranch /> Lộc đã nhận</> : <><IconSlotMachine /> Retry #{i}</>}
                                        </span>
                                        {pick.claimedAt && (
                                            <span className="text-yellow-200/30 text-[10px]">
                                                {new Date(pick.claimedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-3xl font-extrabold text-yellow-300">
                                        {formatCurrency(pick.amount)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Total if multiple draws */}
                    {(picks.length > 1 || hasBonusDraw) && (
                        <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-400/30 mb-3">
                            <p className="text-yellow-200/50 text-xs mb-1">Tổng lộc nhận được</p>
                            <span className="text-xl font-extrabold text-yellow-300">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    )}

                    {/* Lời chúc Tết — cross-fade between draws (always mounted to avoid layout jank) */}
                    {wishes.length > 0 && (
                        <div className="relative mb-3">
                            {wishes.map((wish, idx) => {
                                const isActive = idx === (wishCycleIdx % wishes.length)
                                return (
                                    <motion.div
                                        key={wish.label}
                                        className={idx === 0 ? 'w-full' : 'absolute inset-0 w-full'}
                                        animate={{ opacity: isActive ? 1 : 0 }}
                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                                    >
                                        <div className="bg-gradient-to-br from-red-950/50 to-red-900/40 rounded-xl px-3 py-2 border border-yellow-500/20 relative">
                                            <svg className="absolute top-2 left-2 w-5 h-5 text-yellow-500/25" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                                            </svg>
                                            <p className="text-yellow-100 text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-dancing)] font-semibold pl-6">
                                                {wish.text}
                                            </p>
                                            <p className="text-yellow-200/30 text-[10px] mt-2">{wish.label}</p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {/* Thiệp chúc Tết — cross-fade between draws (always mounted to keep images loaded) */}
                    <div className="relative">
                        {thieps.map((thiep, idx) => {
                            const isActive = idx === (wishCycleIdx % thieps.length)
                            return (
                                <motion.div
                                    key={thiep || `thiep-${idx}`}
                                    className={idx === 0 ? 'w-full' : 'absolute inset-0 w-full'}
                                    animate={{ opacity: isActive ? 1 : 0 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                    style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                                >
                                    <ThiepZoom thiepUrl={thiep} />
                                </motion.div>
                            )
                        })}
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <img src="/images/NTQ-logo-white.webp" alt="NTQ" className="h-5 opacity-40" />
                        <p className="text-yellow-200/30 text-xs">
                            From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-yellow-200/50 transition-colors">NTQ Technology</a> with ❤️
                        </p>
                    </div>
                </div>
            </div>{/* end capture wrapper */}
        </motion.div>
    )
})
