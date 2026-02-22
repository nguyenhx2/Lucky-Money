'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DonateModal } from '@/components/DonateModal'

interface Props {
    /** Show only when logged in */
    visible: boolean
}

// SVG gift icon — tri ân
const IconDonate = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
)

/**
 * Fixed floating badge:
 *   — Desktop/tablet: bottom-right corner
 *   — Mobile: top-right corner (avoids system gesture areas)
 */
export const DonateBadge: React.FC<Props> = ({ visible }) => {
    const [open, setOpen] = useState(false)

    if (!visible) return null

    return (
        <>
            <motion.button
                onClick={() => setOpen(true)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-400 shadow-lg shadow-yellow-600/30 flex items-center justify-center text-yellow-950 hover:scale-110 active:scale-95 transition-transform"
                title="Xem quỹ lì xì"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.4 } }}
            >
                <IconDonate />
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400/20 pointer-events-none" />
            </motion.button>

            {open && <DonateModal onClose={() => setOpen(false)} />}
        </>
    )
}
