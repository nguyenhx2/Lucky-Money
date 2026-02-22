'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { EnvelopeCard } from '@/components/EnvelopeCard'
import { LoginButton } from '@/components/LoginButton'
import { LoginGate } from '@/components/LoginGate'
import { AccessDenied } from '@/components/AccessDenied'
import { FloatingLiXi } from '@/components/FloatingLiXi'
import { TetLoading } from '@/components/TetLoading'
import { Countdown, useCountdownComplete } from '@/components/Countdown'
import { AlreadyPicked } from '@/components/AlreadyPicked'
import { useToast } from '@/components/TetToast'
import { EnvelopeGrid } from '@/components/EnvelopeGrid'
import { BACKGROUNDS } from '@/lib/backgrounds'

// Dynamic imports for heavy components (React best practice)
const ResultModal = dynamic(() => import('@/components/ResultModal').then(m => ({ default: m.ResultModal })), { ssr: false })
const AdminOverlay = dynamic(() => import('@/components/AdminOverlay').then(m => ({ default: m.AdminOverlay })), { ssr: false })
const TetAudioPlayer = dynamic(() => import('@/components/TetAudioPlayer'), { ssr: false })
const DonateBadge = dynamic(() => import('@/components/DonateBadge').then(m => ({ default: m.DonateBadge })), { ssr: false })

interface EnvelopeData {
    id: string
    amount: number
    isOpened: boolean
    imageUrl: string | null
    wish?: string | null
    thiepUrl?: string | null
    claimedBy: string | null
    claimedByEmail: string | null
    claimedAt: string | null
    positionTop: number
    positionLeft: number
    positionDelay: number
    isBonusEnvelope: boolean
}

interface RetryGrant {
    id: string
    userEmail: string
    used: boolean
}

interface BonusGrant {
    id: string
    userEmail: string
    used: boolean
    bonusAmount?: number | null
    bonusImageUrl?: string | null
    bonusWish?: string | null
    bonusThiepUrl?: string | null
}

interface GameSessionData {
    id: string
    budget: number
    quantity: number
    isActive: boolean
    startAt: string | null
    maxPicksPerUser: number
    autoplayMusic?: boolean
    bgKey?: string
    bgRotateInterval?: number
    timezone?: string
    bonusEnabled?: boolean
    bonusBudgetPercent?: number
    retryPercent?: number
    envelopes: EnvelopeData[]
    retryGrants: RetryGrant[]
    bonusGrants: BonusGrant[]
}

// Mobile detection: check once at module level (no listener needed)
const IS_MOBILE = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches

// Memoized petal data — reduced based on device
const PETAL_COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches ? 6 : 15
const PETALS = Array.from({ length: PETAL_COUNT }, (_, i) => ({
    left: `${(i * 6.8 + 3) % 100}%`,
    size: 8 + (i % 5) * 4,
    delay: `${(i * 0.8) % 8}s`,
    duration: `${8 + (i % 5) * 2}s`,
    opacity: 0.3 + (i % 4) * 0.15,
    char: i % 3 === 0 ? '🌸' : i % 3 === 1 ? '❀' : '✿',
}))

// Memoized petal layer
const PetalLayer = memo(function PetalLayer() {
    return (
        <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
            {PETALS.map((petal, i) => (
                <div
                    key={`petal-${i}`}
                    className="petal"
                    style={{
                        left: petal.left,
                        fontSize: `${petal.size}px`,
                        animationDelay: petal.delay,
                        opacity: petal.opacity,
                        ['--fall-duration' as string]: petal.duration,
                    }}
                >
                    {petal.char}
                </div>
            ))}
        </div>
    )
})

// Ambient glow layer
const AmbientGlows = memo(function AmbientGlows() {
    // Skip heavy blur filters on mobile to reduce GPU load
    if (IS_MOBILE) return null
    return (
        <>
            <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-500 rounded-full blur-[100px] opacity-[0.08] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-500 rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-pink-400 rounded-full blur-[80px] opacity-[0.05] pointer-events-none" />
        </>
    )
})

