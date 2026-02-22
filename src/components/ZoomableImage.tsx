'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ZoomableImageProps {
    src: string
    alt: string
    className?: string
    /** Additional wrapper className */
    wrapperClassName?: string
}

/**
 * A reusable image component that zooms into a fullscreen lightbox on click.
 * Tap the backdrop or the image again to dismiss.
 */
export const ZoomableImage: React.FC<ZoomableImageProps> = ({
    src,
    alt,
    className = '',
    wrapperClassName = '',
}) => {
    const [isZoomed, setIsZoomed] = useState(false)

    const open = useCallback(() => setIsZoomed(true), [])
    const close = useCallback(() => setIsZoomed(false), [])

    return (
        <>
            {/* Thumbnail — clickable */}
            <div
                className={`cursor-zoom-in ${wrapperClassName}`}
                onClick={open}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && open()}
            >
                <img src={src} alt={alt} className={className} draggable={false} />
            </div>

            {/* Lightbox overlay */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-zoom-out"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={close}
                    >
                        <motion.img
                            src={src}
                            alt={alt}
                            className="max-w-[90vw] max-h-[85vh] w-auto h-auto rounded-2xl shadow-2xl border-2 border-yellow-500/40 object-contain"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            draggable={false}
                        />

                        {/* Close hint */}
                        <motion.p
                            className="absolute bottom-6 text-white/40 text-xs tracking-wide"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Nhấn để đóng
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
