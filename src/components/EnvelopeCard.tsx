'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

interface EnvelopeData {
    id: string
    amount: number
    isOpened: boolean
    imageUrl: string | null
    wish?: string | null
    claimedBy: string | null
    claimedByEmail: string | null
    claimedAt: string | null
    positionTop: number
    positionLeft: number
    positionDelay: number
}

interface EnvelopeCardProps {
    data: EnvelopeData
    onClick: (envelope: EnvelopeData) => void
    stringLength?: number
}

const HOVER_EMOJIS = ['🌸', '🪙', '💮', '🏵️', '✨']

interface HoverParticle {
    id: number
    x: number
    y: number
    char: string
    dx: number
    dy: number
    scale: number
}

export const EnvelopeCard: React.FC<EnvelopeCardProps> = ({ data, onClick, stringLength = 40 }) => {
    const [particles, setParticles] = useState<HoverParticle[]>([])
    const [isHovered, setIsHovered] = useState(false)
    const idRef = useRef(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const spawnParticles = useCallback(() => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const count = 3 + Math.floor(Math.random() * 2)
        const newP: HoverParticle[] = []
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.8
            const dist = 25 + Math.random() * 45
            newP.push({
                id: ++idRef.current,
                x: cx + (Math.random() - 0.5) * rect.width * 0.3,
                y: cy + (Math.random() - 0.5) * rect.height * 0.3,
                char: HOVER_EMOJIS[Math.floor(Math.random() * HOVER_EMOJIS.length)],
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist - 20,
                scale: 0.5 + Math.random() * 0.6,
            })
        }
        setParticles(prev => [...prev.slice(-15), ...newP])
        setTimeout(() => setParticles(prev => prev.filter(p => !newP.includes(p))), 1400)
    }, [])

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true)
        spawnParticles()
        intervalRef.current = setInterval(spawnParticles, 500)
    }, [spawnParticles])

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    if (data.isOpened) return null

    return (
        <>
            {/* Outer wrapper: CSS sway animation only */}
            <div
                className="flex flex-col items-center envelope-hang"
                style={{
                    ['--sway-duration' as string]: `${2.5 + (data.positionDelay % 2)}s`,
                }}
            >
                {/* Hanging string */}
                <div
                    className="envelope-string shrink-0"
                    style={{ height: `${stringLength}px` }}
                />

                {/* Interactive wrapper: framer-motion hover/tap */}
                <motion.div
                    ref={cardRef}
                    className="relative cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'manipulation' }}
                    role="button"
                    aria-label="Mở bao lì xì"
                    tabIndex={0}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.18, y: -5, rotate: [0, -3, 3, -2, 0] }}
                    whileTap={{ scale: 0.92 }}
                    transition={{
                        delay: data.positionDelay * 0.15,
                        duration: 0.5,
                        rotate: { duration: 0.5, ease: 'easeInOut' },
                    }}
                    onClick={() => onClick(data)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(data) } }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Pulse glow background */}
                    <div
                        className={`absolute -inset-3 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.15) 40%, transparent 70%)',
                            animation: isHovered ? 'envelope-pulse-glow 1.5s ease-in-out infinite' : 'none',
                        }}
                    />

                    {/* Envelope body */}
                    <div className="relative w-11 h-16 sm:w-14 sm:h-20 md:w-[68px] md:h-[96px] rounded-lg overflow-hidden shadow-xl envelope-glow group bg-gradient-to-b from-red-600 to-red-800">
                        {data.imageUrl ? (
                            <img
                                src={data.imageUrl}
                                alt="Bao lì xì"
                                className="w-full h-full object-contain"
                                width={68}
                                height={96}
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                            />) : (
                            <div className="w-full h-full bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center border border-yellow-500/50">
                                <div className="w-8 h-8 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-400 font-bold text-xs">Lộc</span>
                                </div>
                            </div>
                        )}

                        {/* Hover glow overlay */}
                        <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />

                        {/* Sparkle on hover */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-yellow-300 text-xs animate-shimmer">✨</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Particles rendered via portal to document.body — avoids transform clipping */}
            {mounted && particles.length > 0 && createPortal(
                <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="click-particle"
                            style={{
                                left: p.x,
                                top: p.y,
                                ['--dx' as string]: `${p.dx}px`,
                                ['--dy' as string]: `${p.dy}px`,
                                ['--p-scale' as string]: p.scale,
                                opacity: 0.2 + Math.random() * 0.2,
                                fontSize: `${10 + p.scale * 8}px`,
                            }}
                        >
                            {p.char}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    )
}
