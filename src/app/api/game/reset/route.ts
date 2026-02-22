import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST — Reset a game session: reopen all envelopes, reset all grants.
 * Admin-only operation.
 */
export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json()
        if (!sessionId) {
            return NextResponse.json({ error: 'Thiếu sessionId' }, { status: 400 })
        }

        await prisma.$transaction(async (tx) => {
            // 1. Reopen all envelopes
            await tx.envelope.updateMany({
                where: { sessionId },
                data: {
                    isOpened: false,
                    claimedBy: null,
                    claimedByEmail: null,
                    claimedAt: null,
                    wish: null,
                    thiepUrl: null,
                },
            })

            // 2. Reset retry grants
            await tx.retryGrant.updateMany({
                where: { sessionId },
                data: { used: false },
            })

            // 3. Reset bonus grants
            await tx.bonusGrant.updateMany({
                where: { sessionId },
                data: {
                    used: false,
                    bonusAmount: null,
                    bonusEnvId: null,
                    bonusWish: null,
                    bonusThiepUrl: null,
                    bonusImageUrl: null,
                },
            })
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('POST /api/game/reset error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