// ── Click Effects: subtle sakura petals — click + gentle hover trail ──
const CLICK_CHARS = ['🌸', '❀', '✿', '🪙']
const HOVER_CHARS = ['✧', '·', '✦']
interface ClickParticle { id: number; x: number; y: number; char: string; dx: number; dy: number; scale: number; opacity: number }

const ClickEffects = memo(function ClickEffects() {
    const [particles, setParticles] = useState<ClickParticle[]>([])
    const idRef = useRef(0)
    const lastMoveRef = useRef(0)

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            // Skip click particles on touch-only devices to avoid unnecessary renders
            if (IS_MOBILE) return
            const count = 3 + Math.floor(Math.random() * 2) // 3-4 particles
            const newP: ClickParticle[] = []
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.8
                const dist = 25 + Math.random() * 45
                newP.push({
                    id: ++idRef.current,
                    x: e.clientX, y: e.clientY,
                    char: CLICK_CHARS[Math.floor(Math.random() * CLICK_CHARS.length)],
                    dx: Math.cos(angle) * dist,
                    dy: Math.sin(angle) * dist - 20,
                    scale: 0.6 + Math.random() * 0.8,
                    opacity: 0.15 + Math.random() * 0.25,
                })
            }
            setParticles(prev => [...prev.slice(-15), ...newP])
            setTimeout(() => setParticles(prev => prev.filter(p => !newP.includes(p))), 1400)
        }

        // Subtle hover trail — 1 tiny particle every 80ms on move
        const onMove = (e: MouseEvent) => {
            const now = Date.now()
            if (now - lastMoveRef.current < 80) return
            lastMoveRef.current = now

            const angle = Math.random() * Math.PI * 2
            const p: ClickParticle = {
                id: ++idRef.current,
                x: e.clientX, y: e.clientY,
                char: HOVER_CHARS[Math.floor(Math.random() * HOVER_CHARS.length)],
                dx: Math.cos(angle) * 15,
                dy: -10 - Math.random() * 15,
                scale: 0.4 + Math.random() * 0.3,
                opacity: 0.08 + Math.random() * 0.07,
            }
            setParticles(prev => [...prev.slice(-20), p])
            setTimeout(() => setParticles(prev => prev.filter(pp => pp !== p)), 1000)
        }

        document.addEventListener('click', onClick)
        // Only add hover trail on devices with a pointer (not touch-only)
        const hasHover = window.matchMedia('(hover: hover)').matches
        if (hasHover) {
            document.addEventListener('mousemove', onMove, { passive: true })
        }
        return () => {
            document.removeEventListener('click', onClick)
            if (hasHover) document.removeEventListener('mousemove', onMove)
        }
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="click-particle"
                    style={{
                        left: p.x, top: p.y,
                        ['--dx' as string]: `${p.dx}px`,
                        ['--dy' as string]: `${p.dy}px`,
                        ['--p-scale' as string]: p.scale,
                        opacity: p.opacity,
                        fontSize: p.scale < 0.6 ? '10px' : '16px',
                    }}
                >
                    {p.char}
                </div>
            ))}
        </div>
    )
})

// ── Music Ambient: firework-style music notes bursting softly ──
const MUSIC_NOTES = ['🎵', '🎶', '♪', '♫', '✨']
interface MusicNote { id: number; x: string; y: string; char: string; dx: number; dy: number; size: number; opacity: number }

