import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return '***'
    const visible = local.length > 2 ? local[0] + '*'.repeat(Math.min(local.length - 2, 4)) + local[local.length - 1] : local[0] + '***'
    return `${visible}@${domain}`
}

/**
 * GET — returns donate info for logged-in users.
 * - Regular user: masked names/emails + total budget only
 * - Contributor: full list + individual amounts + active session prize distribution + winners
 */
export async function GET() {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }
    const userEmail = authSession.user.email.toLowerCase()

    const [donors, activeSession] = await Promise.all([
        prisma.donateContributor.findMany({ orderBy: { createdAt: 'asc' } }),
        prisma.gameSession.findFirst({
            where: { isActive: true },
            include: {
                envelopes: { select: { amount: true, isOpened: true, claimedBy: true, claimedByEmail: true, claimedAt: true, isBonusEnvelope: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ])

    const total = donors.reduce((s, d) => s + d.amount, 0)
    const isContributor = donors.some(d => d.email.toLowerCase() === userEmail)

    if (!isContributor) {
        // Masked view: only names, masked emails, count, total
        return NextResponse.json({
            isContributor: false,
            total,
            count: donors.length,
            donors: donors.map(d => ({
                id: d.id,
                name: d.name,
                email: maskEmail(d.email),
                // No amount for regular users
            })),
        })
    }

    // Contributor view: full data + prize stats + winners
    let prizeStats: { amount: number; total: number; opened: number; remaining: number }[] = []
    let winners: { claimedBy: string; claimedByEmail: string | null; amount: number; claimedAt: Date | null; isBonus: boolean }[] = []

    if (activeSession) {
        const allEnvelopes = activeSession.envelopes
        const opened = allEnvelopes.filter(e => e.isOpened)

        // Distribution by denomination
        const byAmount: Record<number, { total: number; opened: number }> = {}
        allEnvelopes.forEach(e => {
            if (!byAmount[e.amount]) byAmount[e.amount] = { total: 0, opened: 0 }
            byAmount[e.amount].total += 1
            if (e.isOpened) byAmount[e.amount].opened += 1
        })

        prizeStats = Object.entries(byAmount)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([amt, stat]) => ({
                amount: Number(amt),
                total: stat.total,
                opened: stat.opened,
                remaining: stat.total - stat.opened,
            }))

        winners = opened
            .filter(e => e.claimedBy && e.claimedByEmail)
            .sort((a, b) => b.amount - a.amount)
            .map(e => ({
                claimedBy: e.claimedBy!,
                claimedByEmail: e.claimedByEmail,
                amount: e.amount,
                claimedAt: e.claimedAt,
                isBonus: e.isBonusEnvelope,
            }))
    }

    return NextResponse.json({
        isContributor: true,
        total,
        count: donors.length,
        donors: donors.map(d => ({
            id: d.id,
            name: d.name,
            email: d.email,
            amount: d.amount,
            note: d.note,
        })),
        session: activeSession ? {
            budget: activeSession.budget,
            budgetSource: activeSession.budgetSource,
            totalClaimed: activeSession.envelopes.filter(e => e.isOpened).reduce((s, e) => s + e.amount, 0),
            pickCount: activeSession.envelopes.filter(e => e.isOpened).length,
            totalEnvelopes: activeSession.envelopes.length,
            prizeStats,
            winners,
        } : null,
    })
}
