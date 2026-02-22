'use client'

import React, { useMemo } from 'react'

const BLOSSOM_COUNT = 60
const LANTERN_COUNT = 6
const SPARKLE_COUNT = 25

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export const PeachTree = React.memo(function PeachTree() {
    const blossoms = useMemo(() =>
        Array.from({ length: BLOSSOM_COUNT }, (_, i) => ({
            cx: 30 + seededRandom(i * 7 + 1) * 40,
            cy: 8 + seededRandom(i * 11 + 2) * 52,
            r: 2.5 + seededRandom(i * 3 + 5) * 4,
            opacity: 0.3 + seededRandom(i * 5 + 3) * 0.7,
            delay: seededRandom(i * 9 + 4) * 6,
            color: i % 5 === 0
                ? '#FF9EC7' : i % 5 === 1
                    ? '#FFB6D5' : i % 5 === 2
                        ? '#FFC2DD' : i % 5 === 3
                            ? '#FF85B3' : '#FFD4E5',
        })),
        [])

    const sparkles = useMemo(() =>
        Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
            cx: 20 + seededRandom(i * 13 + 7) * 60,
            cy: 5 + seededRandom(i * 17 + 9) * 60,
            delay: seededRandom(i * 23 + 11) * 5,
            size: 1 + seededRandom(i * 7 + 3) * 2,
        })),
        [])

    const lanterns = useMemo(() =>
        Array.from({ length: LANTERN_COUNT }, (_, i) => ({
            x: 25 + i * 10 + seededRandom(i * 19 + 13) * 5,
            y: 20 + seededRandom(i * 29 + 17) * 25,
            size: 5 + seededRandom(i * 31 + 19) * 4,
            delay: seededRandom(i * 37 + 23) * 3,
        })),
        [])

    return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
                <defs>
                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Blossom gradient */}
                    <radialGradient id="blossomGrad" cx="40%" cy="40%">
                        <stop offset="0%" stopColor="#FFF0F5" stopOpacity="1" />
                        <stop offset="60%" stopColor="#FFB6D5" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#FF85B3" stopOpacity="0.3" />
                    </radialGradient>
                    {/* Lantern gradient */}
                    <radialGradient id="lanternGrad" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                        <stop offset="40%" stopColor="#FF6B35" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#CC0000" stopOpacity="0.8" />
                    </radialGradient>
                    {/* Sparkle gradient */}
                    <radialGradient id="sparkleGrad" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Trunk with bark texture */}
                <path
                    d="M50 95 Q48 80 45 72 Q42 65 38 58 Q35 50 36 42 Q37 35 42 30 Q44 27 47 25 Q50 23 50 20"
                    fill="none" stroke="#5D2E0C" strokeWidth="4.5" strokeLinecap="round"
                />
                <path
                    d="M50 95 Q52 82 53 74 Q54 66 52 58 Q50 50 48 42 Q46 36 47 30 Q48 27 50 25"
                    fill="none" stroke="#4A2409" strokeWidth="2" strokeLinecap="round" opacity="0.5"
                />

                {/* Main branches */}
                <path d="M45 58 Q35 48 25 42 Q18 38 12 40" fill="none" stroke="#6B3410" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M48 50 Q55 40 65 35 Q72 32 80 34" fill="none" stroke="#6B3410" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M44 42 Q38 35 30 28 Q24 24 18 24" fill="none" stroke="#6B3410" strokeWidth="2" strokeLinecap="round" />
                <path d="M47 38 Q52 30 60 22 Q66 18 72 17" fill="none" stroke="#6B3410" strokeWidth="2" strokeLinecap="round" />
                <path d="M46 30 Q42 24 35 18 Q30 14 24 13" fill="none" stroke="#573012" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M48 28 Q55 20 62 14 Q68 10 75 10" fill="none" stroke="#573012" strokeWidth="1.8" strokeLinecap="round" />

                {/* Sub-branches */}
                <path d="M30 28 Q26 22 20 18" fill="none" stroke="#573012" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <path d="M60 22 Q64 16 70 12" fill="none" stroke="#573012" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <path d="M25 42 Q20 36 14 34" fill="none" stroke="#573012" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <path d="M65 35 Q72 28 78 26" fill="none" stroke="#573012" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <path d="M18 24 Q14 18 10 16" fill="none" stroke="#573012" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <path d="M72 17 Q78 12 83 10" fill="none" stroke="#573012" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <path d="M35 18 Q30 12 26 8" fill="none" stroke="#573012" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <path d="M62 14 Q66 8 70 6" fill="none" stroke="#573012" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

                {/* Blossoms with glow */}
                {blossoms.map((b, i) => (
                    <g key={`blossom-${i}`}>
                        <circle
                            cx={b.cx} cy={b.cy} r={b.r * 1.5}
                            fill={b.color} opacity={b.opacity * 0.15}
                            filter="url(#softGlow)"
                        >
                            <animate attributeName="r" values={`${b.r * 1.3};${b.r * 1.8};${b.r * 1.3}`}
                                dur={`${3 + b.delay * 0.5}s`} begin={`${b.delay}s`} repeatCount="indefinite" />
                        </circle>
                        <circle cx={b.cx} cy={b.cy} r={b.r} fill="url(#blossomGrad)" opacity={b.opacity}>
                            <animate attributeName="opacity" values={`${b.opacity};${b.opacity * 0.5};${b.opacity}`}
                                dur={`${4 + b.delay * 0.3}s`} begin={`${b.delay}s`} repeatCount="indefinite" />
                            <animate attributeName="r" values={`${b.r};${b.r * 1.15};${b.r}`}
                                dur={`${3 + b.delay * 0.4}s`} begin={`${b.delay}s`} repeatCount="indefinite" />
                        </circle>
                        {/* Inner glow */}
                        {i % 3 === 0 && (
                            <circle cx={b.cx - b.r * 0.2} cy={b.cy - b.r * 0.2} r={b.r * 0.35}
                                fill="#FFF0F5" opacity={b.opacity * 0.6} />
                        )}
                    </g>
                ))}

                {/* Golden sparkles */}
                {sparkles.map((s, i) => (
                    <circle key={`sparkle-${i}`} cx={s.cx} cy={s.cy} r={s.size}
                        fill="url(#sparkleGrad)" opacity="0">
                        <animate attributeName="opacity" values="0;0.8;0" dur="3s"
                            begin={`${s.delay}s`} repeatCount="indefinite" />
                        <animate attributeName="r" values={`${s.size * 0.5};${s.size};${s.size * 0.5}`}
                            dur="3s" begin={`${s.delay}s`} repeatCount="indefinite" />
                    </circle>
                ))}

                {/* Lanterns */}
                {lanterns.map((l, i) => (
                    <g key={`lantern-${i}`}>
                        {/* String */}
                        <line x1={l.x} y1={l.y - l.size} x2={l.x} y2={l.y - l.size - 4}
                            stroke="#8B4513" strokeWidth="0.3" opacity="0.6" />
                        {/* Lantern body */}
                        <ellipse cx={l.x} cy={l.y} rx={l.size * 0.45} ry={l.size * 0.6}
                            fill="url(#lanternGrad)" opacity="0.85">
                            <animate attributeName="opacity" values="0.75;0.95;0.75"
                                dur={`${2 + l.delay}s`} repeatCount="indefinite" />
                        </ellipse>
                        {/* Lantern glow */}
                        <ellipse cx={l.x} cy={l.y} rx={l.size * 0.9} ry={l.size * 1.1}
                            fill="#FFD700" opacity="0" filter="url(#softGlow)">
                            <animate attributeName="opacity" values="0.05;0.15;0.05"
                                dur={`${2 + l.delay}s`} repeatCount="indefinite" />
                        </ellipse>
                        {/* Top cap */}
                        <rect x={l.x - l.size * 0.25} y={l.y - l.size * 0.65}
                            width={l.size * 0.5} height={l.size * 0.12} rx="0.3"
                            fill="#CC0000" opacity="0.9" />
                        {/* Tassel */}
                        <line x1={l.x} y1={l.y + l.size * 0.6} x2={l.x} y2={l.y + l.size * 1}
                            stroke="#CC0000" strokeWidth="0.4" opacity="0.7">
                            <animate attributeName="x2" values={`${l.x - 0.3};${l.x + 0.3};${l.x - 0.3}`}
                                dur={`${3 + l.delay}s`} repeatCount="indefinite" />
                        </line>
                    </g>
                ))}

                {/* Ground shadow/grass */}
                <ellipse cx="50" cy="96" rx="35" ry="3" fill="#1a0a00" opacity="0.3" />
            </svg>
        </div>
    )
})
