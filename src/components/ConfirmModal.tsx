'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmModalProps {
    open: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
    onCancel: () => void
}

const VARIANT_STYLES = {
    danger: {
        icon: '⚠️',
        confirmBg: 'bg-red-700/80 hover:bg-red-600/80',
        confirmText: 'text-white',
        borderColor: 'border-red-500/30',
    },
    warning: {
        icon: '🔔',
        confirmBg: 'bg-yellow-600/80 hover:bg-yellow-500/80',
        confirmText: 'text-white',
        borderColor: 'border-yellow-500/30',
    },
    info: {
        icon: 'ℹ️',
        confirmBg: 'bg-blue-700/80 hover:bg-blue-600/80',
        confirmText: 'text-white',
        borderColor: 'border-blue-500/30',
    },
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Huỷ',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    const style = VARIANT_STYLES[variant]

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`relative bg-gradient-to-b from-[#1a0a00]/95 to-[#0d0500]/95 backdrop-blur-xl rounded-2xl border ${style.borderColor} shadow-2xl w-full max-w-sm overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-2 text-center">
                            <div className="text-4xl mb-3">{style.icon}</div>
                            {title && (
                                <h3 className="text-lg font-bold text-yellow-200 mb-1">{title}</h3>
                            )}
                        </div>

                        {/* Message */}
                        <div className="px-6 pb-4">
                            <p className="text-yellow-100/70 text-sm text-center leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-yellow-200/70 font-medium rounded-xl transition-all border border-yellow-500/15 text-sm"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-2.5 ${style.confirmBg} ${style.confirmText} font-medium rounded-xl transition-all text-sm`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
