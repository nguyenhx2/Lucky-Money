import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { sendLiXiEmail } from '@/lib/email'
import { getRandomWish } from '@/lib/wishes'
import { getRandomThiep } from '@/lib/distribute'

export async function POST(request: Request) {
    try {
        // Parallel: auth + body parsing (async-parallel rule)
        const [authSession, body] = await Promise.all([
            getServerSession(authOptions),
            request.json(),
        ])

        if (!authSession?.user) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { envelopeId, simulateEmail } = body
        if (!envelopeId) {
            return NextResponse.json({ error: 'Thiếu ID bao lì xì' }, { status: 400 })
        }

        // simulateEmail is only allowed in test mode — ignored in production sessions
        const realEmail = authSession.user.email || ''
        const realName = authSession.user.name || 'Ẩn danh'

        const result = await prisma.$transaction(async (tx) => {
            const envelope = await tx.envelope.findUnique({
                where: { id: envelopeId },
                include: { session: { include: { retryGrants: true } } },
            })

            if (!envelope) throw new Error('Không tìm thấy bao lì xì')
            if (envelope.isOpened) throw new Error('Bao lì xì này đã được mở rồi')
            if (!envelope.session.isActive) throw new Error('Phiên hái lộc đã kết thúc')
            if (envelope.isBonusEnvelope) throw new Error('Bao lì xì này dành cho bonus round')

            // Resolve effective identity: simulateEmail only works in test mode
            const isTest = envelope.session.isTestMode && simulateEmail
            const userEmail = isTest ? simulateEmail : realEmail
            const userName = isTest ? `[Test] ${simulateEmail}` : realName

            // Check if countdown has started
            if (envelope.session.startAt && new Date(envelope.session.startAt) > new Date()) {
                throw new Error('Phiên hái lộc chưa bắt đầu')
            }

            // Parallel: count user picks + total claimed
            const [userPicks, totalClaimed] = await Promise.all([
                tx.envelope.count({
                    where: {
                        sessionId: envelope.sessionId,
                        isOpened: true,
                        claimedByEmail: userEmail,
                        isBonusEnvelope: false,
                    },
                }),
                tx.envelope.aggregate({
                    where: { sessionId: envelope.sessionId, isOpened: true },
                    _sum: { amount: true },
                }),
            ])

            // Retry does NOT increase max picks — it replaces the current pick
            if (userPicks >= envelope.session.maxPicksPerUser) {
                throw new Error('Bạn đã nhận đủ lộc rồi! 🎉')
            }

            // Check budget
            if ((totalClaimed._sum.amount || 0) + envelope.amount > envelope.session.budget) {
                throw new Error('Đã hết ngân sách')
            }

            const wish = getRandomWish()
            const thiepUrl = getRandomThiep()

            // Optimistic lock: only update if still unopened (prevents race condition)
            const updated = await tx.envelope.updateMany({
                where: { id: envelopeId, isOpened: false },
                data: {
                    isOpened: true,
                    claimedBy: userName,
                    claimedByEmail: userEmail,
                    claimedAt: new Date(),
                    wish,
                    thiepUrl,
                },
            })

            // If 0 rows updated, another request already claimed it
            if (updated.count === 0) {
                throw new Error('Bao lì xì này đã được người khác mở rồi!')
            }

            // Check for unused retry grant (retry = re-roll opportunity)
            const hasRetryAvailable = await tx.retryGrant.count({
                where: { sessionId: envelope.sessionId, userEmail, used: false },
            }) > 0

            // Check if user has a bonus grant
            const hasBonusRound = await tx.bonusGrant.count({
                where: { sessionId: envelope.sessionId, userEmail, used: false },
            }) > 0

            // Return the updated envelope data
            return { amount: envelope.amount, claimedBy: userName, claimedByEmail: userEmail, imageUrl: envelope.imageUrl, wish, thiepUrl, isTest, hasBonusRound, hasRetryAvailable, emailEnabled: envelope.session.emailEnabled !== false }
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 10000, // 10s safety net — prevents zombie locks under heavy load
        })

        // Fire-and-forget: send email notification (don't block the response)
        // Defer email if user has pending retry or bonus — combined email sent later
        if (result.claimedByEmail && !result.isTest && !result.hasBonusRound && !result.hasRetryAvailable && result.emailEnabled) {
            sendLiXiEmail(result.claimedByEmail, result.claimedBy, result.amount, result.imageUrl, result.wish, result.thiepUrl).catch(err =>
                console.error('Email send failed (non-blocking):', err)
            )
        }

        return NextResponse.json({
            amount: result.amount,
            claimedBy: result.claimedBy,
            imageUrl: result.imageUrl,
            wish: result.wish,
            thiepUrl: result.thiepUrl,
            hasBonusRound: result.hasBonusRound,
            hasRetryAvailable: result.hasRetryAvailable,
        })
    } catch (error: any) {
        console.error('POST /api/game/claim error:', error)
        const message = error.message || 'Lỗi server'

        // Serialization failure = another concurrent claim won the race
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
            return NextResponse.json(
                { error: 'Có người vừa rút trước bạn, vui lòng thử lại!', code: 'RETRY' },
                { status: 409 }
            )
        }

        // Distinguish "already opened" from other errors for the frontend
        const isAlreadyOpened = message.includes('đã được') || message.includes('đã mở')
        return NextResponse.json(
            { error: message, code: isAlreadyOpened ? 'ALREADY_OPENED' : 'ERROR' },
            { status: 400 }
        )
    }
}
