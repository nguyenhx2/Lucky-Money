'use client'

import React from 'react'
import { formatCurrency } from '@/lib/distribute'

interface EnvelopeHistory {
    id: string
    amount: number
    isOpened: boolean
    claimedBy: string | null
    claimedAt: string | null
}

interface HistoryPanelProps {
    envelopes: EnvelopeHistory[]
    budget: number
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ envelopes, budget }) => {
    const claimed = envelopes.filter(e => e.isOpened)
    const totalClaimed = claimed.reduce((sum, e) => sum + e.amount, 0)
    const remaining = budget - totalClaimed

    if (envelopes.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 italic">
                Chưa có phiên hái lộc nào.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400">Ngân sách</div>
                    <div className="text-sm font-bold text-yellow-300">{formatCurrency(budget)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400">Đã phát</div>
                    <div className="text-sm font-bold text-green-300">{formatCurrency(totalClaimed)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400">Còn lại</div>
                    <div className="text-sm font-bold text-orange-300">{formatCurrency(remaining)}</div>
                </div>
            </div>

            {/* Winner list */}
            {claimed.length === 0 ? (
                <div className="text-center py-6 text-gray-500 italic">
                    Chưa ai mở lì xì.
                </div>
            ) : (
                <ul className="space-y-2">
                    {claimed
                        .sort((a, b) => new Date(b.claimedAt || 0).getTime() - new Date(a.claimedAt || 0).getTime())
                        .map((envelope, idx) => (
                            <li
                                key={envelope.id}
                                className="bg-gray-800/30 border border-gray-700/50 p-3 rounded-lg flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center">
                                        {claimed.length - idx}
                                    </span>
                                    <div>
                                        <div className="font-medium text-white text-sm">{envelope.claimedBy || 'Ẩn danh'}</div>
                                        <div className="text-xs text-gray-500">
                                            {envelope.claimedAt
                                                ? new Date(envelope.claimedAt).toLocaleTimeString('vi-VN')
                                                : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-yellow-300 font-bold">
                                    {formatCurrency(envelope.amount)}
                                </div>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    )
}
