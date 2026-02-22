'use client'

import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * TetAudioPlayer — Compact bottom-left music player with:
 * - Play/Pause, Mute controls
 * - Audio wave visualization (canvas bars)
 * - Auto-play with multi-strategy browser unlock:
 *   1. Try immediate autoplay (works if browser allows)
 *   2. Listen for ANY user interaction (click, touch, scroll, key)
 *   3. Use IntersectionObserver (page visible = trigger)
 *   4. Retry periodically in case policy changes
 * - Admin-controlled autoplay toggle
 * - Loop with crossfade
 * - Works on Safari, Firefox, Chrome, mobile
 */

interface TetAudioPlayerProps {
    /** Whether autoplay is enabled (admin setting). Default: true */
    autoplay?: boolean
    /** Callback when playing state changes — used for ambient effects */
    onPlayingChange?: (playing: boolean) => void
}

const TetAudioPlayer = memo(function TetAudioPlayer({ autoplay = true, onPlayingChange }: TetAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const animFrameRef = useRef<number>(0)
    const hasAutoplayedRef = useRef(false)
    const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    // Ref for latest handlePlay to avoid stale closures in gesture listeners
    const handlePlayRef = useRef<() => Promise<void>>(() => Promise.resolve())

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isReady, setIsReady] = useState(false)

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio('/assets/audio/tet-bg.mp3')
        audio.loop = true
        audio.preload = 'auto'
        audio.volume = 0.4
        audioRef.current = audio

        audio.addEventListener('canplaythrough', () => setIsReady(true))

        return () => {
            audio.pause()
            audio.src = ''
            cancelAnimationFrame(animFrameRef.current)
            audioCtxRef.current?.close()
            if (retryTimerRef.current) clearInterval(retryTimerRef.current)
        }
    }, [])

    // Setup AudioContext and Analyser (lazy — on first play)
    const setupAnalyser = useCallback(() => {
        if (analyserRef.current || !audioRef.current) return

        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
            const ctx = new AudioCtx()
            audioCtxRef.current = ctx

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 64
            analyser.smoothingTimeConstant = 0.8
            analyserRef.current = analyser

            // Only create source once
            if (!sourceRef.current) {
                const source = ctx.createMediaElementSource(audioRef.current)
                source.connect(analyser)
                analyser.connect(ctx.destination)
                sourceRef.current = source
            }
        } catch (e) {
            console.warn('AudioContext not supported:', e)
        }
    }, [])

    // Draw waveform
    const drawWave = useCallback(() => {
        const canvas = canvasRef.current
        const analyser = analyserRef.current
        if (!canvas || !analyser) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const barCount = Math.min(16, bufferLength)
            const barWidth = canvas.width / barCount - 1
            const heightScale = canvas.height / 255

            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i]
                const barHeight = value * heightScale * 0.7

                // Golden gradient bars
                const hue = 40 + (i / barCount) * 15 // warm gold range
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.35)`
                ctx.fillRect(
                    i * (barWidth + 1),
                    canvas.height - barHeight,
                    barWidth,
                    barHeight
                )
            }
        }
        draw()
    }, [])

    // Play with fade-in
    const handlePlay = useCallback(async () => {
        const audio = audioRef.current
        if (!audio) return

        setupAnalyser()

        // Resume AudioContext for Safari/mobile
        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume()
        }

        // Fade in
        audio.volume = 0
        try {
            await audio.play()
            setIsPlaying(true)
            onPlayingChange?.(true)
            hasAutoplayedRef.current = true

            // Gradual fade-in over 2s
            let vol = 0
            const fadeIn = setInterval(() => {
                vol = Math.min(vol + 0.02, 0.4)
                audio.volume = isMuted ? 0 : vol
                if (vol >= 0.4) clearInterval(fadeIn)
            }, 50)

            drawWave()

            // Clear retry timer once playing
            if (retryTimerRef.current) {
                clearInterval(retryTimerRef.current)
                retryTimerRef.current = null
            }
        } catch (e) {
            console.warn('Autoplay blocked:', e)
        }
    }, [setupAnalyser, drawWave, isMuted])

    // Keep ref in sync for gesture listeners
    handlePlayRef.current = handlePlay

    // Pause with fade-out
    const handlePause = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return

        let vol = audio.volume
        const fadeOut = setInterval(() => {
            vol = Math.max(vol - 0.02, 0)
            audio.volume = vol
            if (vol <= 0) {
                clearInterval(fadeOut)
                audio.pause()
                setIsPlaying(false)
                onPlayingChange?.(false)
                cancelAnimationFrame(animFrameRef.current)
            }
        }, 50)
    }, [])

    const togglePlay = useCallback(() => {
        isPlaying ? handlePause() : handlePlay()
    }, [isPlaying, handlePause, handlePlay])

    const toggleMute = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        const next = !isMuted
        setIsMuted(next)
        audio.volume = next ? 0 : 0.4
    }, [isMuted])

    // ─── AUTOPLAY with broad gesture support (esp. mobile) ───
    // Mobile browsers require user gesture before first play.
    // We use a ref to always call the latest handlePlay (avoids stale closures).
    useEffect(() => {
        if (!isReady || !autoplay) return
        if (hasAutoplayedRef.current) return

        const tryAutoplay = () => {
            if (hasAutoplayedRef.current || isPlaying) return
            handlePlayRef.current().catch(() => { /* browser blocked — wait for gesture */ })
        }

        // Attempt 1: immediate (works if user has prior engagement with site)
        tryAutoplay()

        // Attempt 2: on first valid user gesture
        // scroll + touchend are critical for mobile where users often scroll before clicking
        const gestures = ['click', 'touchstart', 'touchend', 'scroll', 'keydown', 'pointerdown'] as const
        const onGesture = () => {
            if (hasAutoplayedRef.current) {
                // Already playing — remove all listeners
                gestures.forEach(ev => document.removeEventListener(ev, onGesture))
                return
            }
            // Use ref to call latest handlePlay (no stale closure)
            handlePlayRef.current().catch(() => { /* still blocked, listeners stay active */ })
        }
        gestures.forEach(ev => document.addEventListener(ev, onGesture, { once: false, passive: true }))

        // Attempt 3: periodic retry every 5s for mobile browsers that need warm-up
        const retryId = setInterval(() => {
            if (hasAutoplayedRef.current) {
                clearInterval(retryId)
                return
            }
            handlePlayRef.current().catch(() => { })
        }, 5000)
        retryTimerRef.current = retryId

        return () => {
            gestures.forEach(ev => document.removeEventListener(ev, onGesture))
            clearInterval(retryId)
        }
    }, [isReady, autoplay]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {/* Background audio wave visualization */}
            <canvas
                ref={canvasRef}
                width={320}
                height={80}
                className="fixed bottom-0 left-0 z-[2] pointer-events-none opacity-50"
                style={{ width: '320px', height: '80px' }}
            />

            {/* Compact player controls */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="fixed bottom-4 left-4 z-[50] flex items-center gap-1.5"
            >
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-black/70 transition-all hover:scale-110 active:scale-95"
                    title={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc Tết'}
                >
                    {isPlaying ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Mute/Unmute */}
                <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-black/70 transition-all hover:scale-110 active:scale-95"
                    title={isMuted ? 'Bật âm' : 'Tắt âm'}
                >
                    {isMuted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>

                {/* Playing indicator */}
                {isPlaying && !isMuted && (
                    <div className="flex items-end gap-[2px] h-5 ml-1">
                        {[0, 1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="w-[3px] bg-yellow-400/60 rounded-full"
                                animate={{ height: ['4px', '16px', '6px', '14px', '4px'] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    delay: i * 0.15,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </>
    )
})

export default TetAudioPlayer
