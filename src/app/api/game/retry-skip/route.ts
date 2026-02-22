import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLiXiEmail } from '@/lib/email'

/**
 * POST — Skip retry: mark retry grant as used (skipped) and send email
 * for the current pick if no pending bonus.
 */
export async function POST(request: Request) {
    try {
        const authSession = await getServerSession(authOptions)
        if (!authSession?.user) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { simulateEmail } = await request.json().catch(() => ({}))
        const realEmail = authSession.user.email || ''
        const realName = authSession.user.name || 'Ẩn danh'

        // Find active session
        const session = await prisma.gameSession.findFirst({
            where: { isActive: true },
        })
        if (!session) {
            return NextResponse.json({ error: 'Không có phiên hoạt động' }, { status: 400 })
        }

        const isTest = session.isTestMode && simulateEmail
        const userEmail = isTest ? simulateEmail : realEmail
        const userName = isTest ? `[Test] ${simulateEmail}` : realName

        // Mark unused retry grant as used (skipped)
        const retryGrant = await prisma.retryGrant.findFirst({
            where: { sessionId: session.id, userEmail, used: false },
        })
        if (retryGrant) {
            await prisma.retryGrant.update({
                where: { id: retryGrant.id },
                data: { used: true },
            })
        }

        // Check if user has pending bonus
        const pendingBonus = await prisma.bonusGrant.findFirst({
            where: { sessionId: session.id, userEmail, used: false },
        })

        // If no pending bonus, send email now for the current pick
        if (!pendingBonus && userEmail && !isTest && session.emailEnabled !== false) {
            const currentPick = await prisma.envelope.findFirst({
                where: {
                    sessionId: session.id,
                    claimedByEmail: userEmail,
                    isBonusEnvelope: false,
                    isOpened: true,
                },
                orderBy: { claimedAt: 'desc' },
            })
            if (currentPick) {
                sendLiXiEmail(
                    userEmail,
                    userName,
                    currentPick.amount,
                    currentPick.imageUrl,
                    currentPick.wish,
                    currentPick.thiepUrl
                ).catch(err => console.error('Retry-skip email failed:', err))
            }
        }

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('POST /api/game/retry-skip error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
