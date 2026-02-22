'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function getTimeLeft(target: Date, serverTimeOffset = 0): TimeLeft | null {
    const diff = target.getTime() - (Date.now() + serverTimeOffset)
    if (diff <= 0) return null
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    }
}

interface CountdownProps {
    targetDate: Date
    /** Server-client time offset in ms (serverTime - clientTime) */
    serverTimeOffset?: number
    onComplete?: () => void
}

// ── Single countdown digit block with flip animation ──
function CountdownBlock({ value, label }: { value: number; label: string }) {
    const display = String(value).padStart(2, '0')

    return (
        <div className="flex flex-col items-center">
            <div className="relative group">
                {/* Card container */}
                <div className="w-[68px] h-[76px] sm:w-[88px] sm:h-[96px] md:w-[100px] md:h-[108px] rounded-2xl overflow-hidden relative">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-700 via-red-800 to-red-950 border border-yellow-500/30 rounded-2xl" />

                    {/* Inner gold border accent */}
                    <div className="absolute inset-[2px] rounded-xl border border-yellow-400/15" />

                    {/* Top half darker (split-flap illusion) */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent rounded-t-2xl" />

                    {/* Center divider line */}
                    <div className="absolute inset-x-1 top-1/2 h-px bg-black/30" />
                    <div className="absolute inset-x-1 top-1/2 mt-px h-px bg-yellow-500/10" />

                    {/* Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={display}
                                initial={{ y: -12, opacity: 0, rotateX: -40 }}
                                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                exit={{ y: 12, opacity: 0, rotateX: 40 }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tabular-nums"
                                style={{
                                    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: 'none',
                                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                                }}
                            >
                                {display}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/[0.06] via-transparent to-yellow-500/[0.04] animate-shimmer pointer-events-none" />
                </div>

                {/* Glow underneath */}
                <div className="absolute -bottom-2 inset-x-2 h-4 bg-red-600/30 blur-lg rounded-full" />
            </div>

            {/* Label */}
            <span className="text-[10px] sm:text-xs text-yellow-200/50 mt-2.5 uppercase tracking-[0.2em] font-semibold">
                {label}
            </span>
        </div>
    )
}

// ── Separator (colon) with pulse animation ──
function Separator() {
    return (
        <div className="flex flex-col items-center justify-center gap-2 h-[76px] sm:h-[96px] md:h-[108px]">
            <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400/70 shadow-md shadow-yellow-500/30"
            />
            <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400/70 shadow-md shadow-yellow-500/30"
            />
        </div>
    )
}

export const Countdown = React.memo(function Countdown({ targetDate, serverTimeOffset = 0, onComplete }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(targetDate, serverTimeOffset))

    useEffect(() => {
        const timer = setInterval(() => {
            const tl = getTimeLeft(targetDate, serverTimeOffset)
            setTimeLeft(tl)
            if (!tl) {
                clearInterval(timer)
                onComplete?.()
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [targetDate, serverTimeOffset, onComplete])

    if (!timeLeft) return null

    const blocks = [
        { label: 'Ngày', value: timeLeft.days },
        { label: 'Giờ', value: timeLeft.hours },
        { label: 'Phút', value: timeLeft.minutes },
        { label: 'Giây', value: timeLeft.seconds },
    ]

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            + ' — ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-visible flex flex-col items-center gap-6 w-full max-w-xl mx-auto px-4"
        >
            {/* ── Title ── */}
            <div className="text-center relative z-10">
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-yellow-200/90 text-base sm:text-lg md:text-xl tracking-wide font-medium"
                >
                    ⏳ Phiên hái lộc bắt đầu sau
                </motion.p>
            </div>

            {/* ── Countdown blocks ── */}
            <div className="relative z-10 overflow-visible">
                {/* Plum blossoms — right edge touches panel top-left corner */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 0.9, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="absolute top-2 right-full translate-x-3 sm:translate-x-4 w-20 sm:w-28 md:w-36 z-20 pointer-events-none select-none"
                >
                    <Image
                        src="/images/plum-flower.webp"
                        alt="Hoa mai"
                        width={160}
                        height={160}
                        className="drop-shadow-lg"
                        draggable={false}
                    />
                </motion.div>

                {/* Exploding firecrackers — left edge touches panel bottom-right corner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.65, scale: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-16 -right-4 sm:-bottom-20 sm:-right-6 w-16 sm:w-24 md:w-28 z-20 pointer-events-none select-none"
                >
                    <Image
                        src="/images/fireworks-2.webp"
                        alt="Pháo nổ"
                        width={130}
                        height={160}
                        className="drop-shadow-lg -scale-x-100"
                        draggable={false}
                    />
                </motion.div>

                {/* Container with glass effect */}
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl px-5 py-5 sm:px-8 sm:py-7 border border-yellow-500/15">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <CountdownBlock value={blocks[0].value} label={blocks[0].label} />
                        <Separator />
                        <CountdownBlock value={blocks[1].value} label={blocks[1].label} />
                        <Separator />
                        <CountdownBlock value={blocks[2].value} label={blocks[2].label} />
                        <Separator />
                        <CountdownBlock value={blocks[3].value} label={blocks[3].label} />
                    </div>
                </div>
            </div>

            {/* ── Target date info ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="relative z-10 flex items-center gap-2"
            >
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-500/30" />
                <p className="text-yellow-100/35 text-xs sm:text-sm font-medium tracking-wide">
                    🗓️ {formatDate(targetDate)}
                </p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-500/30" />
            </motion.div>
        </motion.div>
    )
})

export function useCountdownComplete(targetDate: Date | null, serverTimeOffset = 0): boolean {
    const [isComplete, setIsComplete] = useState(() => !targetDate || getTimeLeft(targetDate, serverTimeOffset) === null)

    // Reset when targetDate changes (e.g., from null to a valid future date)
    useEffect(() => {
        if (!targetDate) {
            setIsComplete(true)
            return
        }
        const tl = getTimeLeft(targetDate, serverTimeOffset)
        if (tl === null) {
            setIsComplete(true)
        } else {
            setIsComplete(false)
        }
    }, [targetDate, serverTimeOffset])

    useEffect(() => {
        if (!targetDate || isComplete) return
        const timer = setInterval(() => {
            if (getTimeLeft(targetDate, serverTimeOffset) === null) {
                setIsComplete(true)
                clearInterval(timer)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [targetDate, isComplete, serverTimeOffset])

    return isComplete
}
