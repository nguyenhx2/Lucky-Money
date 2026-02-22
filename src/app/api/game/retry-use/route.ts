import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * POST — Use a retry grant: release current envelope and let user pick again.
 * Retry = re-roll (replaces first pick, not additive).
 */
export async function POST(request: Request) {
    try {
        const authSession = await getServerSession(authOptions)
        if (!authSession?.user) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { simulateEmail } = await request.json().catch(() => ({}))
        const realEmail = authSession.user.email || ''

        await prisma.$transaction(async (tx) => {
            // Find active session
            const session = await tx.gameSession.findFirst({
                where: { isActive: true },
            })
            if (!session) throw new Error('Không có phiên hoạt động')

            const isTest = session.isTestMode && simulateEmail
            const userEmail = isTest ? simulateEmail : realEmail

            // Find user's unused retry grant
            const retryGrant = await tx.retryGrant.findFirst({
                where: { sessionId: session.id, userEmail, used: false },
            })
            if (!retryGrant) throw new Error('Bạn không có lượt thử lại!')

            // Find user's current claimed non-bonus envelope
            const claimedEnvelope = await tx.envelope.findFirst({
                where: {
                    sessionId: session.id,
                    claimedByEmail: userEmail,
                    isBonusEnvelope: false,
                    isOpened: true,
                },
                orderBy: { claimedAt: 'desc' },
            })
            if (!claimedEnvelope) throw new Error('Không tìm thấy bao lì xì đã bốc')

            // Release the envelope (unclaim)
            await tx.envelope.update({
                where: { id: claimedEnvelope.id },
                data: {
                    isOpened: false,
                    claimedBy: null,
                    claimedByEmail: null,
                    claimedAt: null,
                    wish: null,
                    thiepUrl: null,
                },
            })

            // Mark retry grant as used
            await tx.retryGrant.update({
                where: { id: retryGrant.id },
                data: { used: true },
            })
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 10000,
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('POST /api/game/retry-use error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
