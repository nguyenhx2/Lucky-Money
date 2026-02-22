import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { distributeBudget, DEFAULT_DENOMINATIONS } from '@/lib/distribute'

/**
 * POST — Regenerate envelope distribution for the active session.
 * Only works on unopened envelopes. Preserves already-opened ones.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { sessionId } = body

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
        }

        const session = await prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: {
                envelopes: true,
                denominations: { orderBy: { amount: 'asc' } },
            },
        })

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Get denominations
        let denoms: number[]
        if (session.denominations.length > 0) {
            denoms = session.denominations.map(d => d.amount)
        } else {
            denoms = [...DEFAULT_DENOMINATIONS]
        }

        // Count envelopes
        const openedEnvelopes = session.envelopes.filter(e => e.isOpened)
        const unopenedMainEnvelopes = session.envelopes.filter(e => !e.isOpened && !e.isBonusEnvelope)
        const unopenedBonusEnvelopes = session.envelopes.filter(e => !e.isOpened && e.isBonusEnvelope)

        const openedTotal = openedEnvelopes.reduce((s, e) => s + e.amount, 0)
        const remainingBudget = session.budget - openedTotal

        // Calculate bonus vs main budget split
        let bonusBudget = 0
        let mainBudget = remainingBudget
        if (session.bonusEnabled && session.bonusBudgetPercent > 0) {
            bonusBudget = Math.floor(remainingBudget * session.bonusBudgetPercent / 100)
            mainBudget = remainingBudget - bonusBudget
        }

        // Delete all unopened envelopes
        const unopenedIds = [...unopenedMainEnvelopes, ...unopenedBonusEnvelopes].map(e => e.id)
        if (unopenedIds.length > 0) {
            await prisma.envelope.deleteMany({
                where: { id: { in: unopenedIds } },
            })
        }

        // Regenerate main envelopes
        const mainQuantity = unopenedMainEnvelopes.length || Math.max(1, Math.floor(mainBudget / denoms[0]))
        if (mainBudget >= mainQuantity * denoms[0]) {
            const mainEnvData = distributeBudget(mainBudget, mainQuantity, denoms)
            await prisma.envelope.createMany({
                data: mainEnvData.map(env => ({
                    sessionId,
                    amount: env.amount,
                    imageUrl: env.imageUrl,
                    positionTop: env.positionTop,
                    positionLeft: env.positionLeft,
                    positionDelay: env.positionDelay,
                    isBonusEnvelope: false,
                })),
            })
        }

        // Regenerate bonus envelopes
        if (bonusBudget > 0) {
            const bonusQuantity = unopenedBonusEnvelopes.length || Math.max(1, Math.floor(bonusBudget / denoms[0]))
            if (bonusBudget >= bonusQuantity * denoms[0]) {
                const bonusEnvData = distributeBudget(bonusBudget, bonusQuantity, denoms)
                await prisma.envelope.createMany({
                    data: bonusEnvData.map(env => ({
                        sessionId,
                        amount: env.amount,
                        imageUrl: env.imageUrl,
                        positionTop: env.positionTop,
                        positionLeft: env.positionLeft,
                        positionDelay: env.positionDelay,
                        isBonusEnvelope: true,
                    })),
                })
            }
        }

        // Fetch updated session
        const updated = await prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: { envelopes: { orderBy: { id: 'asc' } } },
        })

        return NextResponse.json({ session: updated })
    } catch (error: any) {
        console.error('POST /api/game/redistribute error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
