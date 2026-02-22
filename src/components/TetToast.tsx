'use client'

import React, { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } })

export const useToast = () => useContext(ToastContext)

let toastId = 0

// SVG icon components for toasts
const ToastIconSuccess = () => (
    <svg className="w-5 h-5 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const ToastIconError = () => (
    <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
)
const ToastIconInfo = () => (
    <svg className="w-5 h-5 shrink-0 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
)

const TOAST_ICON: Record<ToastType, React.FC> = {
    success: ToastIconSuccess,
    error: ToastIconError,
    info: ToastIconInfo,
}

export const TetToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container — portaled to top of screen */}
            <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none" role="status" aria-live="polite">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const Icon = TOAST_ICON[toast.type]
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className={`pointer-events-auto rounded-xl px-4 py-3 shadow-2xl border backdrop-blur-md cursor-pointer flex items-start gap-3 ${toast.type === 'success'
                                    ? 'bg-green-900/90 border-yellow-500/40 text-yellow-100'
                                    : toast.type === 'error'
                                        ? 'bg-red-900/90 border-red-400/40 text-red-100'
                                        : 'bg-yellow-900/90 border-yellow-500/40 text-yellow-100'
                                    }`}
                                style={{
                                    boxShadow: toast.type === 'error'
                                        ? '0 0 15px rgba(220,50,50,0.3)'
                                        : '0 0 15px rgba(255,200,50,0.2)',
                                }}
                                onClick={() => removeToast(toast.id)}
                            >
                                <div className="mt-0.5">
                                    <Icon />
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
