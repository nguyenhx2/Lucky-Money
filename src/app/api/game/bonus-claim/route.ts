import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { sendLiXiEmail, sendCombinedLiXiEmail } from '@/lib/email'
import { getRandomWish } from '@/lib/wishes'
import { getRandomThiepExcluding } from '@/lib/distribute'

/**
 * POST — Claim a bonus envelope (second draw).
 * Only available to users with an unused BonusGrant.
 */
export async function POST(request: Request) {
    try {
        const [authSession, body] = await Promise.all([
            getServerSession(authOptions),
            request.json(),
        ])

        if (!authSession?.user) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { simulateEmail } = body
        const realEmail = authSession.user.email || ''
        const realName = authSession.user.name || 'Ẩn danh'

        const result = await prisma.$transaction(async (tx) => {
            // Find active session first
            const activeSession = await tx.gameSession.findFirst({
                where: { isActive: true },
            })
            if (!activeSession) {
                throw new Error('Phiên hái lộc đã kết thúc')
            }

            const isTest = activeSession.isTestMode && simulateEmail
            const userEmail = isTest ? simulateEmail : realEmail
            const userName = isTest ? `[Test] ${simulateEmail}` : realName

            // Find user's unused bonus grant for the ACTIVE session
            const bonusGrant = await tx.bonusGrant.findFirst({
                where: { sessionId: activeSession.id, userEmail, used: false },
            })

            if (!bonusGrant) {
                throw new Error('Bạn không có cơ hội bonus!')
            }

            // Find an available bonus envelope
            const bonusEnvelope = await tx.envelope.findFirst({
                where: {
                    sessionId: activeSession.id,
                    isBonusEnvelope: true,
                    isOpened: false,
                },
                orderBy: { id: 'asc' },
            })

            if (!bonusEnvelope) {
                throw new Error('Hết bao lì xì bonus rồi!')
            }

            // Find the user's first draw so bonus thiệp can exclude it
            const firstDraw = await tx.envelope.findFirst({
                where: {
                    sessionId: activeSession.id,
                    claimedByEmail: userEmail,
                    isBonusEnvelope: false,
                },
                orderBy: { claimedAt: 'asc' },
            })

            const wish = getRandomWish()
            const thiepUrl = getRandomThiepExcluding(firstDraw?.thiepUrl)

            // Claim the bonus envelope
            const updated = await tx.envelope.updateMany({
                where: { id: bonusEnvelope.id, isOpened: false },
                data: {
                    isOpened: true,
                    claimedBy: userName,
                    claimedByEmail: userEmail,
                    claimedAt: new Date(),
                    wish,
                    thiepUrl,
                },
            })

            if (updated.count === 0) {
                throw new Error('Bao lì xì bonus đã được người khác mở!')
            }

            // Mark bonus grant as used
            await tx.bonusGrant.update({
                where: { id: bonusGrant.id },
                data: {
                    used: true,
                    bonusAmount: bonusEnvelope.amount,
                    bonusEnvId: bonusEnvelope.id,
                    bonusWish: wish,
                    bonusThiepUrl: thiepUrl,
                    bonusImageUrl: bonusEnvelope.imageUrl,
                },
            })

            return {
                amount: bonusEnvelope.amount,
                imageUrl: bonusEnvelope.imageUrl,
                wish,
                thiepUrl,
                firstDraw: firstDraw ? {
                    amount: firstDraw.amount,
                    imageUrl: firstDraw.imageUrl,
                    wish: firstDraw.wish,
                    thiepUrl: firstDraw.thiepUrl,
                } : null,
                userEmail,
                userName,
                isTest,
                emailEnabled: activeSession.emailEnabled !== false,
            }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 10000,
        })

        // Send combined email with both draws (fire-and-forget)
        if (result.userEmail && !result.isTest && result.emailEnabled) {
            if (result.firstDraw) {
                // Combined email with separate sections for each draw
                sendCombinedLiXiEmail(
                    result.userEmail,
                    result.userName,
                    result.firstDraw,
                    { amount: result.amount, imageUrl: result.imageUrl, wish: result.wish, thiepUrl: result.thiepUrl }
                ).catch(err => console.error('Combined bonus email failed:', err))
            } else {
                // Fallback: bonus only
                sendLiXiEmail(
                    result.userEmail,
                    result.userName,
                    result.amount,
                    result.imageUrl,
                    result.wish,
                    result.thiepUrl
                ).catch(err => console.error('Bonus email failed:', err))
            }
        }

        return NextResponse.json({
            amount: result.amount,
            imageUrl: result.imageUrl,
            wish: result.wish,
            thiepUrl: result.thiepUrl,
        })
    } catch (error: any) {
        console.error('POST /api/game/bonus-claim error:', error)
        const status = error.message?.includes('không có') || error.message?.includes('Hết') ? 400 : 500
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status })
    }
}
