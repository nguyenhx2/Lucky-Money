'use client'

import React, { memo } from 'react'

// All lì xì images in public/assets/li-xi
const LIXI_IMAGES = [
    '/assets/li-xi/li-xi-binh-ngo-1.webp',
    '/assets/li-xi/li-xi-binh-ngo-3.webp',
    '/assets/li-xi/li-xi-binh-ngo-8.webp',
    '/assets/li-xi/li-xi-binh-ngo.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-10.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-4.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-9.webp',
]

// Pre-computed positions — fewer items on mobile to spare GPU
const FLOAT_COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches ? 4 : 10
const FLOAT_ITEMS = Array.from({ length: FLOAT_COUNT }, (_, i) => ({
    src: LIXI_IMAGES[i % LIXI_IMAGES.length],
    left: `${(i * 11 + 5) % 95}%`,
    top: `${(i * 13 + 3) % 90}%`,
    size: 48 + (i % 4) * 16,            // 48-96px
    opacity: 0.04 + (i % 3) * 0.02,     // 0.04–0.08 — very subtle
    duration: 15 + (i % 5) * 4,          // 15-31s
    delay: i * 1.5,
    rotate: -15 + (i % 5) * 8,          // -15 to 17 degrees
}))

/**
 * Floating transparent lì xì images scattered across the background.
 * Very low opacity (4-8%) for a subtle, festive atmosphere.
 */
export const FloatingLiXi = memo(function FloatingLiXi() {
    return (
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden="true">
            {FLOAT_ITEMS.map((item, i) => (
                <div
                    key={i}
                    className="absolute floating-lixi rounded-lg overflow-hidden"
                    style={{
                        left: item.left,
                        top: item.top,
                        width: `${item.size}px`,
                        opacity: item.opacity,
                        transform: `rotate(${item.rotate}deg)`,
                        animationDuration: `${item.duration}s`,
                        animationDelay: `${item.delay}s`,
                    }}
                >
                    <img
                        src={item.src}
                        alt=""
                        className="w-full h-auto rounded-lg"
                        loading="lazy"
                        draggable={false}
                    />
                </div>
            ))}
        </div>
    )
})
