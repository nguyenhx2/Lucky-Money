'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TetLoading } from '@/components/TetLoading'
import { formatCurrency } from '@/lib/distribute'

interface Donor { id: string; name: string; email: string; amount?: number; note?: string }
interface PrizeStat { amount: number; total: number; opened: number; remaining: number }
interface Winner { claimedBy: string; claimedByEmail: string | null; amount: number; claimedAt: string | null; isBonus: boolean }
interface PublicData {
    isContributor: boolean
    total: number
    count: number
    donors: Donor[]
    session?: {
        budget: number
        budgetSource: string
        totalClaimed: number
        pickCount: number
        totalEnvelopes: number
        prizeStats: PrizeStat[]
        winners: Winner[]
    } | null
}
interface Settings {
    showPublicView: boolean
    showContributorView: boolean
}

interface Props { onClose: () => void }

const PALETTE = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f97316']

const LockedPlaceholder = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-5xl">🔒</span>
        <p className="text-yellow-200/50 text-sm text-center">Thông tin chưa được công bố</p>
        <p className="text-yellow-200/25 text-xs text-center">Admin sẽ mở khoá sau</p>
    </div>
)

export const DonateModal: React.FC<Props> = ({ onClose }) => {
    const [data, setData] = useState<PublicData | null>(null)
    const [settings, setSettings] = useState<Settings>({ showPublicView: true, showContributorView: true })
    const [loading, setLoading] = useState(true)
    const [statsTab, setStatsTab] = useState<'distribution' | 'winners'>('distribution')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [dataRes, settingsRes] = await Promise.all([
                fetch('/api/donate/public'),
                fetch('/api/donate/settings'),
            ])
            if (dataRes.ok) setData(await dataRes.json())
            if (settingsRes.ok) setSettings(await settingsRes.json())
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    // Determine what to show based on settings + role
    const isContributor = data?.isContributor ?? false
    const shouldShowContent = isContributor ? true : settings.showPublicView
    const shouldShowContributorStats = isContributor && settings.showContributorView

    const allTotal = data?.session?.prizeStats.reduce((s, p) => s + (p.amount * p.total), 0) || 0
    const unopenedTotal = data?.session?.prizeStats.reduce((s, p) => s + (p.amount * p.remaining), 0) || 0

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { if (e.target === e.currentTarget) onClose() }}
            >
                <motion.div
                    className="relative w-full sm:max-w-lg bg-gradient-to-b from-[#1a0800]/97 to-[#0d0500]/97 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl border border-yellow-500/25 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-yellow-500/15 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <div>
                                <h2 className="text-yellow-300 font-bold text-base leading-tight">Quỹ Lì Xì</h2>
                                <p className="text-yellow-200/40 text-xs">Nguồn ngân sách từ donate</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <TetLoading text="Đang tải danh sách..." />
                            </div>
                        ) : !shouldShowContent ? (
                            <LockedPlaceholder />
                        ) : !data ? (
                            <p className="text-center text-yellow-200/50 py-12">Không có dữ liệu</p>
                        ) : (
                            <div className="p-5 space-y-5">
                                {/* Total budget banner */}
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                                    <p className="text-yellow-200/60 text-xs mb-1">Tổng quỹ donate</p>
                                    <p className="text-yellow-300 font-extrabold text-3xl">{formatCurrency(data.total)}</p>
                                    <p className="text-yellow-200/40 text-xs mt-1">{data.count} người đóng góp</p>
                                </div>

                                {/* Donor list */}
                                <div>
                                    <h3 className="text-yellow-300/80 text-xs font-semibold uppercase tracking-wider mb-1">Danh sách đóng góp</h3>
                                    <p className="text-white/40 text-[11px] mt-1 mb-3 bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg leading-relaxed">
                                        Chân thành cảm ơn những anh/chị em dưới đây đã nhiệt tình đóng góp để xây dựng quỹ lì xì đầu xuân dành cho tất cả mọi người! 🎁❤️
                                    </p>
                                    <div className="space-y-2">
                                        {[...data.donors].sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((d, i) => (
                                            <div key={d.id} className="flex items-center gap-3 bg-white/4 hover:bg-white/6 rounded-xl px-3 py-2.5 transition-colors">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: PALETTE[i % PALETTE.length] }}>
                                                    {d.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-sm truncate">{d.name}</p>
                                                    <p className="text-white/40 text-xs truncate">{d.email}</p>
                                                </div>
                                                {d.amount !== undefined && (
                                                    <span className="text-yellow-300 font-bold text-sm shrink-0">{formatCurrency(d.amount)}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contributor-only: session stats */}
                                {isContributor && data.session && (
                                    shouldShowContributorStats ? (
                                        <div>
                                            <h3 className="text-yellow-300/80 text-xs font-semibold uppercase tracking-wider mb-3">Thống kê phiên hiện tại</h3>

                                            {/* Progress bar */}
                                            <div className="bg-white/5 rounded-xl p-3 mb-3 border border-yellow-500/10">
                                                <div className="flex justify-between text-xs text-yellow-200/40 mb-1.5">
                                                    <span>Phân phối: {data.session.totalEnvelopes} bao = {formatCurrency(allTotal)}</span>
                                                    <span>{data.session.budget > 0 ? Math.round((allTotal / data.session.budget) * 100) : 0}% ngân sách</span>
                                                </div>
                                                <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all" style={{ width: `${data.session.budget > 0 ? (data.session.totalClaimed / data.session.budget) * 100 : 0}%` }} />
                                                    <div className="h-full bg-gradient-to-r from-yellow-500/30 to-yellow-300/30 transition-all" style={{ width: `${data.session.budget > 0 ? (unopenedTotal / data.session.budget) * 100 : 0}%` }} />
                                                </div>
                                                <div className="flex gap-4 mt-2 text-[10px] text-yellow-200/40">
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Đã mở</span>
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400/30 inline-block" /> Chưa mở</span>
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/10 inline-block" /> Dư</span>
                                                </div>
                                            </div>

                                            {/* Sub-tab */}
                                            <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-3">
                                                {(['distribution', 'winners'] as const).map(t => (
                                                    <button key={t} onClick={() => setStatsTab(t)}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${statsTab === t ? 'bg-yellow-500/20 text-yellow-300' : 'text-white/40 hover:text-white/70'}`}>
                                                        {t === 'distribution' ? (
                                                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> Phân phối giải</>
                                                        ) : (
                                                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg> Người trúng</>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {statsTab === 'distribution' && (
                                                <div className="space-y-2">
                                                    {data.session.prizeStats.length === 0 ? (
                                                        <p className="text-center text-white/30 text-sm py-4">Chưa có lì xì nào được tạo</p>
                                                    ) : (
                                                        <div className="overflow-x-auto rounded-xl border border-yellow-500/10 custom-scrollbar">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-yellow-200/50 text-xs">
                                                                        <th className="px-3 py-2 text-left whitespace-nowrap">Mệnh giá</th>
                                                                        <th className="px-3 py-2 text-center">Tổng</th>
                                                                        <th className="px-3 py-2 text-center">Đã mở</th>
                                                                        <th className="px-3 py-2 text-center">Còn lại</th>
                                                                        <th className="px-3 py-2 text-right whitespace-nowrap">Giá trị</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {data.session.prizeStats.map(d => (
                                                                        <tr key={d.amount} className="border-t border-yellow-500/5">
                                                                            <td className="px-3 py-2 text-yellow-200 font-medium whitespace-nowrap">{formatCurrency(d.amount)}</td>
                                                                            <td className="px-3 py-2 text-center text-yellow-200/60">{d.total}</td>
                                                                            <td className="px-3 py-2 text-center text-yellow-300">{d.opened}</td>
                                                                            <td className="px-3 py-2 text-center text-yellow-200/40">{d.remaining}</td>
                                                                            <td className="px-3 py-2 text-right text-yellow-300/80 whitespace-nowrap">{formatCurrency(d.amount * d.total)}</td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr className="border-t-2 border-yellow-500/20 bg-white/5 font-bold">
                                                                        <td className="px-3 py-2 text-yellow-200">Tổng</td>
                                                                        <td className="px-3 py-2 text-center text-yellow-200">{data.session.totalEnvelopes}</td>
                                                                        <td className="px-3 py-2 text-center text-yellow-300">{data.session.pickCount}</td>
                                                                        <td className="px-3 py-2 text-center text-yellow-200/60">{data.session.totalEnvelopes - data.session.pickCount}</td>
                                                                        <td className="px-3 py-2 text-right text-yellow-300 whitespace-nowrap">{formatCurrency(allTotal)}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {statsTab === 'winners' && (
                                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                                    {data.session.winners.length === 0 ? (
                                                        <p className="text-center text-white/30 text-sm py-4">Chưa có ai trúng giải</p>
                                                    ) : (() => {
                                                        // Group by email: merge regular + bonus into one card
                                                        const grouped = new Map<string, { name: string; email: string | null; regular?: Winner; bonus?: Winner }>()
                                                        data.session!.winners.forEach(w => {
                                                            const key = w.claimedByEmail ?? w.claimedBy
                                                            const prev = grouped.get(key) ?? { name: w.claimedBy, email: w.claimedByEmail }
                                                            grouped.set(key, w.isBonus ? { ...prev, bonus: w } : { ...prev, regular: w })
                                                        })
                                                        return Array.from(grouped.values()).map((g, i) => (
                                                            <div key={g.email ?? g.name} className="flex items-center gap-3 bg-white/4 rounded-xl px-3 py-2.5">
                                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                                    style={{ background: PALETTE[i % PALETTE.length] }}>
                                                                    {i + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-sm font-medium truncate">{g.name}</p>
                                                                    <p className="text-white/30 text-xs truncate">{g.email}</p>
                                                                </div>
                                                                {/* Prize amounts column */}
                                                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                                                    {g.regular && (
                                                                        <span className="text-yellow-300 font-bold text-sm">{formatCurrency(g.regular.amount)}</span>
                                                                    )}
                                                                    {g.bonus && (
                                                                        <span className="flex items-center gap-1 text-yellow-200/70 text-xs">
                                                                            <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                                            </svg>
                                                                            {formatCurrency(g.bonus.amount)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 rounded-xl p-4 text-center">
                                            <p className="text-white/40 text-sm">🔒 Thống kê chưa được công bố</p>
                                        </div>
                                    )
                                )}

                                {/* Non-contributor note */}
                                {!isContributor && (
                                    <p className="text-center text-white/25 text-xs italic">
                                        💡 Đóng góp vào quỹ để xem thống kê giải thưởng chi tiết
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
