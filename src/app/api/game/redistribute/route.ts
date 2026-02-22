import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { distributeBudget, DEFAULT_DENOMINATIONS } from '@/lib/distribute'

const LI_XI_IMAGES = [
    '/assets/li-xi/li-xi-binh-ngo-3.webp',
    '/assets/li-xi/li-xi-binh-ngo.webp',
    '/assets/li-xi/li-xi-binh-ngo-1.webp',
    '/assets/li-xi/li-xi-binh-ngo-8.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-9.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-4.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-10.webp',
]

function randomLiXiImage() { return LI_XI_IMAGES[Math.floor(Math.random() * LI_XI_IMAGES.length)] }
function randomPosition() { return { top: Math.random() * 60 + 10, left: Math.random() * 80 + 5, delay: Math.random() * 2 } }

/**
 * POST — Regenerate envelope distribution for the active session.
 * Only works on unopened envelopes. Preserves already-opened ones.
 *
 * Body: { sessionId: string, denomTargets?: { amount: number, count: number }[] }
 * When denomTargets is provided, creates exact per-denomination envelopes instead of random distribution.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { sessionId, denomTargets } = body

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

        // Categorize envelopes
        const openedEnvelopes = session.envelopes.filter(e => e.isOpened)
        const unopenedMainEnvelopes = session.envelopes.filter(e => !e.isOpened && !e.isBonusEnvelope)
        const unopenedBonusEnvelopes = session.envelopes.filter(e => !e.isOpened && e.isBonusEnvelope)

        const openedTotal = openedEnvelopes.reduce((s, e) => s + e.amount, 0)

        // ── Explicit denomination targets mode ──
        if (Array.isArray(denomTargets) && denomTargets.length > 0) {
            // Count opened envelopes by denomination
            const openedByDenom: Record<number, number> = {}
            openedEnvelopes.filter(e => !e.isBonusEnvelope).forEach(e => {
                openedByDenom[e.amount] = (openedByDenom[e.amount] || 0) + 1
            })

            // Validate each target
            for (const t of denomTargets) {
                const openedCount = openedByDenom[t.amount] || 0
                if (t.count < openedCount) {
                    return NextResponse.json({
                        error: `Mệnh giá ${t.amount.toLocaleString('vi-VN')}₫: không thể giảm dưới ${openedCount} (đã mở)`,
                    }, { status: 400 })
                }
            }

            // Validate total value vs budget
            const newTotalValue = denomTargets.reduce((s, t) => s + t.amount * t.count, 0)
            const openedBonusTotal = openedEnvelopes.filter(e => e.isBonusEnvelope).reduce((s, e) => s + e.amount, 0)
            if (newTotalValue + openedBonusTotal > session.budget) {
                const over = newTotalValue + openedBonusTotal - session.budget
                return NextResponse.json({
                    error: `Vượt ngân sách ${over.toLocaleString('vi-VN')}₫! Tổng mới: ${newTotalValue.toLocaleString('vi-VN')}₫, Ngân sách: ${session.budget.toLocaleString('vi-VN')}₫`,
                }, { status: 400 })
            }

            const newTotalCount = denomTargets.reduce((s, t) => s + t.count, 0)
            if (newTotalCount === 0) {
                return NextResponse.json({ error: 'Cần ít nhất 1 bao lì xì' }, { status: 400 })
            }

            // Validate total count must match session.quantity (main envelopes)
            if (newTotalCount !== session.quantity) {
                const diff = newTotalCount - session.quantity
                const msg = diff > 0
                    ? `Thừa ${diff} bao! Tổng phải bằng đúng ${session.quantity}.`
                    : `Thiếu ${Math.abs(diff)} bao! Tổng phải bằng đúng ${session.quantity}.`
                return NextResponse.json({ error: msg }, { status: 400 })
            }

            // Delete all unopened main envelopes
            const unopenedMainIds = unopenedMainEnvelopes.map(e => e.id)
            if (unopenedMainIds.length > 0) {
                await prisma.envelope.deleteMany({ where: { id: { in: unopenedMainIds } } })
            }

            // Create exact envelopes per denomination (only new ones = target - opened)
            const newEnvelopes: { sessionId: string; amount: number; imageUrl: string; positionTop: number; positionLeft: number; positionDelay: number; isBonusEnvelope: boolean }[] = []
            for (const t of denomTargets) {
                const openedCount = openedByDenom[t.amount] || 0
                const toCreate = t.count - openedCount
                for (let i = 0; i < toCreate; i++) {
                    const pos = randomPosition()
                    newEnvelopes.push({
                        sessionId,
                        amount: t.amount,
                        imageUrl: randomLiXiImage(),
                        positionTop: pos.top,
                        positionLeft: pos.left,
                        positionDelay: pos.delay,
                        isBonusEnvelope: false,
                    })
                }
            }

            if (newEnvelopes.length > 0) {
                await prisma.envelope.createMany({ data: newEnvelopes })
            }

            // Fetch and return updated session (quantity stays unchanged)
            const updated = await prisma.gameSession.findUnique({
                where: { id: sessionId },
                include: { envelopes: { orderBy: { id: 'asc' } } },
            })
            return NextResponse.json({ session: updated })
        }

        // ── Existing random redistribute logic ──
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
