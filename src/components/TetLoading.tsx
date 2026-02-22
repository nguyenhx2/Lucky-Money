'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TetLoadingProps {
    /** Text to display below the spinner */
    text?: string
    /** Whether to show full-screen overlay */
    fullScreen?: boolean
}

/**
 * Tết-themed loading indicator with spinning lì xì envelope
 * Use this for all async operations in the app.
 */
export const TetLoading: React.FC<TetLoadingProps> = ({
    text = 'Đang tải...',
    fullScreen = false,
}) => {
    const content = (
        <div className="flex flex-col items-center gap-4">
            {/* Spinning envelope stack */}
            <div className="relative w-20 h-20">
                {/* Outer ring — rotating golden dots */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {[0, 60, 120, 180, 240, 300].map(deg => (
                        <div
                            key={deg}
                            className="absolute w-2 h-2 rounded-full bg-yellow-400"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${deg}deg) translateY(-36px)`,
                                marginTop: '-4px',
                                marginLeft: '-4px',
                                opacity: 0.4 + (deg / 360) * 0.6,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Center envelope — pulsing, properly centered */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="text-4xl leading-none">🧧</span>
                </motion.div>
            </div>

            {/* Text */}
            <motion.p
                className="text-yellow-200/70 text-sm font-medium tracking-wide"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                {text}
            </motion.p>

            {/* Decorative mini icons */}
            <div className="flex gap-3 text-xs opacity-40">
                <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                >🌸</motion.span>
                <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                >🐎</motion.span>
                <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                >🎋</motion.span>
            </div>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                {content}
            </div>
        )
    }

    return content
}