const MusicAmbientEffects = memo(function MusicAmbientEffects({ isPlaying }: { isPlaying: boolean }) {
    const [notes, setNotes] = useState<MusicNote[]>([])
    const idRef = useRef(0)

    useEffect(() => {
        if (!isPlaying) { setNotes([]); return }

        const burst = () => {
            // Pick a random position on the screen edges
            const edge = Math.floor(Math.random() * 4)
            let x: string, y: string
            if (edge === 0) { x = `${10 + Math.random() * 80}%`; y = '95%' } // bottom
            else if (edge === 1) { x = '3%'; y = `${20 + Math.random() * 60}%` } // left
            else if (edge === 2) { x = '97%'; y = `${20 + Math.random() * 60}%` } // right
            else { x = `${10 + Math.random() * 80}%`; y = '5%' } // top

            const count = 2 + Math.floor(Math.random() * 3) // 2-4 notes burst
            const newNotes: MusicNote[] = []
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.6
                newNotes.push({
                    id: ++idRef.current,
                    x, y,
                    char: MUSIC_NOTES[Math.floor(Math.random() * MUSIC_NOTES.length)],
                    dx: Math.cos(angle) * (30 + Math.random() * 50),
                    dy: Math.sin(angle) * (30 + Math.random() * 50) - 40,
                    size: 14 + Math.random() * 10,
                    opacity: 0.15 + Math.random() * 0.2,
                })
            }
            setNotes(prev => [...prev.slice(-20), ...newNotes])
            setTimeout(() => setNotes(prev => prev.filter(n => !newNotes.includes(n))), 3500)
        }

        const interval = setInterval(burst, 2500 + Math.random() * 2000)
        burst()
        return () => clearInterval(interval)
    }, [isPlaying])

    // Skip entirely on mobile — saves re-renders that stutter audio
    if (IS_MOBILE) return null
    if (!isPlaying || notes.length === 0) return null
    return (
        <div className="fixed inset-0 pointer-events-none z-[6] overflow-hidden">
            {notes.map(n => (
                <span
                    key={n.id}
                    className="music-note-burst"
                    style={{
                        left: n.x, top: n.y,
                        fontSize: `${n.size}px`,
                        opacity: n.opacity,
                        ['--ndx' as string]: `${n.dx}px`,
                        ['--ndy' as string]: `${n.dy}px`,
                    }}
                >
                    {n.char}
                </span>
            ))}
        </div>
    )
})

