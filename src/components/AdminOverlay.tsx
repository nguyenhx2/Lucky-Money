'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, DEFAULT_DENOMINATIONS } from '@/lib/distribute'
import { BACKGROUNDS } from '@/lib/backgrounds'
import { useToast } from '@/components/TetToast'
import { TetLoading } from '@/components/TetLoading'
import { ConfirmModal } from '@/components/ConfirmModal'

// ─── SVG Icon Components ───
const IconCog = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)
const IconClipboard = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
    </svg>
)
const IconRefresh = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
    </svg>
)
const IconBeaker = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
)
const IconPhoto = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
)
const IconEnvelope = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
)
const IconX = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const IconSend = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
)
const IconTrash = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
)
const IconPlus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
)
const IconLoader = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
)
const IconRocket = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
)
const IconCalendar = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
)
const IconShield = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
)
const IconRetry = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
    </svg>
)
const IconBonus = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
)
const IconCoin = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const IconMail = () => (
    <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
)

interface AdminOverlayProps {
    onClose: () => void
    onSessionCreated: () => void
    gameSession: any
    currentBg?: string
    onBgChange?: (key: string) => void
    bgRotateInterval?: number
    onBgRotateChange?: (seconds: number) => void
}

// Password prompt sub-component
function PasswordPrompt({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
    const [pw, setPw] = useState('')
    const [error, setError] = useState(false)

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pw }),
            })
            if (res.ok) {
                onSuccess()
            } else {
                setError(true)
                setPw('')
            }
        } catch {
            setError(true)
        }
    }, [pw, onSuccess])

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-b from-[#1a0a00]/95 to-[#0d0500]/95 backdrop-blur-xl rounded-2xl border border-yellow-500/25 p-8 max-w-sm w-full shadow-2xl relative"
        >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <IconX />
            </button>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                    <IconShield />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-yellow-300">Admin Access</h3>
                    <p className="text-yellow-200/40 text-xs">Nhập mật khẩu để tiếp tục</p>
                </div>
            </div>
            <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setError(false) }}
                placeholder="Mật khẩu admin"
                autoFocus
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none transition-colors mb-3 ${error ? 'border-red-500 focus:border-red-400' : 'border-yellow-500/20 focus:border-yellow-400/50'}`}
            />
            {error && <p className="text-red-400 text-xs mb-3">Sai mật khẩu</p>}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white/60 font-medium rounded-xl transition-all"
                >
                    Huỷ
                </button>
                <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-950 font-bold rounded-xl transition-all shadow-lg"
                >
                    Xác nhận
                </button>
            </div>
        </motion.form>
    )
}

// ─── Allowed Emails Type ───
interface AllowedEmailEntry {
    id: string
    email: string
    label: string | null
    createdAt: string
}

type Tab = 'setup' | 'history' | 'retry' | 'simulate' | 'background' | 'emails' | 'donate'
type RetrySubTab = 'retry' | 'bonus'
type EmailFilter = 'all' | 'retry' | 'bonus'

export const AdminOverlay: React.FC<AdminOverlayProps> = ({ onClose, onSessionCreated, gameSession, currentBg, onBgChange, bgRotateInterval = 0, onBgRotateChange }) => {
    const { showToast } = useToast()
    const [authenticated, setAuthenticated] = useState(false)
    const [tab, setTab] = useState<Tab>('setup')
    const [budget, setBudget] = useState(5000000)
    const [quantity, setQuantity] = useState(85)
    const [maxPicks, setMaxPicks] = useState(1)
    const [startMode, setStartMode] = useState<'now' | 'schedule'>('now')
    const [startDate, setStartDate] = useState('')
    const [startTime, setStartTime] = useState('09:30')
    const [isCreating, setIsCreating] = useState(false)
    const [historySubTab, setHistorySubTab] = useState<'opened' | 'remaining' | 'budget'>('opened')
    const [historyViewMode, setHistoryViewMode] = useState<'card' | 'table'>('card')
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

    // Global admin loading state for TetLoading overlay
    const [adminLoading, setAdminLoading] = useState(false)
    const [adminLoadingText, setAdminLoadingText] = useState('Đang xử lý...')

    // Donate state
    const [donors, setDonors] = useState<{ id: string; name: string; email: string; amount: number; note?: string | null }[]>([])
    const [donateLoading, setDonateLoading] = useState(false)
    const [donateForm, setDonateForm] = useState<{ name: string; email: string; amount: string; note: string }>({ name: '', email: '', amount: '', note: '' })
    const [editDonorId, setEditDonorId] = useState<string | null>(null)
    const [budgetSource, setBudgetSource] = useState<'manual' | 'donate'>('manual')
    const [donateSettings, setDonateSettings] = useState({ showPublicView: true, showContributorView: true })

    // Audio autoplay toggle — sync with gameSession
    const [autoplayMusic, setAutoplayMusic] = useState(true)
    useEffect(() => {
        if (gameSession?.autoplayMusic !== undefined) {
            setAutoplayMusic(gameSession.autoplayMusic)
        }
    }, [gameSession?.autoplayMusic])

    // Pre-populate setup form from existing session
    useEffect(() => {
        if (gameSession) {
            setBudget(gameSession.budget || 5000000)
            setQuantity(gameSession.quantity || 85)
            setMaxPicks(gameSession.maxPicksPerUser || 1)
            setRetryPercent(gameSession.retryPercent || 0)
            setBonusEnabled(gameSession.bonusEnabled || false)
            setBonusBudgetPercent(gameSession.bonusBudgetPercent || 20)
            if (gameSession.denominations?.length > 0) {
                setDenominations(gameSession.denominations.map((d: any) => d.amount))
            }
            if (gameSession.startAt) {
                setStartMode('schedule')
                const d = new Date(gameSession.startAt)
                setStartDate(d.toISOString().split('T')[0])
                setStartTime(d.toTimeString().slice(0, 5))
            }
            setEmailEnabled(gameSession.emailEnabled !== false)
        }
    }, [gameSession?.id])

    // Retry state
    const [retryEmail, setRetryEmail] = useState('')
    const [retryMsg, setRetryMsg] = useState('')

    // Feature: Auto-Retry + Bonus + Denominations
    const [retryPercent, setRetryPercent] = useState(0)
    const [bonusEnabled, setBonusEnabled] = useState(false)
    const [bonusBudgetPercent, setBonusBudgetPercent] = useState(20)
    const [denominations, setDenominations] = useState<number[]>([...DEFAULT_DENOMINATIONS])
    const [newDenom, setNewDenom] = useState('')
    const [isRedistributing, setIsRedistributing] = useState(false)
    const [emailEnabled, setEmailEnabled] = useState(true)
    const [retrySubTab, setRetrySubTab] = useState<RetrySubTab>('retry')
    const [emailFilter, setEmailFilter] = useState<EmailFilter>('all')
    const [bonusEmail, setBonusEmail] = useState('')
    const [bonusMsg, setBonusMsg] = useState('')
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    // Simulate state
    const [simEmail, setSimEmail] = useState('test@example.com')
    const [simResult, setSimResult] = useState<string | null>(null)

    // Denomination edit mode state
    const [editingDenoms, setEditingDenoms] = useState(false)
    const [editDenomMap, setEditDenomMap] = useState<Record<number, number>>({})

    // Email state
    const [emailSending, setEmailSending] = useState<string | null>(null)
    const [emailMsg, setEmailMsg] = useState('')

    // Allowed emails state
    const [allowedEmails, setAllowedEmails] = useState<AllowedEmailEntry[]>([])
    const [allowedLoading, setAllowedLoading] = useState(false)
    const [pasteInput, setPasteInput] = useState('')
    const [addMsg, setAddMsg] = useState('')
    const [emailSearch, setEmailSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [emailPage, setEmailPage] = useState(0)
    const EMAIL_PAGE_SIZE = 50

    const claimedEnvelopes = useMemo(() =>
        gameSession?.envelopes?.filter((e: any) => e.isOpened) || [],
        [gameSession])

    const claimedTotal = useMemo(() =>
        claimedEnvelopes.reduce((s: number, e: any) => s + e.amount, 0),
        [claimedEnvelopes])

    const remainingBudget = useMemo(() => {
        if (!gameSession) return 0
        return gameSession.budget - claimedTotal
    }, [gameSession, claimedTotal])

    const uniqueUsers = useMemo(() => {
        const map = new Map<string, { email: string; name: string; total: number; count: number }>()
        claimedEnvelopes.forEach((e: any) => {
            const email = e.claimedByEmail || 'unknown'
            const existing = map.get(email)
            if (existing) {
                existing.total += e.amount
                existing.count += 1
            } else {
                map.set(email, { email, name: e.claimedBy || email, total: e.amount, count: 1 })
            }
        })
        return Array.from(map.values())
    }, [claimedEnvelopes])

    const denomBreakdown = useMemo(() => {
        const map: Record<number, number> = {}
        claimedEnvelopes.forEach((e: any) => { map[e.amount] = (map[e.amount] || 0) + 1 })
        return Object.entries(map).sort(([a], [b]) => +a - +b).map(([amt, cnt]) => ({ amount: +amt, count: cnt as number }))
    }, [claimedEnvelopes])

    const avgPerUser = useMemo(() =>
        uniqueUsers.length > 0 ? Math.round(claimedTotal / uniqueUsers.length) : 0,
        [claimedTotal, uniqueUsers])

    // Computed sets: which emails have retry/bonus grants
    const retryEmailSet = useMemo(() => {
        const s = new Set<string>()
        gameSession?.retryGrants?.forEach((g: any) => s.add(g.userEmail))
        return s
    }, [gameSession?.retryGrants])

    const bonusEmailSet = useMemo(() => {
        const s = new Set<string>()
        gameSession?.bonusGrants?.forEach((g: any) => s.add(g.userEmail))
        return s
    }, [gameSession?.bonusGrants])

    // Aggregated users: group claimed envelopes by email, split lộc vs bonus
    const aggregatedUsers = useMemo(() => {
        const map = new Map<string, {
            email: string; name: string;
            locAmount: number; locCount: number;
            bonusAmount: number; bonusCount: number;
            total: number; lastClaimedAt: string | null;
        }>()
        claimedEnvelopes.forEach((e: any) => {
            const email = e.claimedByEmail || 'unknown'
            const existing = map.get(email) || {
                email, name: e.claimedBy || email,
                locAmount: 0, locCount: 0,
                bonusAmount: 0, bonusCount: 0,
                total: 0, lastClaimedAt: null,
            }
            if (e.isBonusEnvelope) {
                existing.bonusAmount += e.amount
                existing.bonusCount += 1
            } else {
                existing.locAmount += e.amount
                existing.locCount += 1
            }
            existing.total = existing.locAmount + existing.bonusAmount
            if (!existing.lastClaimedAt || (e.claimedAt && new Date(e.claimedAt) > new Date(existing.lastClaimedAt))) {
                existing.lastClaimedAt = e.claimedAt
            }
            map.set(email, existing)
        })
        return Array.from(map.values()).sort((a, b) => b.total - a.total)
    }, [claimedEnvelopes])

    // ─── Handlers ───
    const handleCreate = useCallback(async () => {
        setIsCreating(true)
        setAdminLoadingText('Đang tạo phiên...')
        setAdminLoading(true)
        try {
            let startAt: string | null = null
            if (startMode === 'schedule' && startDate) {
                startAt = new Date(`${startDate}T${startTime}:00+07:00`).toISOString()
            }
            const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    budget, quantity, startAt,
                    maxPicksPerUser: maxPicks,
                    autoplayMusic,
                    adminAuth: true,
                    retryPercent,
                    bonusEnabled,
                    bonusBudgetPercent: bonusEnabled ? bonusBudgetPercent : 0,
                    customDenominations: denominations,
                    emailEnabled,
                    budgetSource,
                }),
            })
            if (!res.ok) {
                const data = await res.json()
                showToast(data.error || 'Lỗi', 'error')
                return
            }
            onSessionCreated()
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setIsCreating(false)
            setAdminLoading(false)
        }
    }, [budget, quantity, startMode, startDate, startTime, maxPicks, autoplayMusic, retryPercent, bonusEnabled, bonusBudgetPercent, denominations, emailEnabled, onSessionCreated])

    const handleToggleAutoplay = useCallback(async () => {
        if (!gameSession?.id) return
        const newValue = !autoplayMusic
        setAutoplayMusic(newValue)
        setAdminLoadingText('Đang lưu cài đặt...')
        setAdminLoading(true)
        try {
            await fetch('/api/game', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: gameSession.id, autoplayMusic: newValue, adminAuth: true }),
            })
            onSessionCreated()
        } catch {
            setAutoplayMusic(!newValue) // revert on error
        } finally {
            setAdminLoading(false)
        }
    }, [gameSession, autoplayMusic, onSessionCreated])

    const handleGrantRetry = useCallback(async () => {
        if (!retryEmail || !gameSession?.id) return
        setAdminLoadingText('Đang cấp retry...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/retry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: gameSession.id, userEmail: retryEmail }),
            })
            const data = await res.json()
            if (res.ok) {
                showToast('Đã cấp retry cho ' + retryEmail, 'success')
                setRetryEmail('')
                onSessionCreated()
            } else {
                showToast(res.status === 409
                    ? 'Người này đã có lượt thêm rồi!'
                    : 'Có lỗi xảy ra, thử lại nhé!', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [retryEmail, gameSession, onSessionCreated, showToast])

    const handleGrantBonus = useCallback(async () => {
        if (!bonusEmail || !gameSession?.id) return
        setAdminLoadingText('Đang cấp bonus...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/bonus-grant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: gameSession.id, userEmail: bonusEmail }),
            })
            const data = await res.json()
            if (res.ok) {
                showToast('Đã cấp bonus cho ' + bonusEmail, 'success')
                setBonusEmail('')
                onSessionCreated()
            } else {
                showToast(res.status === 409
                    ? 'Người này đã được cấp bonus rồi!'
                    : 'Có lỗi xảy ra, thử lại nhé!', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [bonusEmail, gameSession, onSessionCreated, showToast])

    const handleDeleteRetryGrant = useCallback(async (grantId: string) => {
        setAdminLoadingText('Đang xoá retry...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/retry', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grantId }),
            })
            if (res.ok) {
                onSessionCreated()
            } else {
                showToast(res.status === 404 ? 'Không tìm thấy lượt này!' : 'Xoá không thành công, thử lại nhé!', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [onSessionCreated, showToast])

    const handleDeleteBonusGrant = useCallback(async (grantId: string) => {
        setAdminLoadingText('Đang xoá bonus...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/bonus-grant', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grantId }),
            })
            if (res.ok) {
                onSessionCreated()
            } else {
                showToast(res.status === 404 ? 'Không tìm thấy bonus này!' : 'Xoá không thành công, thử lại nhé!', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [onSessionCreated, showToast])

    const handleSendEmail = useCallback(async (to: string, name: string, amount: number, imageUrl?: string | null) => {
        setEmailSending(to)
        setEmailMsg('')
        setAdminLoadingText('Đang gửi email...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, name, amount, imageUrl }),
            })
            const data = await res.json()
            if (res.ok) {
                setEmailMsg(`Đã gửi email tới ${to}`)
            } else {
                showToast(res.status === 404 ? 'Email không tồn tại hoặc không gửi được!' : 'Gửi email thất bại, thử lại nhé!', 'error')
                setEmailMsg('')
            }
        } catch {
            setEmailMsg('Lỗi kết nối')
        } finally {
            setEmailSending(null)
            setAdminLoading(false)
        }
    }, [])

    const handleSimulate = useCallback(async (envelopeId: string) => {
        setAdminLoadingText('Đang giả lập...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ envelopeId, simulateEmail: simEmail }),
            })
            const data = await res.json()
            if (res.ok) {
                setSimResult(`${simEmail} nhận ${formatCurrency(data.amount)}`)
                onSessionCreated()
            } else {
                showToast(
                    res.status === 403 ? 'Không có quyền thực hiện!' :
                        res.status === 409 ? 'Email này đã rút rồi!' :
                            'Giả lập thất bại, thử lại nhé!', 'error'
                )
                setSimResult('')
            }
        } catch {
            setSimResult('Lỗi kết nối')
        } finally {
            setAdminLoading(false)
        }
    }, [simEmail, onSessionCreated])

    const handleSimTestEmail = useCallback(async () => {
        if (!simEmail) return
        setAdminLoadingText('Đang gửi email thử...')
        setAdminLoading(true)
        const testAmount = [50000, 100000, 200000][Math.floor(Math.random() * 3)]
        try {
            const res = await fetch('/api/game/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: simEmail, name: `[Test] ${simEmail}`, amount: testAmount }),
            })
            const data = await res.json()
            if (res.ok) {
                showToast(`Email thử đã gửi tới ${simEmail} 📧`, 'success')
                setSimResult(`Email thử gửi tới ${simEmail}: ${formatCurrency(testAmount)}`)
            } else {
                showToast(data.error || 'Gửi email thất bại', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [simEmail, showToast])

    const handleApplyDenomEdit = useCallback(async () => {
        if (!gameSession?.id) return
        const denomTargets = Object.entries(editDenomMap)
            .filter(([, cnt]) => (cnt as number) > 0)
            .map(([amt, cnt]) => ({ amount: +amt, count: cnt as number }))
        if (denomTargets.length === 0) {
            showToast('Cần ít nhất 1 mệnh giá', 'error')
            return
        }
        setAdminLoadingText('Đang cập nhật phân phối...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/game/redistribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: gameSession.id, denomTargets }),
            })
            if (res.ok) {
                showToast('Đã cập nhật phân phối!', 'success')
                setEditingDenoms(false)
                onSessionCreated()
            } else {
                const d = await res.json()
                showToast(d.error || 'Lỗi', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setAdminLoading(false)
        }
    }, [gameSession?.id, editDenomMap, showToast, onSessionCreated])

    // ─── Allowed Emails Handlers ───
    const fetchAllowedEmails = useCallback(async () => {
        setAllowedLoading(true)
        setAdminLoadingText('Đang tải danh sách email...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/allowed-emails')
            const data = await res.json()
            setAllowedEmails(data.emails || [])
        } catch { /* ignore */ } finally {
            setAllowedLoading(false)
            setAdminLoading(false)
        }
    }, [])

    useEffect(() => {
        if (tab === 'emails' && authenticated) fetchAllowedEmails()
    }, [tab, authenticated, fetchAllowedEmails])

    // Fetch donors when Donate tab opens
    const fetchDonors = useCallback(async () => {
        setDonateLoading(true)
        try {
            const [r, sr] = await Promise.all([
                fetch('/api/donate', { headers: { 'x-admin-auth': 'true' } }),
                fetch('/api/donate/settings'),
            ])
            const d = await r.json()
            setDonors(d.donors || [])
            if (sr.ok) setDonateSettings(await sr.json())
        } finally {
            setDonateLoading(false)
        }
    }, [])

    useEffect(() => {
        if (tab === 'donate' && authenticated) fetchDonors()
    }, [tab, authenticated, fetchDonors])

    const handleAddEmails = useCallback(async () => {
        if (!pasteInput.trim()) return
        setAddMsg('')
        setAdminLoadingText('Đang thêm email...')
        setAdminLoading(true)
        try {
            const res = await fetch('/api/allowed-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: pasteInput }),
            })
            const data = await res.json()
            if (res.ok) {
                setAddMsg(`Đã thêm ${data.added}/${data.total} email`)
                setPasteInput('')
                fetchAllowedEmails()
            } else {
                setAddMsg('Lỗi: ' + data.error)
            }
        } catch {
            setAddMsg('Lỗi kết nối')
        } finally {
            setAdminLoading(false)
        }
    }, [pasteInput, fetchAllowedEmails])

    const handleDeleteEmail = useCallback(async (id: string) => {
        setAdminLoadingText('Đang xoá...')
        setAdminLoading(true)
        try {
            await fetch(`/api/allowed-emails?id=${id}`, { method: 'DELETE' })
            setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
            fetchAllowedEmails()
        } catch { /* ignore */ } finally {
            setAdminLoading(false)
        }
    }, [fetchAllowedEmails])

    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return
        setAdminLoadingText('Đang xoá email đã chọn...')
        setAdminLoading(true)
        try {
            await fetch('/api/allowed-emails', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            })
            setSelectedIds(new Set())
            fetchAllowedEmails()
        } catch { /* ignore */ } finally {
            setAdminLoading(false)
        }
    }, [selectedIds, fetchAllowedEmails])

    const handleDeleteAll = useCallback(async () => {
        setConfirmDeleteAll(false)
        setAdminLoadingText('Đang xoá tất cả email...')
        setAdminLoading(true)
        try {
            await fetch('/api/allowed-emails', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            })
            setSelectedIds(new Set())
            fetchAllowedEmails()
        } catch { /* ignore */ } finally {
            setAdminLoading(false)
        }
    }, [fetchAllowedEmails])

    const filteredEmails = useMemo(() => {
        let list = allowedEmails
        if (emailSearch.trim()) {
            const q = emailSearch.toLowerCase()
            list = list.filter(e => e.email.toLowerCase().includes(q))
        }
        if (emailFilter === 'retry') {
            list = list.filter(e => retryEmailSet.has(e.email))
        } else if (emailFilter === 'bonus') {
            list = list.filter(e => bonusEmailSet.has(e.email))
        }
        return list
    }, [allowedEmails, emailSearch, emailFilter, retryEmailSet, bonusEmailSet])

    const pagedEmails = useMemo(() => {
        const start = emailPage * EMAIL_PAGE_SIZE
        return filteredEmails.slice(start, start + EMAIL_PAGE_SIZE)
    }, [filteredEmails, emailPage])

    const totalPages = Math.ceil(filteredEmails.length / EMAIL_PAGE_SIZE)

    // ─── Tab config with SVG icons ───
    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'setup', label: 'Thiết lập', icon: <IconCog /> },
        { id: 'history', label: 'Lịch sử', icon: <IconClipboard /> },
        { id: 'retry', label: 'Lượt chơi', icon: <IconRefresh /> },
        { id: 'simulate', label: 'Giả lập', icon: <IconBeaker /> },
        { id: 'emails', label: 'Email', icon: <IconEnvelope /> },
        { id: 'background', label: 'Nền', icon: <IconPhoto /> },
        { id: 'donate', label: 'Donate', icon: <IconCoin /> },
    ]

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {!authenticated ? (
                        <PasswordPrompt key="password" onSuccess={() => setAuthenticated(true)} onClose={onClose} />
                    ) : (
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-gradient-to-b from-[#1a0a00]/95 to-[#0d0500]/95 backdrop-blur-xl rounded-2xl border border-yellow-500/25 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* TetLoading overlay for all admin operations */}
                            {adminLoading && (
                                <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden">
                                    <TetLoading text={adminLoadingText} fullScreen />
                                </div>
                            )}
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-yellow-500/15 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
                                        <IconShield />
                                    </div>
                                    <h2 className="text-xl font-bold text-yellow-300">Admin Panel</h2>
                                </div>
                                <button onClick={onClose} className="text-yellow-200/40 hover:text-yellow-200 transition-colors p-1">
                                    <IconX />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-yellow-500/10 px-2">
                                {tabs.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === t.id ? 'text-yellow-300 border-b-2 border-yellow-400 bg-yellow-500/5' : 'text-yellow-200/40 hover:text-yellow-200/70'
                                            }`}
                                    >
                                        {t.icon}
                                        <span className="hidden sm:inline">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {/* ====== SETUP TAB ====== */}
                                {tab === 'setup' && (
                                    <div className="space-y-5">
                                        {/* Budget source toggle */}
                                        <div className="flex gap-2">
                                            {(['manual', 'donate'] as const).map(src => (
                                                <button key={src} onClick={() => setBudgetSource(src)}
                                                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${budgetSource === src ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-white/5 border-transparent text-yellow-200/40 hover:text-yellow-200/70'}`}>
                                                    {src === 'manual' ? '✏️ Thủ công' : '💰 Từ Donate'}
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-yellow-200/60 text-sm mb-2">Ngân sách (VNĐ)</label>
                                            {budgetSource === 'donate' ? (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                                    <span className="text-yellow-300 font-bold text-lg flex-1">{formatCurrency(donors.reduce((s, d) => s + d.amount, 0))}</span>
                                                    <span className="text-yellow-200/40 text-xs">{donors.length} người donate</span>
                                                    <button onClick={() => setTab('donate')} className="text-yellow-400 text-xs hover:underline">Xem →</button>
                                                </div>
                                            ) : (
                                                <input type="text" inputMode="numeric"
                                                    value={budget.toLocaleString('vi-VN')}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/[^0-9]/g, '')
                                                        if (raw) setBudget(+raw)
                                                        else setBudget(0)
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-base focus:outline-none focus:border-yellow-400/50"
                                                />
                                            )}
                                            <p className="text-yellow-200/30 text-xs mt-1.5">{formatCurrency(budget)}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-yellow-200/60 text-sm mb-2">Số lượng phong bao</label>
                                                <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-base focus:outline-none focus:border-yellow-400/50"
                                                    min={1} max={200}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-yellow-200/60 text-sm mb-2">Lượt hái / người</label>
                                                <input type="number" value={maxPicks} onChange={e => setMaxPicks(+e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-base focus:outline-none focus:border-yellow-400/50"
                                                    min={1} max={10}
                                                />
                                            </div>
                                        </div>

                                        {/* Start mode */}
                                        <div>
                                            <label className="block text-yellow-200/60 text-sm mb-2">Thời gian bắt đầu</label>
                                            <div className="flex gap-3 mb-3">
                                                <button
                                                    onClick={() => setStartMode('now')}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${startMode === 'now' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40' : 'bg-white/5 text-yellow-200/40 border border-transparent'
                                                        }`}
                                                >
                                                    <IconRocket /> Bắt đầu ngay
                                                </button>
                                                <button
                                                    onClick={() => setStartMode('schedule')}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${startMode === 'schedule' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40' : 'bg-white/5 text-yellow-200/40 border border-transparent'
                                                        }`}
                                                >
                                                    <IconCalendar /> Đặt lịch
                                                </button>
                                            </div>
                                            {startMode === 'schedule' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                                        className="px-4 py-2.5 bg-white/5 border border-yellow-500/20 rounded-xl text-white focus:outline-none text-sm [color-scheme:dark]"
                                                    />
                                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                                        className="px-4 py-2.5 bg-white/5 border border-yellow-500/20 rounded-xl text-white focus:outline-none text-sm [color-scheme:dark]"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Auto-Retry % ── */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <label className="block text-yellow-200/60 text-sm mb-2 flex items-center gap-1.5"><IconRetry /> Auto-Retry ({retryPercent}% người chơi)</label>
                                            <input type="range" value={retryPercent} onChange={e => setRetryPercent(+e.target.value)}
                                                className="w-full accent-yellow-500" min={0} max={100} step={5}
                                            />
                                            <p className="text-yellow-200/30 text-xs mt-1">{retryPercent === 0 ? 'Tắt' : `${retryPercent}% người chơi được thêm 1 lượt`}</p>
                                        </div>

                                        {/* ── Bonus Round ── */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-purple-300 text-sm font-medium flex items-center gap-1.5"><IconBonus /> Lộc thêm (Lượt 2 bí mật)</p>
                                                    <p className="text-purple-300/40 text-xs">Một số người chơi được bốc thêm</p>
                                                </div>
                                                <button
                                                    onClick={() => setBonusEnabled(!bonusEnabled)}
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${bonusEnabled ? 'bg-purple-500' : 'bg-white/15'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${bonusEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                            {bonusEnabled && (
                                                <div>
                                                    <label className="block text-purple-300/50 text-xs mb-1">Ngân sách bonus: {bonusBudgetPercent}% ({formatCurrency(Math.floor(budget * bonusBudgetPercent / 100))})</label>
                                                    <input type="range" value={bonusBudgetPercent} onChange={e => setBonusBudgetPercent(+e.target.value)}
                                                        className="w-full accent-purple-500" min={5} max={50} step={5}
                                                    />
                                                    <p className="text-purple-300/30 text-xs mt-1">Lượt 1: {formatCurrency(budget - Math.floor(budget * bonusBudgetPercent / 100))} | Lộc thêm: {formatCurrency(Math.floor(budget * bonusBudgetPercent / 100))}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Denominations Editor ── */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <label className="block text-yellow-200/60 text-sm mb-2 flex items-center gap-1.5"><IconCoin /> Mệnh giá</label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {denominations.sort((a, b) => a - b).map((d, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-300 px-3 py-1.5 rounded-lg text-sm border border-yellow-500/20">
                                                        {formatCurrency(d)}
                                                        <button onClick={() => setDenominations(prev => prev.filter((_, j) => j !== i))} className="text-yellow-200/40 hover:text-red-400 ml-1">&times;</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="number" value={newDenom} onChange={e => setNewDenom(e.target.value)}
                                                    placeholder="VD: 20000"
                                                    className="flex-1 px-3 py-2 bg-white/5 border border-yellow-500/20 rounded-lg text-white text-sm focus:outline-none"
                                                    step={1000} min={1000}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const v = parseInt(newDenom)
                                                        if (v >= 1000 && v % 1000 === 0 && !denominations.includes(v)) {
                                                            setDenominations(prev => [...prev, v])
                                                            setNewDenom('')
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
                                                >
                                                    + Thêm
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreate}
                                            disabled={isCreating || (startMode === 'schedule' && !startDate)}
                                            className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-yellow-100 font-bold rounded-xl transition-all disabled:opacity-40 shadow-lg text-base flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <><IconLoader /> Đang tạo...</> : 'Tạo Phiên Hái Lộc Mới'}
                                        </button>

                                        {/* Autoplay Music Toggle */}
                                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <div>
                                                <p className="text-yellow-200 text-sm font-medium">Nhạc Tết tự động</p>
                                                <p className="text-yellow-200/35 text-xs">Phát nhạc ngay khi mở trang</p>
                                            </div>
                                            <button
                                                onClick={handleToggleAutoplay}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${autoplayMusic ? 'bg-yellow-500' : 'bg-white/15'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${autoplayMusic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* Email Notification Toggle */}
                                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <div>
                                                <p className="text-yellow-200 text-sm font-medium flex items-center gap-1.5"><IconMail /> Gửi email thông báo</p>
                                                <p className="text-yellow-200/35 text-xs">Gửi kết quả qua email khi bốc lì xì</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const newVal = !emailEnabled
                                                    setEmailEnabled(newVal)
                                                    if (gameSession?.id) {
                                                        setAdminLoadingText('Đang lưu cài đặt...')
                                                        setAdminLoading(true)
                                                        try {
                                                            await fetch('/api/game', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ sessionId: gameSession.id, emailEnabled: newVal, adminAuth: true }),
                                                            })
                                                            onSessionCreated()
                                                        } catch {
                                                            setEmailEnabled(!newVal)
                                                        } finally {
                                                            setAdminLoading(false)
                                                        }
                                                    }
                                                }}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-yellow-500' : 'bg-white/15'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* Stats */}
                                        {gameSession && (
                                            <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/10 text-sm text-yellow-200/50 space-y-1.5">
                                                <p>Ngân sách: {formatCurrency(gameSession.budget)}</p>
                                                <p>Tổng: {gameSession.quantity} | Đã mở: {claimedEnvelopes.length} | Còn: {gameSession.quantity - claimedEnvelopes.length}</p>
                                                <p>Còn dư: {formatCurrency(remainingBudget)}</p>
                                                {gameSession.bonusEnabled && <p className="text-purple-300/60 flex items-center gap-1"><IconBonus /> Lộc thêm: {gameSession.bonusBudgetPercent}% | Grants: {gameSession.bonusGrants?.length || 0}</p>}
                                                {(gameSession.retryPercent || 0) > 0 && <p className="text-yellow-300/60 flex items-center gap-1"><IconRetry /> Retry: {gameSession.retryPercent}% | Grants: {gameSession.retryGrants?.filter((g: any) => g.isAutoAssigned).length || 0}</p>}
                                                {gameSession.startAt && <p>Bắt đầu: {new Date(gameSession.startAt).toLocaleString('vi-VN')}</p>}
                                                <button
                                                    onClick={async () => {
                                                        if (isRedistributing) return
                                                        setIsRedistributing(true)
                                                        setAdminLoadingText('Đang phân phối lại...')
                                                        setAdminLoading(true)
                                                        try {
                                                            const res = await fetch('/api/game/redistribute', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ sessionId: gameSession.id }),
                                                            })
                                                            if (res.ok) {
                                                                showToast('Đã phân phối lại!', 'success')
                                                                onSessionCreated()
                                                            } else {
                                                                const d = await res.json()
                                                                showToast(d.error || 'Lỗi', 'error')
                                                            }
                                                        } catch {
                                                            showToast('Lỗi kết nối', 'error')
                                                        } finally {
                                                            setIsRedistributing(false)
                                                            setAdminLoading(false)
                                                        }
                                                    }}
                                                    disabled={isRedistributing}
                                                    className="w-full mt-2 py-2 bg-yellow-500/10 text-yellow-300 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors border border-yellow-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <IconRefresh /> Phân phối lại
                                                </button>
                                                <button
                                                    onClick={() => setShowResetConfirm(true)}
                                                    className="w-full mt-2 py-2 bg-red-500/10 text-red-300 rounded-lg text-sm hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center justify-center gap-2"
                                                >
                                                    ↺ Reset phiên
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ====== HISTORY TAB ====== */}
                                {tab === 'history' && (() => {
                                    const unopenedEnvelopes = gameSession?.envelopes?.filter((e: any) => !e.isOpened) || []
                                    const unopenedTotal = unopenedEnvelopes.reduce((s: number, e: any) => s + e.amount, 0)
                                    const allEnvelopes = gameSession?.envelopes || []
                                    const allTotal = allEnvelopes.reduce((s: number, e: any) => s + e.amount, 0)
                                    // Breakdown by denomination for all envelopes
                                    const allDenomMap: Record<number, { opened: number; remaining: number }> = {}
                                    allEnvelopes.forEach((e: any) => {
                                        if (!allDenomMap[e.amount]) allDenomMap[e.amount] = { opened: 0, remaining: 0 }
                                        e.isOpened ? allDenomMap[e.amount].opened++ : allDenomMap[e.amount].remaining++
                                    })
                                    const allDenomBreakdown = Object.entries(allDenomMap)
                                        .sort(([a], [b]) => +a - +b)
                                        .map(([amt, counts]) => ({ amount: +amt, ...counts, total: counts.opened + counts.remaining }))

                                    // CSV / Copy helpers
                                    const generateCSV = (rows: any[], type: 'opened' | 'remaining') => {
                                        if (type === 'opened') {
                                            const header = 'STT,Người nhận,Email,Mệnh giá,Thời gian,Retry,Lộc thêm\n'
                                            const body = rows.map((e: any, i: number) =>
                                                `${i + 1},"${e.claimedBy || 'Ẩn danh'}","${e.claimedByEmail || ''}",${e.amount},"${e.claimedAt ? new Date(e.claimedAt).toLocaleString('vi-VN') : ''}",${retryEmailSet.has(e.claimedByEmail) ? 'Có' : ''},${bonusEmailSet.has(e.claimedByEmail) ? 'Có' : ''}`
                                            ).join('\n')
                                            return header + body
                                        } else {
                                            const header = 'STT,Mệnh giá\n'
                                            const body = rows.map((e: any, i: number) => `${i + 1},${e.amount}`).join('\n')
                                            return header + body
                                        }
                                    }
                                    const handleCopyTable = (rows: any[], type: 'opened' | 'remaining') => {
                                        navigator.clipboard.writeText(generateCSV(rows, type))
                                        showToast('Đã copy!', 'success')
                                    }
                                    const handleExportCSV = (rows: any[], type: 'opened' | 'remaining') => {
                                        const csv = '\uFEFF' + generateCSV(rows, type)
                                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `li-xi-${type}-${new Date().toISOString().slice(0, 10)}.csv`
                                        a.click()
                                        URL.revokeObjectURL(url)
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {/* Sub-tabs */}
                                            <div className="flex bg-white/5 rounded-xl p-1 border border-yellow-500/10">
                                                {[
                                                    { id: 'opened', label: `🧧 Đã mở (${claimedEnvelopes.length})` },
                                                    { id: 'remaining', label: `📦 Còn lại (${unopenedEnvelopes.length})` },
                                                    { id: 'budget', label: '💰 Ngân sách' },
                                                ].map(st => (
                                                    <button
                                                        key={st.id}
                                                        onClick={() => setHistorySubTab(st.id as any)}
                                                        className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${historySubTab === st.id
                                                            ? 'bg-yellow-500/20 text-yellow-300 shadow-sm'
                                                            : 'text-yellow-200/40 hover:text-yellow-200/60'
                                                            }`}
                                                    >
                                                        {st.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* ── Sub-tab: Đã mở ── */}
                                            {historySubTab === 'opened' && (
                                                <div className="space-y-3">
                                                    {/* Stats row */}
                                                    {gameSession && claimedEnvelopes.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                                <p className="text-yellow-200/40 text-xs mb-1">Đã nhận</p>
                                                                <p className="text-yellow-300 font-bold text-base">{formatCurrency(claimedTotal)}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                                <p className="text-yellow-200/40 text-xs mb-1">Số người</p>
                                                                <p className="text-yellow-200 font-bold text-base">{uniqueUsers.length}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                                <p className="text-yellow-200/40 text-xs mb-1">TB/người</p>
                                                                <p className="text-yellow-200 font-bold text-base">{formatCurrency(avgPerUser)}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* View toggle + actions */}
                                                    {claimedEnvelopes.length > 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex bg-white/5 rounded-lg p-0.5">
                                                                <button onClick={() => setHistoryViewMode('card')} className={`px-3 py-1 text-xs rounded-md transition-all ${historyViewMode === 'card' ? 'bg-yellow-500/20 text-yellow-300' : 'text-yellow-200/40'}`}>
                                                                    Thẻ
                                                                </button>
                                                                <button onClick={() => setHistoryViewMode('table')} className={`px-3 py-1 text-xs rounded-md transition-all ${historyViewMode === 'table' ? 'bg-yellow-500/20 text-yellow-300' : 'text-yellow-200/40'}`}>
                                                                    Bảng
                                                                </button>
                                                            </div>
                                                            {historyViewMode === 'table' && (
                                                                <div className="flex gap-1.5">
                                                                    <button onClick={() => handleCopyTable(claimedEnvelopes, 'opened')} className="text-xs px-2.5 py-1 bg-white/10 text-yellow-200/60 rounded-lg hover:bg-white/15 transition-colors" title="Copy">
                                                                        📋 Copy
                                                                    </button>
                                                                    <button onClick={() => handleExportCSV(claimedEnvelopes, 'opened')} className="text-xs px-2.5 py-1 bg-green-700/40 text-green-200/80 rounded-lg hover:bg-green-600/50 transition-colors" title="Export CSV">
                                                                        📥 CSV
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Email status */}
                                                    {emailMsg && <p className="text-sm text-yellow-200/60 bg-white/5 rounded-xl px-4 py-3 border border-yellow-500/10">{emailMsg}</p>}

                                                    {/* Content: Card view or Table view (aggregated by email) */}
                                                    {claimedEnvelopes.length === 0 ? (
                                                        <p className="text-yellow-200/40 text-base text-center py-10">Chưa có ai nhận lộc</p>
                                                    ) : historyViewMode === 'table' ? (
                                                        <div className="overflow-x-auto rounded-xl border border-yellow-500/10">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-yellow-200/50 text-xs">
                                                                        <th className="px-3 py-2 text-left">#</th>
                                                                        <th className="px-3 py-2 text-left">Người nhận</th>
                                                                        <th className="px-3 py-2 text-right">Lộc</th>
                                                                        <th className="px-3 py-2 text-right">Lộc thêm</th>
                                                                        <th className="px-3 py-2 text-right">Tổng</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {aggregatedUsers.map((u, i) => (
                                                                        <tr key={u.email} className="border-t border-yellow-500/5 hover:bg-white/5 transition-colors">
                                                                            <td className="px-3 py-2 text-yellow-200/30">{i + 1}</td>
                                                                            <td className="px-3 py-2">
                                                                                <p className="text-yellow-200 text-sm truncate max-w-[150px]">{u.name}</p>
                                                                                <p className="text-yellow-200/25 text-[10px] truncate max-w-[150px] flex items-center gap-1">
                                                                                    {u.email}
                                                                                    {retryEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400/80 bg-green-500/10 px-1 rounded" title="Retry"><IconRetry /> R</span>}
                                                                                    {bonusEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-purple-400/80 bg-purple-500/10 px-1 rounded" title="Bonus"><IconBonus /> B</span>}
                                                                                </p>
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right text-yellow-300 font-medium">{u.locAmount > 0 ? formatCurrency(u.locAmount) : '-'}</td>
                                                                            <td className="px-3 py-2 text-right text-purple-300 font-medium">{u.bonusAmount > 0 ? formatCurrency(u.bonusAmount) : '-'}</td>
                                                                            <td className="px-3 py-2 text-right text-yellow-300 font-bold">{formatCurrency(u.total)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                                                            {aggregatedUsers.map((u) => (
                                                                <div key={u.email} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-yellow-200 text-sm font-medium truncate">{u.name}</p>
                                                                        <p className="text-yellow-200/30 text-xs truncate flex items-center gap-1">
                                                                            {u.email}
                                                                            {retryEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400/80 bg-green-500/10 px-1 rounded" title="Retry"><IconRetry /> R</span>}
                                                                            {bonusEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-purple-400/80 bg-purple-500/10 px-1 rounded" title="Bonus"><IconBonus /> B</span>}
                                                                        </p>
                                                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                                                            <span className="text-yellow-300/60">🧧 {formatCurrency(u.locAmount)}</span>
                                                                            {u.bonusAmount > 0 && <span className="text-purple-300/60">🎁 {formatCurrency(u.bonusAmount)}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-yellow-300 font-bold text-base">{formatCurrency(u.total)}</p>
                                                                        <p className="text-yellow-200/30 text-xs">
                                                                            {u.lastClaimedAt ? new Date(u.lastClaimedAt).toLocaleTimeString('vi-VN') : '-'}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleSendEmail(u.email, u.name, u.total)}
                                                                        disabled={emailSending === u.email}
                                                                        className="shrink-0 p-2 bg-blue-700/50 hover:bg-blue-600/60 text-blue-200 rounded-lg transition-colors disabled:opacity-40"
                                                                        title="Gửi email thông báo"
                                                                    >
                                                                        {emailSending === u.email ? <IconLoader /> : <IconSend />}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Sub-tab: Còn lại ── */}
                                            {historySubTab === 'remaining' && (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Số bao còn</p>
                                                            <p className="text-yellow-200 font-bold text-base">{unopenedEnvelopes.length}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Tổng giá trị</p>
                                                            <p className="text-yellow-300 font-bold text-base">{formatCurrency(unopenedTotal)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Denomination breakdown for remaining */}
                                                    {unopenedEnvelopes.length > 0 && (() => {
                                                        const denomMap: Record<number, number> = {}
                                                        unopenedEnvelopes.forEach((e: any) => { denomMap[e.amount] = (denomMap[e.amount] || 0) + 1 })
                                                        return (
                                                            <div className="flex gap-2 flex-wrap">
                                                                {Object.entries(denomMap).sort(([a], [b]) => +a - +b).map(([amt, cnt]) => (
                                                                    <span key={amt} className="text-xs bg-white/5 border border-yellow-500/10 rounded-lg px-3 py-1.5 text-yellow-200/50">
                                                                        {formatCurrency(+amt)} ×{cnt as number}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )
                                                    })()}

                                                    {/* Actions */}
                                                    {unopenedEnvelopes.length > 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex bg-white/5 rounded-lg p-0.5">
                                                                <button onClick={() => setHistoryViewMode('card')} className={`px-3 py-1 text-xs rounded-md transition-all ${historyViewMode === 'card' ? 'bg-yellow-500/20 text-yellow-300' : 'text-yellow-200/40'}`}>
                                                                    Thẻ
                                                                </button>
                                                                <button onClick={() => setHistoryViewMode('table')} className={`px-3 py-1 text-xs rounded-md transition-all ${historyViewMode === 'table' ? 'bg-yellow-500/20 text-yellow-300' : 'text-yellow-200/40'}`}>
                                                                    Bảng
                                                                </button>
                                                            </div>
                                                            {historyViewMode === 'table' && (
                                                                <div className="flex gap-1.5">
                                                                    <button onClick={() => handleCopyTable(unopenedEnvelopes, 'remaining')} className="text-xs px-2.5 py-1 bg-white/10 text-yellow-200/60 rounded-lg hover:bg-white/15 transition-colors">
                                                                        📋 Copy
                                                                    </button>
                                                                    <button onClick={() => handleExportCSV(unopenedEnvelopes, 'remaining')} className="text-xs px-2.5 py-1 bg-green-700/40 text-green-200/80 rounded-lg hover:bg-green-600/50 transition-colors">
                                                                        📥 CSV
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Content */}
                                                    {unopenedEnvelopes.length === 0 ? (
                                                        <p className="text-yellow-200/40 text-base text-center py-10">Tất cả đã được mở hết! 🎉</p>
                                                    ) : historyViewMode === 'table' ? (
                                                        <div className="overflow-x-auto rounded-xl border border-yellow-500/10">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-yellow-200/50 text-xs">
                                                                        <th className="px-3 py-2 text-left">#</th>
                                                                        <th className="px-3 py-2 text-right">Mệnh giá</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {unopenedEnvelopes
                                                                        .sort((a: any, b: any) => b.amount - a.amount)
                                                                        .map((e: any, i: number) => (
                                                                            <tr key={e.id} className="border-t border-yellow-500/5 hover:bg-white/5 transition-colors">
                                                                                <td className="px-3 py-2 text-yellow-200/30">{i + 1}</td>
                                                                                <td className="px-3 py-2 text-right text-yellow-300 font-medium">{formatCurrency(e.amount)}</td>
                                                                            </tr>
                                                                        ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                                            {unopenedEnvelopes
                                                                .sort((a: any, b: any) => b.amount - a.amount)
                                                                .map((e: any) => (
                                                                    <div key={e.id} className="bg-red-800/30 border border-yellow-500/10 rounded-xl p-2 text-center">
                                                                        <span className="text-lg">🧧</span>
                                                                        <p className="text-xs text-yellow-200/50 mt-0.5">{formatCurrency(e.amount)}</p>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Sub-tab: Ngân sách ── */}
                                            {historySubTab === 'budget' && (
                                                <div className="space-y-4">
                                                    {/* Budget overview cards */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Ngân sách</p>
                                                            <p className="text-yellow-300 font-bold text-base">{formatCurrency(gameSession?.budget || 0)}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Tổng lì xì phát ra</p>
                                                            <p className="text-yellow-200 font-bold text-base">{formatCurrency(allTotal)}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Đã nhận</p>
                                                            <p className="text-red-400 font-bold text-base">{formatCurrency(claimedTotal)}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10 text-center">
                                                            <p className="text-yellow-200/40 text-xs mb-1">Ngân sách dư</p>
                                                            <p className={`font-bold text-base ${(gameSession?.budget || 0) - allTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatCurrency((gameSession?.budget || 0) - allTotal)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Lộc thêm budget info */}
                                                    {gameSession?.bonusEnabled && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                                <p className="text-purple-200/50 text-xs mb-1">Ngân sách Lộc thêm ({gameSession.bonusBudgetPercent}%)</p>
                                                                <p className="text-purple-300 font-bold text-base">{formatCurrency(Math.round((gameSession.budget * gameSession.bonusBudgetPercent) / 100))}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                                <p className="text-purple-200/50 text-xs mb-1">Lộc thêm đã phát</p>
                                                                <p className="text-purple-300 font-bold text-base">
                                                                    {formatCurrency(gameSession.bonusGrants?.filter((g: any) => g.used && g.bonusAmount).reduce((s: number, g: any) => s + (g.bonusAmount || 0), 0) || 0)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Progress bar: total distributed vs budget */}
                                                    {gameSession && (
                                                        <div className="bg-white/5 rounded-xl p-3 border border-yellow-500/10">
                                                            <div className="flex justify-between text-xs text-yellow-200/40 mb-1.5">
                                                                <span>Phân phối: {allEnvelopes.length} bao = {formatCurrency(allTotal)}</span>
                                                                <span>{Math.round((allTotal / gameSession.budget) * 100)}% ngân sách</span>
                                                            </div>
                                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                                                {/* Claimed portion */}
                                                                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all" style={{ width: `${(claimedTotal / gameSession.budget) * 100}%` }} />
                                                                {/* Remaining portion */}
                                                                <div className="h-full bg-gradient-to-r from-yellow-500/30 to-yellow-300/30 transition-all" style={{ width: `${(unopenedTotal / gameSession.budget) * 100}%` }} />
                                                            </div>
                                                            <div className="flex gap-4 mt-2 text-[10px] text-yellow-200/40">
                                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Đã mở</span>
                                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400/30 inline-block" /> Chưa mở</span>
                                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/10 inline-block" /> Dư</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Denomination breakdown table */}
                                                    {allDenomBreakdown.length > 0 && (() => {
                                                        const mainEnvelopes = allEnvelopes.filter((e: any) => !e.isBonusEnvelope)
                                                        const bonusEnvelopes = allEnvelopes.filter((e: any) => e.isBonusEnvelope)
                                                        const targetMainCount = gameSession?.quantity ?? mainEnvelopes.length
                                                        const editTotal = editingDenoms
                                                            ? Object.entries(editDenomMap).reduce((s, [amt, cnt]) => s + (+amt) * cnt, 0)
                                                            : allTotal
                                                        // Main count only (what user is editing)
                                                        const editMainCount = editingDenoms
                                                            ? Object.values(editDenomMap).reduce((s, c) => s + c, 0)
                                                            : mainEnvelopes.length
                                                        // Full total = main + bonus (for display)
                                                        const editTotalCount = editMainCount + bonusEnvelopes.length
                                                        const countDelta = editMainCount - targetMainCount
                                                        const countMismatch = editingDenoms && countDelta !== 0
                                                        const budgetDelta = editTotal - (gameSession?.budget || 0)
                                                        return (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-yellow-200/40 text-xs">Phân phối mệnh giá</p>
                                                                    {!editingDenoms ? (
                                                                        <button onClick={() => {
                                                                            const map: Record<number, number> = {}
                                                                            allDenomBreakdown.forEach(d => { map[d.amount] = d.total })
                                                                            setEditDenomMap(map)
                                                                            setEditingDenoms(true)
                                                                        }} className="text-xs px-3 py-1 bg-white/10 text-yellow-200/60 rounded-lg hover:bg-white/15 transition-colors flex items-center gap-1.5">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                            </svg>
                                                                            Chỉnh
                                                                        </button>
                                                                    ) : (
                                                                        <div className="flex gap-1.5">
                                                                            <button onClick={handleApplyDenomEdit} disabled={budgetDelta > 0 || editMainCount === 0 || countMismatch}
                                                                                className="text-xs px-3 py-1 bg-green-700/60 text-green-200 rounded-lg hover:bg-green-600/70 transition-colors disabled:opacity-40 flex items-center gap-1">
                                                                                ✓ Áp dụng
                                                                            </button>
                                                                            <button onClick={() => setEditingDenoms(false)}
                                                                                className="text-xs px-3 py-1 bg-white/10 text-yellow-200/40 rounded-lg hover:bg-white/15 transition-colors">
                                                                                ✗ Huỷ
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="overflow-x-auto rounded-xl border border-yellow-500/10">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="bg-white/5 text-yellow-200/50 text-xs">
                                                                                <th className="px-3 py-2 text-left">Mệnh giá</th>
                                                                                <th className="px-3 py-2 text-center">Tổng</th>
                                                                                <th className="px-3 py-2 text-center">Đã mở</th>
                                                                                <th className="px-3 py-2 text-center">Còn lại</th>
                                                                                <th className="px-3 py-2 text-right">Giá trị</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {allDenomBreakdown.map(d => {
                                                                                const editVal = editDenomMap[d.amount] ?? d.total
                                                                                const displayTotal = editingDenoms ? editVal : d.total
                                                                                const displayRemaining = displayTotal - d.opened
                                                                                return (
                                                                                    <tr key={d.amount} className="border-t border-yellow-500/5">
                                                                                        <td className="px-3 py-2 text-yellow-200 font-medium">{formatCurrency(d.amount)}</td>
                                                                                        <td className="px-3 py-2 text-center">
                                                                                            {editingDenoms ? (
                                                                                                <input type="number" min={d.opened} step={1} value={editVal}
                                                                                                    onChange={e => setEditDenomMap(prev => ({ ...prev, [d.amount]: Math.max(d.opened, parseInt(e.target.value) || 0) }))}
                                                                                                    className="w-16 px-2 py-1 bg-white/10 border border-yellow-500/30 rounded-lg text-yellow-200 text-center text-sm focus:outline-none focus:border-yellow-400/60"
                                                                                                />
                                                                                            ) : (
                                                                                                <span className="text-yellow-200/60">{d.total}</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center text-yellow-300">{d.opened}</td>
                                                                                        <td className="px-3 py-2 text-center text-yellow-200/40">{displayRemaining}</td>
                                                                                        <td className="px-3 py-2 text-right text-yellow-300/80">{formatCurrency(d.amount * displayTotal)}</td>
                                                                                    </tr>
                                                                                )
                                                                            })}
                                                                            {/* Total row — shows main+bonus full total */}
                                                                            <tr className="border-t-2 border-yellow-500/20 bg-white/5 font-bold">
                                                                                <td className="px-3 py-2 text-yellow-200">Tổng</td>
                                                                                <td className={`px-3 py-2 text-center ${countMismatch ? 'text-red-400' : 'text-yellow-200'}`}>
                                                                                    {editTotalCount}
                                                                                    {countMismatch && <span className="text-red-400 text-[10px] ml-1">(chính: {editMainCount}/{targetMainCount})</span>}
                                                                                </td>
                                                                                <td className="px-3 py-2 text-center text-yellow-300">{claimedEnvelopes.length}</td>
                                                                                <td className="px-3 py-2 text-center text-yellow-200/60">{editTotalCount - claimedEnvelopes.length}</td>
                                                                                <td className="px-3 py-2 text-right text-yellow-300">{formatCurrency(editTotal)}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                {/* Info bar: Fixed / Bonus / Total */}
                                                                <div className="flex gap-3 text-[11px] text-yellow-200/40 px-1">
                                                                    <span>🧧 <span className="text-yellow-200/60">{editMainCount}</span> bao chính</span>
                                                                    {bonusEnvelopes.length > 0 && <span>🎁 <span className="text-purple-300/70">{bonusEnvelopes.length}</span> bonus</span>}
                                                                    <span className="text-yellow-200/60 font-medium">= {editTotalCount} tổng</span>
                                                                </div>
                                                                {/* Count mismatch warning */}
                                                                {countMismatch && (
                                                                    <div className="text-xs px-3 py-2 rounded-lg border bg-red-900/20 border-red-500/20 text-red-300">
                                                                        {countDelta > 0
                                                                            ? `⚠️ Thừa ${countDelta} bao chính! Tổng bao chính phải bằng ${targetMainCount}.`
                                                                            : `⚠️ Thiếu ${Math.abs(countDelta)} bao chính! Tổng bao chính phải bằng ${targetMainCount}.`}
                                                                    </div>
                                                                )}
                                                                {/* Budget warning in edit mode */}
                                                                {editingDenoms && budgetDelta !== 0 && (
                                                                    <div className={`text-xs px-3 py-2 rounded-lg border ${budgetDelta > 0 ? 'bg-red-900/20 border-red-500/20 text-red-300' : 'bg-green-900/20 border-green-500/20 text-green-300'}`}>
                                                                        {budgetDelta > 0
                                                                            ? `⚠️ Vượt ngân sách ${formatCurrency(budgetDelta)}! Giảm số lượng hoặc tăng ngân sách.`
                                                                            : `✓ Dư ngân sách ${formatCurrency(Math.abs(budgetDelta))}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}

                                {/* ====== LƯỢT CHƠI TAB ====== */}
                                {tab === 'retry' && (
                                    <div className="space-y-5">
                                        <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <p className="text-yellow-200/60 text-sm mb-1">Ngân sách còn dư</p>
                                            <p className="text-yellow-300 font-bold text-xl">{formatCurrency(remainingBudget)}</p>
                                        </div>

                                        {/* Sub-tabs: Retry / Bonus */}
                                        <div className="flex bg-white/5 rounded-xl p-1 border border-yellow-500/10">
                                            {[
                                                { id: 'retry' as RetrySubTab, label: `Retry (${gameSession?.retryGrants?.length || 0})`, icon: <IconRetry /> },
                                                { id: 'bonus' as RetrySubTab, label: `Lộc thêm (${gameSession?.bonusGrants?.length || 0})`, icon: <IconBonus /> },
                                            ].map(st => (
                                                <button
                                                    key={st.id}
                                                    onClick={() => setRetrySubTab(st.id)}
                                                    className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${retrySubTab === st.id
                                                        ? 'bg-yellow-500/20 text-yellow-300 shadow-sm'
                                                        : 'text-yellow-200/40 hover:text-yellow-200/60'
                                                        }`}
                                                >
                                                    {st.icon} {st.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* ── Sub-tab: Retry ── */}
                                        {retrySubTab === 'retry' && (
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-yellow-200/60 text-sm mb-2">Email người nhận retry</label>
                                                    <div className="flex gap-3">
                                                        <input type="email" value={retryEmail} onChange={e => setRetryEmail(e.target.value)}
                                                            placeholder="user@example.com"
                                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/50 placeholder-yellow-200/20"
                                                        />
                                                        <button onClick={handleGrantRetry} disabled={!retryEmail || !gameSession}
                                                            className="px-5 py-2.5 bg-green-700/80 hover:bg-green-600/80 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors"
                                                        >
                                                            Cấp
                                                        </button>
                                                    </div>
                                                    {retryMsg && <p className="text-sm mt-2 text-yellow-200/60">{retryMsg}</p>}
                                                </div>

                                                {/* Quick grant from user list */}
                                                <div>
                                                    <p className="text-yellow-200/60 text-sm mb-2">Người đã nhận lộc</p>
                                                    {uniqueUsers.length === 0 ? (
                                                        <p className="text-yellow-200/30 text-sm text-center py-6">Chưa có</p>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                                            {uniqueUsers.map(u => (
                                                                <div key={u.email} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-yellow-500/10">
                                                                    <div>
                                                                        <p className="text-yellow-200 text-sm font-medium">{u.name}</p>
                                                                        <p className="text-yellow-200/25 text-xs flex items-center gap-1">
                                                                            {u.email} · {u.count} lượt
                                                                            {retryEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400/80 bg-green-500/10 px-1 rounded"><IconRetry /> R</span>}
                                                                            {bonusEmailSet.has(u.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-purple-400/80 bg-purple-500/10 px-1 rounded"><IconBonus /> B</span>}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => { setRetryEmail(u.email); handleGrantRetry() }}
                                                                        className="text-xs px-3 py-1.5 bg-green-700/60 hover:bg-green-600/60 text-green-200 rounded-lg transition-colors"
                                                                    >
                                                                        +Retry
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Active retry grants */}
                                                {gameSession?.retryGrants?.length > 0 && (
                                                    <div>
                                                        <p className="text-yellow-200/60 text-sm mb-2">Retry đã cấp</p>
                                                        <div className="space-y-1.5">
                                                            {gameSession.retryGrants.map((g: any) => (
                                                                <div key={g.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-yellow-500/10 text-sm group">
                                                                    <span className="text-yellow-200/70 truncate">{g.userEmail}</span>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <span className={g.used ? 'text-red-400' : 'text-green-400'}>{g.used ? 'Đã dùng' : 'Chờ dùng'}</span>
                                                                        <button
                                                                            onClick={() => handleDeleteRetryGrant(g.id)}
                                                                            className="text-red-400/40 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                                                                            title="Xoá retry grant"
                                                                        >
                                                                            <IconTrash />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── Sub-tab: Bonus ── */}
                                        {retrySubTab === 'bonus' && (
                                            <div className="space-y-4">
                                                {/* Bonus budget info */}
                                                {gameSession?.bonusEnabled && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                            <p className="text-purple-200/50 text-xs mb-1">NS Lộc thêm ({gameSession.bonusBudgetPercent}%)</p>
                                                            <p className="text-purple-300 font-bold text-base">{formatCurrency(Math.round((gameSession.budget * gameSession.bonusBudgetPercent) / 100))}</p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                            <p className="text-purple-200/50 text-xs mb-1">Đã phát</p>
                                                            <p className="text-purple-300 font-bold text-base">
                                                                {formatCurrency(gameSession.bonusGrants?.filter((g: any) => g.used && g.bonusAmount).reduce((s: number, g: any) => s + (g.bonusAmount || 0), 0) || 0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Manual bonus grant */}
                                                <div>
                                                    <label className="block text-yellow-200/60 text-sm mb-2">Email người nhận bonus</label>
                                                    <div className="flex gap-3">
                                                        <input type="email" value={bonusEmail} onChange={e => setBonusEmail(e.target.value)}
                                                            placeholder="user@example.com"
                                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400/50 placeholder-yellow-200/20"
                                                        />
                                                        <button onClick={handleGrantBonus} disabled={!bonusEmail || !gameSession}
                                                            className="px-5 py-2.5 bg-purple-700/80 hover:bg-purple-600/80 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors"
                                                        >
                                                            Cấp
                                                        </button>
                                                    </div>
                                                    {bonusMsg && <p className="text-sm mt-2 text-yellow-200/60">{bonusMsg}</p>}
                                                </div>

                                                {/* Summary + List */}
                                                {gameSession?.bonusGrants?.length > 0 && (
                                                    <>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                                <p className="text-purple-200/50 text-xs mb-1">Tổng</p>
                                                                <p className="text-purple-300 font-bold text-base">{gameSession.bonusGrants.length}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                                <p className="text-purple-200/50 text-xs mb-1">Đã dùng</p>
                                                                <p className="text-purple-300 font-bold text-base">{gameSession.bonusGrants.filter((g: any) => g.used).length}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-3 border border-purple-500/15 text-center">
                                                                <p className="text-purple-200/50 text-xs mb-1">Chờ dùng</p>
                                                                <p className="text-green-400 font-bold text-base">{gameSession.bonusGrants.filter((g: any) => !g.used).length}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                                                            {gameSession.bonusGrants.map((g: any) => (
                                                                <div key={g.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-purple-500/10 text-sm group">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-yellow-200/70 truncate">{g.userEmail}</p>
                                                                        {g.used && g.bonusAmount != null && (
                                                                            <p className="text-purple-300/60 text-xs">Nhận: {formatCurrency(g.bonusAmount)}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <span className={g.used ? 'text-purple-400' : 'text-green-400'}>
                                                                            {g.used ? 'Đã dùng' : 'Chờ dùng'}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleDeleteBonusGrant(g.id)}
                                                                            className="text-red-400/40 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                                                                            title="Xoá bonus grant"
                                                                        >
                                                                            <IconTrash />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}

                                                {!gameSession?.bonusGrants?.length && (
                                                    <p className="text-yellow-200/30 text-sm text-center py-4">Chưa có bonus grant nào.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ====== SIMULATE TAB ====== */}
                                {tab === 'simulate' && (
                                    <div className="space-y-5">
                                        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-amber-200/80 text-sm">
                                                <IconBeaker />
                                                <span>Chế độ giả lập cho phép admin test việc mở bao lì xì với email giả lập</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-yellow-200/60 text-sm mb-2">Email giả lập</label>
                                            <div className="flex gap-2">
                                                <input type="email" value={simEmail} onChange={e => setSimEmail(e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/50"
                                                />
                                                <button onClick={handleSimTestEmail} disabled={!simEmail}
                                                    className="shrink-0 px-4 py-2 bg-blue-700/60 hover:bg-blue-600/70 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors flex items-center gap-2"
                                                    title="Gửi email thử không liên quan đến quỹ">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                                    Gửi email thử
                                                </button>
                                            </div>
                                            <p className="text-white/25 text-xs mt-1">Nhấn “Gửi email thử” để xem trước nội dung email mà không cần mở bao lì xì thật.</p>
                                        </div>

                                        {simResult && (
                                            <div className="bg-white/5 rounded-xl p-4 border border-yellow-500/10 text-sm text-yellow-200/70">
                                                {simResult}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-yellow-200/60 text-sm mb-2">Bao lì xì chưa mở ({gameSession?.envelopes?.filter((e: any) => !e.isOpened).length || 0})</p>
                                            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                                                {gameSession?.envelopes
                                                    ?.filter((e: any) => !e.isOpened)
                                                    .slice(0, 30)
                                                    .map((e: any) => (
                                                        <button
                                                            key={e.id}
                                                            onClick={() => handleSimulate(e.id)}
                                                            className="p-3 bg-red-800/40 hover:bg-red-700/60 border border-yellow-500/15 rounded-xl text-center transition-colors group"
                                                        >
                                                            <span className="text-2xl">🧧</span>
                                                            <p className="text-xs text-yellow-200/40 group-hover:text-yellow-200/70 mt-1 font-medium">
                                                                {formatCurrency(e.amount)}
                                                            </p>
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ====== EMAILS TAB ====== */}
                                {tab === 'emails' && (
                                    <div className="space-y-5">
                                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-blue-200/80 text-sm">
                                                <IconShield />
                                                <span>Chỉ email trong danh sách này mới được tham gia hái lộc sau khi đăng nhập SSO.</span>
                                            </div>
                                        </div>

                                        {/* Paste area */}
                                        <div>
                                            <label className="block text-yellow-200/60 text-sm mb-2">
                                                Paste danh sách email (dấu phẩy, dấu chấm phẩy, hoặc xuống dòng)
                                            </label>
                                            <textarea
                                                value={pasteInput}
                                                onChange={e => setPasteInput(e.target.value)}
                                                rows={4}
                                                placeholder={"user1@ntq.com.vn\nuser2@ntq.com.vn\nuser3@ntq.com.vn"}
                                                className="w-full px-4 py-3 bg-white/5 border border-yellow-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/50 placeholder-yellow-200/15 resize-none font-mono"
                                            />
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={handleAddEmails}
                                                    disabled={!pasteInput.trim()}
                                                    className="px-5 py-2.5 bg-green-700/80 hover:bg-green-600/80 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors flex items-center gap-2"
                                                >
                                                    <IconPlus /> Thêm email
                                                </button>
                                                {addMsg && <p className="text-sm text-yellow-200/60">{addMsg}</p>}
                                            </div>
                                        </div>

                                        {/* Current list with search + bulk actions */}
                                        <div>
                                            {/* Filter buttons */}
                                            <div className="flex bg-white/5 rounded-xl p-1 border border-yellow-500/10 mb-3">
                                                {[
                                                    { id: 'all' as EmailFilter, label: `Tất cả (${allowedEmails.length})` },
                                                    { id: 'retry' as EmailFilter, label: `Retry (${allowedEmails.filter(e => retryEmailSet.has(e.email)).length})`, icon: <IconRetry /> },
                                                    { id: 'bonus' as EmailFilter, label: `Bonus (${allowedEmails.filter(e => bonusEmailSet.has(e.email)).length})`, icon: <IconBonus /> },
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => { setEmailFilter(f.id); setEmailPage(0) }}
                                                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${emailFilter === f.id
                                                            ? 'bg-yellow-500/20 text-yellow-300 shadow-sm'
                                                            : 'text-yellow-200/40 hover:text-yellow-200/60'
                                                            }`}
                                                    >
                                                        {f.icon} {f.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-yellow-200/60 text-sm">
                                                    Danh sách email ({filteredEmails.length}{emailSearch || emailFilter !== 'all' ? ` / ${allowedEmails.length}` : ''})
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    {selectedIds.size > 0 && (
                                                        <button
                                                            onClick={handleBulkDelete}
                                                            className="text-xs px-2.5 py-1 bg-red-700/60 hover:bg-red-600/60 text-red-200 rounded-lg transition-colors"
                                                        >
                                                            Xoá {selectedIds.size} đã chọn
                                                        </button>
                                                    )}
                                                    {allowedEmails.length > 0 && (
                                                        <button
                                                            onClick={() => setConfirmDeleteAll(true)}
                                                            className="text-xs px-2.5 py-1 bg-red-900/40 hover:bg-red-800/60 text-red-300/60 rounded-lg transition-colors"
                                                            title="Xoá tất cả"
                                                        >
                                                            Xoá hết
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={fetchAllowedEmails}
                                                        className="text-yellow-200/40 hover:text-yellow-200 transition-colors p-1"
                                                        title="Làm mới"
                                                    >
                                                        <IconRefresh />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Search bar */}
                                            {allowedEmails.length > 10 && (
                                                <input
                                                    type="text"
                                                    value={emailSearch}
                                                    onChange={e => { setEmailSearch(e.target.value); setEmailPage(0) }}
                                                    placeholder="Tìm email..."
                                                    className="w-full px-3 py-2 mb-2 bg-white/5 border border-yellow-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400/40 placeholder-yellow-200/20"
                                                />
                                            )}

                                            {allowedLoading ? (
                                                <div className="flex items-center justify-center py-8 text-yellow-200/40">
                                                    <IconLoader />
                                                    <span className="ml-2 text-sm">Đang tải...</span>
                                                </div>
                                            ) : allowedEmails.length === 0 ? (
                                                <p className="text-yellow-200/30 text-sm text-center py-8">
                                                    Chưa có email nào. Mọi người đều có thể tham gia.
                                                </p>
                                            ) : (
                                                <>
                                                    {/* Select all for current page */}
                                                    <label className="flex items-center gap-2 mb-1.5 cursor-pointer text-yellow-200/40 text-xs hover:text-yellow-200/60">
                                                        <input
                                                            type="checkbox"
                                                            checked={pagedEmails.length > 0 && pagedEmails.every(e => selectedIds.has(e.id))}
                                                            onChange={e => {
                                                                setSelectedIds(prev => {
                                                                    const next = new Set(prev)
                                                                    pagedEmails.forEach(em => e.target.checked ? next.add(em.id) : next.delete(em.id))
                                                                    return next
                                                                })
                                                            }}
                                                            className="accent-yellow-500 rounded"
                                                        />
                                                        Chọn tất cả trang này
                                                    </label>
                                                    <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
                                                        {pagedEmails.map(entry => (
                                                            <div key={entry.id} className="email-row-virtual flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-yellow-500/10 group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.has(entry.id)}
                                                                    onChange={e => {
                                                                        setSelectedIds(prev => {
                                                                            const next = new Set(prev)
                                                                            e.target.checked ? next.add(entry.id) : next.delete(entry.id)
                                                                            return next
                                                                        })
                                                                    }}
                                                                    className="accent-yellow-500 rounded flex-shrink-0"
                                                                />
                                                                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                                                    <p className="text-yellow-200 text-sm truncate">{entry.email}</p>
                                                                    {retryEmailSet.has(entry.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400/80 bg-green-500/10 px-1 rounded shrink-0" title="Có Retry"><IconRetry /></span>}
                                                                    {bonusEmailSet.has(entry.email) && <span className="inline-flex items-center gap-0.5 text-[9px] text-purple-400/80 bg-purple-500/10 px-1 rounded shrink-0" title="Có Bonus"><IconBonus /></span>}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteEmail(entry.id)}
                                                                    className="text-red-400/40 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                                    title="Xoá"
                                                                >
                                                                    <IconTrash />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Pagination */}
                                                    {totalPages > 1 && (
                                                        <div className="flex items-center justify-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => setEmailPage(p => Math.max(0, p - 1))}
                                                                disabled={emailPage === 0}
                                                                className="text-xs px-2 py-1 bg-white/10 text-yellow-200/60 rounded disabled:opacity-30"
                                                            >
                                                                ←
                                                            </button>
                                                            <span className="text-yellow-200/40 text-xs">
                                                                {emailPage + 1} / {totalPages}
                                                            </span>
                                                            <button
                                                                onClick={() => setEmailPage(p => Math.min(totalPages - 1, p + 1))}
                                                                disabled={emailPage >= totalPages - 1}
                                                                className="text-xs px-2 py-1 bg-white/10 text-yellow-200/60 rounded disabled:opacity-30"
                                                            >
                                                                →
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Background Tab ── */}
                                {tab === 'background' && (
                                    <div className="space-y-5">
                                        <p className="text-yellow-200/60 text-sm mb-3">Chọn hình nền cho trang chính:</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {BACKGROUNDS.map(bg => (
                                                <button
                                                    key={bg.key}
                                                    onClick={() => onBgChange?.(bg.key)}
                                                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 text-left ${currentBg === bg.key
                                                        ? 'border-yellow-400 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400/30'
                                                        : 'border-white/10 hover:border-yellow-500/40'
                                                        }`}
                                                >
                                                    <div className="aspect-[16/7] relative">
                                                        {bg.src ? (
                                                            <img
                                                                src={bg.src}
                                                                alt={bg.label}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-b from-[#3D0000] via-[#5D0000] to-[#2D0000]" />
                                                        )}
                                                        {bg.src && <div className={`absolute inset-0 ${bg.overlay}`} />}
                                                        {currentBg === bg.key && (
                                                            <div className="absolute top-2 right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-red-900">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`px-4 py-2.5 text-sm font-medium ${currentBg === bg.key ? 'text-yellow-300' : 'text-yellow-200/50'
                                                        }`}>
                                                        {bg.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-yellow-200/30 text-xs">
                                            Nền sẽ được lưu và áp dụng ngay cho tất cả mọi người.
                                        </p>

                                        {/* Auto-rotate interval */}
                                        <div className="mt-4 bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                            <p className="text-yellow-200/60 text-sm mb-3">⏱️ Tự đổi nền sau (giây):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {[0, 10, 20, 30, 60].map(sec => (
                                                    <button
                                                        key={sec}
                                                        onClick={() => onBgRotateChange?.(sec)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${bgRotateInterval === sec
                                                            ? 'bg-yellow-500 text-red-900 shadow-lg shadow-yellow-500/20'
                                                            : 'bg-white/10 text-yellow-200/50 hover:bg-white/15 hover:text-yellow-200/80'
                                                            }`}
                                                    >
                                                        {sec === 0 ? 'Tắt' : `${sec}s`}
                                                    </button>
                                                ))}
                                            </div>
                                            {bgRotateInterval > 0 && (
                                                <p className="text-yellow-200/40 text-xs mt-2">
                                                    🔄 Đang tự đổi nền mỗi {bgRotateInterval} giây
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ====== DONATE TAB ====== */}
                                {tab === 'donate' && (() => {
                                    const donateTotal = donors.reduce((s, d) => s + d.amount, 0)

                                    const saveDonor = async () => {
                                        if (!donateForm.name || !donateForm.email || !donateForm.amount) return
                                        setAdminLoading(true)
                                        setAdminLoadingText(editDonorId ? 'Đang cập nhật...' : 'Đang thêm...')
                                        try {
                                            const res = await fetch('/api/donate', {
                                                method: editDonorId ? 'PATCH' : 'POST',
                                                headers: { 'Content-Type': 'application/json', 'x-admin-auth': 'true' },
                                                body: JSON.stringify({ id: editDonorId, ...donateForm, amount: Number(donateForm.amount.replace(/[^0-9]/g, '')) }),
                                            })
                                            const data = await res.json()
                                            if (!res.ok) { showToast(data.error || 'Lỗi', 'error'); return }
                                            showToast(editDonorId ? 'Đã cập nhật!' : 'Đã thêm!', 'success')
                                            setDonateForm({ name: '', email: '', amount: '', note: '' })
                                            setEditDonorId(null)
                                            const r2 = await fetch('/api/donate', { headers: { 'x-admin-auth': 'true' } })
                                            const d2 = await r2.json()
                                            setDonors(d2.donors || [])
                                        } finally { setAdminLoading(false) }
                                    }

                                    const deleteDonor = async (id: string) => {
                                        setAdminLoading(true); setAdminLoadingText('Đang xoá...')
                                        try {
                                            await fetch('/api/donate', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-auth': 'true' }, body: JSON.stringify({ id }) })
                                            setDonors(prev => prev.filter(d => d.id !== id))
                                            showToast('Đã xoá!', 'success')
                                        } finally { setAdminLoading(false) }
                                    }

                                    return (
                                        <div className="space-y-5">
                                            {/* Total */}
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <p className="text-yellow-200/60 text-xs">Tổng quỹ donate</p>
                                                    <p className="text-yellow-300 font-extrabold text-2xl">{formatCurrency(donateTotal)}</p>
                                                    <p className="text-yellow-200/40 text-xs">{donors.length} người đóng góp</p>
                                                </div>
                                                <button onClick={() => { setBudgetSource('donate'); setTab('setup'); showToast('Đã chọn nguồn donate làm ngân sách!', 'success') }}
                                                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 text-sm font-medium rounded-xl transition-all">
                                                    Dùng làm ngân sách →
                                                </button>
                                            </div>

                                            {/* Visibility settings */}
                                            {([
                                                { key: 'showPublicView', label: 'Hiển thị cho mọi người', desc: 'Cho phép user thường xem danh sách donate' },
                                                { key: 'showContributorView', label: 'Thống kê cho contributor', desc: 'Hiển thị prize stats & winners cho người donate' },
                                            ] as const).map(({ key, label, desc }) => (
                                                <div key={key} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-yellow-500/10">
                                                    <div>
                                                        <p className="text-yellow-200 text-sm font-medium">{label}</p>
                                                        <p className="text-yellow-200/35 text-xs">{desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            const newVal = !donateSettings[key]
                                                            setDonateSettings(prev => ({ ...prev, [key]: newVal }))
                                                            try {
                                                                await fetch('/api/donate/settings', {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json', 'x-admin-auth': 'true' },
                                                                    body: JSON.stringify({ [key]: newVal }),
                                                                })
                                                                showToast(newVal ? 'Đã bật!' : 'Đã tắt!', 'success')
                                                            } catch {
                                                                // revert on error
                                                                setDonateSettings(prev => ({ ...prev, [key]: !newVal }))
                                                                showToast('Lỗi kết nối', 'error')
                                                            }
                                                        }}
                                                        className={`relative w-12 h-6 rounded-full transition-colors ${donateSettings[key] ? 'bg-yellow-500' : 'bg-white/15'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${donateSettings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add/Edit form */}
                                            <div className="bg-white/5 border border-yellow-500/10 rounded-xl p-4 space-y-3">
                                                <p className="text-yellow-300/80 text-sm font-semibold">{editDonorId ? '✏️ Sửa donate' : '➕ Thêm người donate'}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input placeholder="Tên *" value={donateForm.name} onChange={e => setDonateForm(f => ({ ...f, name: e.target.value }))}
                                                        className="px-3 py-2 bg-white/5 border border-yellow-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400/50 col-span-2" />
                                                    <input placeholder="Email *" value={donateForm.email} onChange={e => setDonateForm(f => ({ ...f, email: e.target.value }))}
                                                        className="px-3 py-2 bg-white/5 border border-yellow-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400/50" />
                                                    <input placeholder="Số tiền (VNĐ) *" inputMode="numeric"
                                                        value={donateForm.amount ? Number(donateForm.amount.replace(/[^0-9]/g, '')).toLocaleString('vi-VN') : ''}
                                                        onChange={e => {
                                                            const raw = e.target.value.replace(/[^0-9]/g, '')
                                                            setDonateForm(f => ({ ...f, amount: raw }))
                                                        }}
                                                        className="px-3 py-2 bg-white/5 border border-yellow-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400/50" />
                                                    <input placeholder="Ghi chú (tuỳ chọn)" value={donateForm.note} onChange={e => setDonateForm(f => ({ ...f, note: e.target.value }))}
                                                        className="px-3 py-2 bg-white/5 border border-yellow-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400/50 col-span-2" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={saveDonor} disabled={!donateForm.name || !donateForm.email || !donateForm.amount}
                                                        className="flex-1 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-950 font-bold rounded-lg text-sm transition-all disabled:opacity-40">
                                                        {editDonorId ? 'Cập nhật' : 'Thêm'}
                                                    </button>
                                                    {editDonorId && (
                                                        <button onClick={() => { setEditDonorId(null); setDonateForm({ name: '', email: '', amount: '', note: '' }) }}
                                                            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/60 rounded-lg text-sm transition-all">
                                                            Huỷ
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Donor list */}
                                            {donateLoading ? (
                                                <div className="flex justify-center py-6"><TetLoading text="Đang tải..." /></div>
                                            ) : donors.length === 0 ? (
                                                <p className="text-center text-yellow-200/30 text-sm py-6">Chưa có ai donate 💰</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {donors.map(d => (
                                                        <div key={d.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-yellow-500/10 group">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm font-medium truncate">{d.name}</p>
                                                                <p className="text-white/40 text-xs truncate">{d.email}{d.note ? ` · ${d.note}` : ''}</p>
                                                            </div>
                                                            <span className="text-yellow-300 font-bold text-sm shrink-0">{formatCurrency(d.amount)}</span>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditDonorId(d.id); setDonateForm({ name: d.name, email: d.email, amount: String(d.amount), note: d.note || '' }) }}
                                                                    className="w-7 h-7 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center text-blue-300 transition-colors text-xs">✏</button>
                                                                <button onClick={() => deleteDonor(d.id)}
                                                                    className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors">
                                                                    <IconTrash />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmModal
                open={confirmDeleteAll}
                title="Xoá tất cả email?"
                message="Hành động này sẽ xoá toàn bộ danh sách email đã thêm. Không thể hoàn tác!"
                confirmText="Xoá hết"
                cancelText="Huỷ bỏ"
                variant="danger"
                onConfirm={handleDeleteAll}
                onCancel={() => setConfirmDeleteAll(false)}
            />

            <ConfirmModal
                open={showResetConfirm}
                title="Reset phiên hái lộc?"
                message="Tất cả bao lì xì sẽ được mở lại, retry/bonus grants sẽ được đặt lại về trạng thái ban đầu. Không thể hoàn tác!"
                confirmText="Reset"
                cancelText="Huỷ bỏ"
                variant="danger"
                onConfirm={async () => {
                    setShowResetConfirm(false)
                    setAdminLoadingText('Đang reset phiên...')
                    setAdminLoading(true)
                    try {
                        const res = await fetch('/api/game/reset', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId: gameSession?.id }),
                        })
                        if (res.ok) {
                            showToast('Đã reset phiên thành công!', 'success')
                            onSessionCreated()
                        } else {
                            const d = await res.json()
                            showToast(d.error || 'Lỗi reset', 'error')
                        }
                    } catch {
                        showToast('Lỗi kết nối', 'error')
                    } finally {
                        setAdminLoading(false)
                    }
                }}
                onCancel={() => setShowResetConfirm(false)}
            />
        </>
    )
}
