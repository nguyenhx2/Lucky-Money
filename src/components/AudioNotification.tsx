'use client'

import React, { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AudioNotification — Subtle floating notification:
 * "🎧 Nếu có tai nghe, hãy đeo và bật nhạc Tết nhé!"
 * Gentle slide-in, no repeated content, dismissable.
 */
const AudioNotification = memo(function AudioNotification() {
    const [dismissed, setDismissed] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem('tet-audio-notif-dismissed')
        if (saved !== 'true') {
            setDismissed(false)
        }
    }, [])

    const handleDismiss = () => {
        setDismissed(true)
        localStorage.setItem('tet-audio-notif-dismissed', 'true')
    }

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, delay: 1.5 }}
                    className="fixed top-3 left-1/2 -translate-x-1/2 z-[60]"
                >
                    <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md rounded-full pl-4 pr-2 py-1.5 border border-yellow-500/15 shadow-lg">
                        <p className="text-yellow-200/80 text-xs sm:text-sm font-medium whitespace-nowrap">
                            🎧 Nếu có tai nghe, hãy đeo và bật nhạc Tết nhé!
                        </p>
                        <button
                            onClick={handleDismiss}
                            className="shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-yellow-200/50 hover:text-yellow-100 flex items-center justify-center transition-colors text-[10px]"
                            title="Đóng"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})

export default AudioNotification