// ── Music Prompt Bubble: appears from bottom-left, auto-dismisses ──
const MusicPromptBubble = memo(function MusicPromptBubble({ autoplay }: { autoplay: boolean }) {
    const [show, setShow] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        // Show once per session (not localStorage — always show on fresh page load)
        const showTimer = setTimeout(() => setShow(true), 1500)
        const hideTimer = setTimeout(() => {
            setShow(false)
            setDismissed(true)
        }, 10000)
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
    }, [])

    const handleDismiss = () => {
        setShow(false)
        setDismissed(true)
    }

    if (dismissed) return null

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.85 }}
                    animate={{
                        opacity: 1, y: 0, scale: 1,
                        rotate: autoplay ? [0, -2, 2, -1.5, 1, 0] : 0,
                    }}
                    exit={{ opacity: 0, y: 15, scale: 0.9 }}
                    transition={{
                        type: 'spring', damping: 20, stiffness: 250,
                        rotate: autoplay ? { duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' } : undefined,
                    }}
                    className="fixed bottom-[3.75rem] left-4 z-[55]"
                >
                    {autoplay ? (
                        /* Autoplay ON: same as before */
                        <div
                            className="relative bg-gradient-to-br from-red-800 to-red-900 backdrop-blur-lg rounded-2xl px-5 py-4 border border-yellow-500/30 shadow-xl shadow-red-950/60 cursor-pointer whitespace-nowrap"
                            onClick={handleDismiss}
                        >
                            <p className="text-yellow-100 text-sm font-medium">
                                🎶 Nhấn vào trang để <span className="text-yellow-300 font-semibold">bật nhạc Xuân</span>
                            </p>
                            <p className="text-yellow-200/40 text-xs mt-1.5">🎧 Đeo tai nghe để trải nghiệm tốt nhất</p>
                        </div>
                    ) : (
                        /* Autoplay OFF: arrow tooltip pointing at play button */
                        <div
                            className="relative bg-gradient-to-br from-yellow-900/95 to-yellow-950/95 backdrop-blur-lg rounded-2xl px-4 py-3 border border-yellow-500/40 shadow-xl shadow-yellow-950/60 cursor-pointer"
                            onClick={handleDismiss}
                        >
                            <p className="text-yellow-100 text-sm font-medium whitespace-nowrap flex items-center gap-1.5">
                                Nhấn
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                                    <svg className="w-2.5 h-2.5 text-yellow-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </span>
                                để nghe nhạc Tết
                            </p>
                            <p className="text-yellow-200/50 text-xs mt-1">🎧 Đeo tai nghe để hay hơn</p>
                            {/* Arrow pointing down-left toward play button */}
                            <svg
                                className="absolute -bottom-7 left-3 w-8 h-8 text-yellow-400/80 animate-bounce"
                                viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10 L8 26 M8 26 L3 20 M8 26 L13 20" />
                            </svg>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
})

export default function Home() {
    const { data: session } = useSession()
    const [gameSession, setGameSession] = useState<GameSessionData | null>(null)
    const [showAdmin, setShowAdmin] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [claimedAmount, setClaimedAmount] = useState<number | null>(null)
    const [claimedImage, setClaimedImage] = useState<string | null>(null)
    const [claimedWish, setClaimedWish] = useState<string | null>(null)
    const [claimedThiep, setClaimedThiep] = useState<string | null>(null)
    // Bonus round state
    const [hasBonusRound, setHasBonusRound] = useState(false)
    const [showBonusReveal, setShowBonusReveal] = useState(false)
    const [bonusAmount, setBonusAmount] = useState<number | null>(null)
    const [bonusImage, setBonusImage] = useState<string | null>(null)
    const [bonusWish, setBonusWish] = useState<string | null>(null)
    const [bonusThiep, setBonusThiep] = useState<string | null>(null)
    const [isClaimingBonus, setIsClaimingBonus] = useState(false)
    const [hasRetryAvailable, setHasRetryAvailable] = useState(false)
    const [retryLoading, setRetryLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [musicPlaying, setMusicPlaying] = useState(false)
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null) // null = checking
    const [isClaiming, setIsClaiming] = useState(false)
    const isClaimingRef = useRef(false)
    // Server time offset (ms): serverTime - clientTime
    const [serverTimeOffset, setServerTimeOffset] = useState(0)
    // Scroll-aware header blur: transparent at top, soft blur when scrolled
    const [isScrolled, setIsScrolled] = useState(false)

    const { showToast } = useToast()

    // Track scroll position for header blur effect
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 30)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Background state (from game session DB — applies to all users)
    const [bgKey, setBgKey] = useState('default')
    const [bgRotateInterval, setBgRotateInterval] = useState(0) // 0 = off
    useEffect(() => {
        if (gameSession) {
            if (gameSession.bgKey) setBgKey(gameSession.bgKey)
            if (gameSession.bgRotateInterval !== undefined) setBgRotateInterval(gameSession.bgRotateInterval)
        }
    }, [gameSession?.id])
    const handleBgChange = useCallback(async (key: string) => {
        setBgKey(key)
        if (gameSession?.id) {
            try {
                await fetch('/api/game', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: gameSession.id, bgKey: key, adminAuth: true }),
                })
            } catch { /* silent */ }
        }
    }, [gameSession?.id])
    const handleBgRotateChange = useCallback(async (seconds: number) => {
        setBgRotateInterval(seconds)
        if (gameSession?.id) {
            try {
                await fetch('/api/game', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: gameSession.id, bgRotateInterval: seconds, adminAuth: true }),
                })
            } catch { /* silent */ }
        }
    }, [gameSession?.id])
    const activeBg = useMemo(() => BACKGROUNDS.find(b => b.key === bgKey) || BACKGROUNDS[0], [bgKey])

    // Auto-rotate backgrounds
    useEffect(() => {
        if (bgRotateInterval <= 0) return
        const timer = setInterval(() => {
            setBgKey(prev => {
                const idx = BACKGROUNDS.findIndex(b => b.key === prev)
                const next = BACKGROUNDS[(idx + 1) % BACKGROUNDS.length]
                return next.key
            })
        }, bgRotateInterval * 1000)
        return () => clearInterval(timer)
    }, [bgRotateInterval])

    // Dynamic countdown target
    const countdownTarget = useMemo(
        () => gameSession?.startAt ? new Date(gameSession.startAt) : null,
        [gameSession?.startAt]
    )
    const countdownComplete = useCountdownComplete(countdownTarget, serverTimeOffset)

    // Find ALL user picks (non-bonus only — bonus is passed separately)
    const userPicks = useMemo(() => {
        if (!session?.user?.email || !gameSession) return []
        return gameSession.envelopes.filter(
            e => e.isOpened && e.claimedByEmail === session.user!.email && !e.isBonusEnvelope
        )
    }, [session?.user?.email, gameSession])

    // Check if user has remaining picks — retry does NOT add picks (it replaces)
    const canPick = useMemo(() => {
        if (!session?.user?.email || !gameSession) return false
        return userPicks.length < gameSession.maxPicksPerUser
    }, [session?.user?.email, gameSession, userPicks])

    // Check if user has a pending (unused) bonus grant
    const hasPendingBonus = useMemo(() => {
        if (!session?.user?.email || !gameSession) return false
        return gameSession.bonusGrants?.some(
            (g: any) => g.userEmail === session.user!.email && !g.used
        ) || false
    }, [session?.user?.email, gameSession])

    // Fetch active game session
    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch('/api/game')
            if (res.ok) {
                const data = await res.json()
                setGameSession(data.session)
                // Calculate server-client time offset for accurate countdown
                if (data.serverNow) {
                    const serverTime = new Date(data.serverNow).getTime()
                    const clientTime = Date.now()
                    setServerTimeOffset(serverTime - clientTime)
                }
            }
        } catch (err) {
            console.error('Failed to fetch session:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSession() }, [fetchSession])

    // Polling: refresh game state every 5s while tab is visible
    // Uses refs to avoid re-creating interval on every state change
    const fetchSessionRef = useRef(fetchSession)
    fetchSessionRef.current = fetchSession

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null

        const startPolling = () => {
            if (timer) return
            timer = setInterval(() => {
                if (!isClaimingRef.current) fetchSessionRef.current()
            }, 5000)
        }

        const stopPolling = () => {
            if (timer) { clearInterval(timer); timer = null }
        }

        const handleVisibility = () => {
            if (document.hidden) {
                stopPolling()
            } else {
                fetchSessionRef.current() // Immediate refresh when tab becomes visible
                startPolling()
            }
        }

        startPolling()
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            stopPolling()
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, []) // Empty deps — stable interval, refs handle latest values

    // Check allowed email list
    useEffect(() => {
        if (!session?.user?.email) {
            setIsAllowed(null)
            return
        }
        (async () => {
            try {
                const res = await fetch('/api/allowed-emails')
                const data = await res.json()
                const emails: { email: string }[] = data.emails || []
                if (emails.length === 0) {
                    setIsAllowed(true) // no list = everyone allowed
                } else {
                    setIsAllowed(emails.some(e => e.email === session.user!.email!.toLowerCase()))
                }
            } catch {
                setIsAllowed(true) // fail open
            }
        })()
    }, [session?.user?.email])

    // Admin shortcut: Ctrl+Shift+G
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
                e.preventDefault()
                setShowAdmin(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Handle envelope click
    const handleEnvelopeClick = useCallback(async (envelope: EnvelopeData) => {
        if (!session) {
            signIn('google')
            return
        }
        if (envelope.isOpened || isClaiming) return

        setIsClaiming(true)
        isClaimingRef.current = true

        // Optimistic UI: immediately hide the envelope in local state
        setGameSession(prev => {
            if (!prev) return prev
            return {
                ...prev,
                envelopes: prev.envelopes.map(e =>
                    e.id === envelope.id ? { ...e, isOpened: true } : e
                ),
            }
        })

        try {
            const res = await fetch('/api/game/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ envelopeId: envelope.id }),
            })
            const data = await res.json()
            if (!res.ok) {
                // Revert optimistic update on error
                fetchSession()
                if (data.code === 'ALREADY_OPENED') {
                    showToast('Bao lì xì này đã được người khác mở rồi! 🎉', 'error')
                } else if (data.code === 'RETRY') {
                    showToast('Có người vừa rút trước, hãy chọn bao khác nhé! 🧧', 'error')
                } else {
                    showToast(data.error || 'Lỗi khi mở bao lì xì', 'error')
                }
                return
            }
            setClaimedAmount(data.amount)
            setClaimedImage(data.imageUrl || envelope.imageUrl)
            setClaimedWish(data.wish || null)
            setClaimedThiep(data.thiepUrl || null)
            setHasBonusRound(!!data.hasBonusRound)
            setHasRetryAvailable(!!data.hasRetryAvailable)
            setShowResult(true)
            fetchSession()
        } catch (err) {
            console.error('Failed to claim:', err)
            fetchSession() // Revert optimistic update
            showToast('Lỗi kết nối server', 'error')
        } finally {
            setIsClaiming(false)
            isClaimingRef.current = false
        }
    }, [session, fetchSession, isClaiming, showToast])

    // ─── Bonus Claim Handler ───
    const handleBonusClaim = useCallback(async () => {
        if (isClaimingBonus) return
        setIsClaimingBonus(true)
        try {
            const res = await fetch('/api/game/bonus-claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            const data = await res.json()
            if (res.ok) {
                setBonusAmount(data.amount)
                setBonusImage(data.imageUrl)
                setBonusWish(data.wish)
                setBonusThiep(data.thiepUrl)
                // Close the first-draw modal so only the bonus result is shown
                setShowResult(false)
                setShowBonusReveal(true)
                fetchSession()
            } else {
                showToast(data.error || 'Lỗi bonus', 'error')
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
        } finally {
            setIsClaimingBonus(false)
        }
    }, [isClaimingBonus, fetchSession, showToast])

    const handleRetryUse = useCallback(async () => {
        // Show loading overlay immediately
        setRetryLoading(true)
        setShowResult(false)
        setClaimedAmount(null)
        setClaimedImage(null)
        setClaimedWish(null)
        setClaimedThiep(null)
        setHasBonusRound(false)
        setHasRetryAvailable(false)

        // Optimistic: clear user's claim from local state so AlreadyPicked won't flash
        setGameSession(prev => {
            if (!prev || !session?.user?.email) return prev
            return {
                ...prev,
                envelopes: prev.envelopes.map(e =>
                    e.claimedByEmail === session.user!.email && !e.isBonusEnvelope
                        ? { ...e, isOpened: false, claimedByEmail: null, claimedBy: null, claimedAt: null }
                        : e
                ),
            }
        })

        try {
            const res = await fetch('/api/game/retry-use', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            if (res.ok) {
                await fetchSession()
                showToast('Hãy chọn bao lì xì mới!', 'success')
            } else {
                const data = await res.json()
                showToast(data.error || 'Lỗi', 'error')
                await fetchSession()
            }
        } catch {
            showToast('Lỗi kết nối', 'error')
            await fetchSession()
        } finally {
            setRetryLoading(false)
        }
    }, [fetchSession, showToast, session])

    // ─── Retry Skip Handler — keep current pick, mark retry as skipped, trigger email ───
    const handleRetrySkip = useCallback(async () => {
        try {
            await fetch('/api/game/retry-skip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
        } catch {
            // Fire-and-forget — don't block UI
        }
    }, [])

    const availableEnvelopes = useMemo(
        () => gameSession?.envelopes.filter(e => !e.isOpened && !e.isBonusEnvelope) || [],
        [gameSession]
    )

    return (
        <main className={`relative w-full min-h-screen text-white ${activeBg.src ? '' : 'bg-gradient-to-b from-[#3D0000] via-[#5D0000] to-[#2D0000]'}`}>
            {/* Tết pattern overlay on default gradient */}
            {!activeBg.src && (
                <div className="fixed inset-0 z-0 opacity-[0.06] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            )}
            {/* Background Image with blur + slow morph crossfade — fixed position */}
            {BACKGROUNDS.filter(b => b.src).map(bg => (
                <img
                    key={bg.key}
                    src={bg.src!}
                    alt="Background"
                    className="fixed inset-0 w-full h-full object-cover z-0"
                    style={{
                        opacity: activeBg.key === bg.key ? 1 : 0,
                        filter: activeBg.key === bg.key ? 'blur(2px) brightness(0.85)' : 'blur(12px) brightness(0.7)',
                        transform: activeBg.key === bg.key ? 'scale(1.02)' : 'scale(1.08)',
                        transition: 'opacity 3s cubic-bezier(0.4,0,0.2,1), filter 3.5s ease-out, transform 4s ease-out',
                    }}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                />
            ))}
            {/* Overlay for readability */}
            {activeBg.src && <div className={`fixed inset-0 z-[1] ${activeBg.overlay}`} />}

            {/* Floating lì xì background effect */}
            <FloatingLiXi />

            <PetalLayer />
            <AmbientGlows />
            <ClickEffects />
            <MusicAmbientEffects isPlaying={musicPlaying} />

            {/* Music prompt bubble */}
            <MusicPromptBubble autoplay={gameSession?.autoplayMusic !== false} />

            {/* Header — sticky with traditional wooden frame border */}
            <header
                className={`sticky top-0 z-[25] relative pt-5 sm:pt-6 pb-4 sm:pb-5 text-center pointer-events-none transition-all duration-500 ${activeBg.headerBg}`}
                style={isScrolled ? { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } : undefined}
            >
                {/* Two stacked h1 layers cross-fade so there is no repaint jitter on bg switch */}
                <div className="relative inline-block">
                    {/* Layer 1 — gold gradient (default gradient bg) */}
                    <h1
                        className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight font-[family-name:var(--font-dancing)] italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 text-shadow-gold"
                        style={{ opacity: activeBg.src ? 0 : 1, transition: 'opacity 1.5s ease' }}
                        aria-hidden={!!activeBg.src}
                    >
                        Hái Lộc Đầu Xuân
                    </h1>
                    {/* Layer 2 — white-glow red text for image backgrounds */}
                    <h1
                        className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight font-[family-name:var(--font-dancing)] italic absolute inset-0 text-red-800 [text-shadow:_0_0_8px_white,_0_0_16px_white,_0_2px_4px_rgba(0,0,0,0.3)]"
                        style={{ opacity: activeBg.src ? 1 : 0, transition: 'opacity 1.5s ease' }}
                        aria-hidden={!activeBg.src}
                    >
                        Hái Lộc Đầu Xuân
                    </h1>
                </div>
            </header>

            {/* Action Buttons — Login & Donate */}
            {session && (
                <>
                    {/* Desktop position */}
                    <div className="hidden sm:flex fixed top-4 right-4 z-[50] items-center gap-2">
                        <DonateBadge visible={true} />
                        <LoginButton />
                    </div>
                    {/* Mobile position */}
                    <div className="flex sm:hidden fixed bottom-4 right-4 z-[50] items-center gap-2">
                        <DonateBadge visible={true} />
                        <LoginButton />
                    </div>
                </>
            )}
            {
                !session ? (
                    <LoginGate />
                ) : isAllowed === null ? (
                    <div className="absolute inset-0 z-40 flex items-center justify-center">
                        <TetLoading text="Đang kiểm tra quyền truy cập..." />
                    </div>
                ) : isAllowed === false ? (
                    <AccessDenied email={session.user?.email || undefined} />
                ) : !countdownComplete && gameSession?.startAt ? (
                    <div className="fixed inset-0 z-[35] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <Countdown targetDate={new Date(gameSession.startAt)} serverTimeOffset={serverTimeOffset} onComplete={fetchSession} />
                    </div>
                ) : userPicks.length > 0 && !canPick ? (
                    <AlreadyPicked
                        picks={userPicks.map(p => ({ amount: p.amount, imageUrl: p.imageUrl, claimedAt: p.claimedAt, wish: p.wish, thiepUrl: p.thiepUrl }))}
                        bonus={(() => {
                            const bg = gameSession?.bonusGrants?.find(
                                (g: any) => g.userEmail === session?.user?.email && g.used && g.bonusAmount
                            )
                            return bg ? { amount: bg.bonusAmount!, imageUrl: bg.bonusImageUrl, wish: bg.bonusWish, thiepUrl: bg.bonusThiepUrl } : null
                        })()}
                        hasPendingBonus={hasPendingBonus}
                        onBonusClaim={handleBonusClaim}
                        isClaimingBonus={isClaimingBonus}
                    />
                ) : (
                    <EnvelopeGrid
                        gameSession={gameSession}
                        availableEnvelopes={availableEnvelopes}
                        loading={loading}
                        onEnvelopeClick={handleEnvelopeClick}
                    />
                )
            }

            {/* All envelopes opened message */}
            {
                gameSession && availableEnvelopes.length === 0 && !showResult && countdownComplete && (
                    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-center p-8 bg-gradient-to-b from-red-800 to-red-900 border-2 border-yellow-500/60 rounded-2xl shadow-2xl max-w-sm mx-4">
                            <div className="text-5xl mb-4">🎊</div>
                            <h2 className="text-3xl font-bold text-yellow-300 mb-2 text-shadow-gold">
                                Hết Lì Xì Rồi!
                            </h2>
                            <p className="text-yellow-100/70">Chúc mọi người năm mới an khang thịnh vượng!</p>
                        </div>
                    </div>
                )
            }

            {/* Claiming loading overlay */}
            <AnimatePresence>
                {isClaiming && (
                    <motion.div
                        className="fixed inset-0 z-[45] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-6xl mb-6"
                        >
                            🧧
                        </motion.div>
                        <p className="text-yellow-300 text-lg font-semibold animate-pulse">Đang mở ra may mắn của bạn...</p>
                        <p className="text-yellow-200/40 text-sm mt-2">✨ Hãy chờ một chút ✨</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Retry Loading Overlay */}
            {
                retryLoading && (
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full mb-4"
                        />
                        <p className="text-yellow-300 text-lg font-semibold">Đang chuẩn bị lộc mới...</p>
                        <p className="text-yellow-200/50 text-sm mt-1">Hãy chờ chút nhé!</p>
                    </motion.div>
                )
            }

            {/* Result Modal */}
            {
                showResult && claimedAmount && (
                    <ResultModal
                        amount={claimedAmount}
                        imageUrl={claimedImage}
                        wish={claimedWish}
                        thiepUrl={claimedThiep}
                        hasBonusRound={hasBonusRound}
                        hasRetryAvailable={hasRetryAvailable}
                        isClaimingBonus={isClaimingBonus}
                        onBonusClaim={handleBonusClaim}
                        onRetryUse={handleRetryUse}
                        onRetrySkip={handleRetrySkip}
                        onClose={() => {
                            setShowResult(false)
                            setClaimedAmount(null)
                            setClaimedImage(null)
                            setClaimedWish(null)
                            setClaimedThiep(null)
                            setHasBonusRound(false)
                            setHasRetryAvailable(false)
                        }}
                    />
                )
            }

            {/* Bonus Result Modal */}
            {
                showBonusReveal && bonusAmount && (
                    <ResultModal
                        amount={bonusAmount}
                        imageUrl={bonusImage}
                        wish={bonusWish}
                        thiepUrl={bonusThiep}
                        isBonus={true}
                        onClose={() => {
                            setShowBonusReveal(false)
                            setBonusAmount(null)
                            setBonusImage(null)
                            setBonusWish(null)
                            setBonusThiep(null)
                        }}
                    />
                )
            }

            {/* Audio player */}
            <TetAudioPlayer autoplay={gameSession?.autoplayMusic !== false} onPlayingChange={setMusicPlaying} />

            {/* Admin Overlay */}
            {
                showAdmin && (
                    <AdminOverlay
                        onClose={() => setShowAdmin(false)}
                        onSessionCreated={fetchSession}
                        gameSession={gameSession}
                        currentBg={bgKey}
                        onBgChange={handleBgChange}
                        bgRotateInterval={bgRotateInterval}
                        onBgRotateChange={handleBgRotateChange}
                    />
                )
            }
        </main >
    )
}
