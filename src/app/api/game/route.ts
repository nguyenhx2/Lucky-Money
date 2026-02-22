import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { distributeBudget, DEFAULT_DENOMINATIONS } from '@/lib/distribute'

export async function GET() {
    try {
        const session = await prisma.gameSession.findFirst({
            where: { isActive: true },
            include: {
                envelopes: { orderBy: { id: 'asc' } },
                retryGrants: true,
                bonusGrants: true,
                denominations: { orderBy: { amount: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(
            { session, serverNow: new Date().toISOString() },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
    } catch (error) {
        console.error('GET /api/game error:', error)
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // Parallel: auth + body parse (async-parallel rule)
        const [authSession, body] = await Promise.all([
            getServerSession(authOptions),
            request.json(),
        ])

        // Admin can create sessions even without Google login
        let creatorEmail = authSession?.user?.email
        if (!creatorEmail && body.adminAuth) {
            creatorEmail = 'admin@system'
        }
        if (!creatorEmail) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const {
            budget: rawBudget, quantity, startAt,
            maxPicksPerUser = 1,
            isTestMode = false,
            autoplayMusic = true,
            // New features
            bonusEnabled = false,
            bonusBudgetPercent = 0,
            retryPercent = 0,
            customDenominations,
            emailEnabled = true,
            budgetSource = 'manual',  // 'manual' | 'donate'
        } = body

        // If budgetSource is 'donate', override budget with total from DonateContributor
        let budget = Number(rawBudget)
        if (budgetSource === 'donate') {
            const donors = await prisma.donateContributor.findMany()
            budget = donors.reduce((s, d) => s + d.amount, 0)
            if (budget < 1) {
                return NextResponse.json({ error: 'Chưa có dữ liệu donate!' }, { status: 400 })
            }
        }

        if (!budget || !quantity || budget < 1 || quantity < 1) {
            return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
        }

        // Resolve denominations
        let denoms: number[]
        if (customDenominations && Array.isArray(customDenominations) && customDenominations.length > 0) {
            denoms = customDenominations.map((d: any) => typeof d === 'number' ? d : d.amount)
        } else {
            // Try global defaults from DB
            const globalDenoms = await prisma.denomination.findMany({
                where: { sessionId: null },
                orderBy: { amount: 'asc' },
            })
            denoms = globalDenoms.length > 0
                ? globalDenoms.map(d => d.amount)
                : [...DEFAULT_DENOMINATIONS]
        }

        // Calculate budget split
        let mainBudget = budget
        let bonusBudget = 0
        if (bonusEnabled && bonusBudgetPercent > 0 && bonusBudgetPercent < 100) {
            bonusBudget = Math.floor(budget * bonusBudgetPercent / 100)
            mainBudget = budget - bonusBudget
        }

        // Generate main envelopes
        const mainEnvelopeData = distributeBudget(mainBudget, quantity, denoms)

        // Generate bonus envelopes (if enabled)
        let bonusEnvelopeData: any[] = []
        if (bonusBudget > 0) {
            const minDenom = Math.min(...denoms)
            const bonusQuantity = Math.max(1, Math.floor(bonusBudget / minDenom))
            try {
                bonusEnvelopeData = distributeBudget(bonusBudget, bonusQuantity, denoms)
            } catch {
                // If bonus budget too small, skip bonus envelopes
                bonusBudget = 0
            }
        }

        // Deactivate existing sessions
        await prisma.gameSession.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        })

        // Create the session with all envelopes
        const allEnvelopes = [
            ...mainEnvelopeData.map(env => ({
                amount: env.amount,
                imageUrl: env.imageUrl,
                positionTop: env.positionTop,
                positionLeft: env.positionLeft,
                positionDelay: env.positionDelay,
                isBonusEnvelope: false,
            })),
            ...bonusEnvelopeData.map(env => ({
                amount: env.amount,
                imageUrl: env.imageUrl,
                positionTop: env.positionTop,
                positionLeft: env.positionLeft,
                positionDelay: env.positionDelay,
                isBonusEnvelope: true,
            })),
        ]

        const gameSession = await prisma.gameSession.create({
            data: {
                budget,
                quantity,
                createdBy: creatorEmail,
                isActive: true,
                startAt: startAt ? new Date(startAt) : null,
                maxPicksPerUser,
                isTestMode,
                autoplayMusic,
                bonusEnabled: bonusEnabled && bonusBudget > 0,
                bonusBudgetPercent: bonusBudget > 0 ? bonusBudgetPercent : 0,
                retryPercent,
                emailEnabled,
                budgetSource,
                envelopes: { create: allEnvelopes },
                // Save denominations to the session
                denominations: {
                    create: denoms.map(amount => ({ amount, weight: 1 })),
                },
            },
            include: { envelopes: true, bonusGrants: true, retryGrants: true },
        })

        // ─── Auto-assign RetryGrants ───
        if (retryPercent > 0) {
            const allowedEmails = await prisma.allowedEmail.findMany()
            const retryCount = Math.max(1, Math.floor(allowedEmails.length * retryPercent / 100))

            // Shuffle and pick random users
            const shuffled = allowedEmails
                .map(e => ({ ...e, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .slice(0, retryCount)

            if (shuffled.length > 0) {
                await prisma.retryGrant.createMany({
                    data: shuffled.map(e => ({
                        sessionId: gameSession.id,
                        userEmail: e.email,
                        isAutoAssigned: true,
                    })),
                })
            }
        }

        // ─── Auto-assign BonusGrants ───
        if (bonusEnabled && bonusEnvelopeData.length > 0) {
            const allowedEmails = await prisma.allowedEmail.findMany()
            // Number of bonus grants = number of bonus envelopes
            const bonusCount = Math.min(bonusEnvelopeData.length, allowedEmails.length)

            const shuffled = allowedEmails
                .map(e => ({ ...e, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .slice(0, bonusCount)

            if (shuffled.length > 0) {
                await prisma.bonusGrant.createMany({
                    data: shuffled.map(e => ({
                        sessionId: gameSession.id,
                        userEmail: e.email,
                    })),
                })
            }
        }

        // Re-fetch with all relations
        const fullSession = await prisma.gameSession.findUnique({
            where: { id: gameSession.id },
            include: {
                envelopes: { orderBy: { id: 'asc' } },
                retryGrants: true,
                bonusGrants: true,
                denominations: { orderBy: { amount: 'asc' } },
            },
        })

        return NextResponse.json({ session: fullSession })
    } catch (error: any) {
        console.error('POST /api/game error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}

// PATCH — update session settings (autoplayMusic, bgKey, bgRotateInterval)
export async function PATCH(request: Request) {
    try {
        // Parallel: auth + body parse
        const [authSession, body] = await Promise.all([
            getServerSession(authOptions),
            request.json(),
        ])

        // Allow admin-authenticated requests
        const userEmail = authSession?.user?.email || (body.adminAuth ? 'admin@system' : null)
        if (!userEmail) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { sessionId, autoplayMusic, bgKey, bgRotateInterval } = body

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
        }

        // Build update data dynamically — only include provided fields
        const data: Record<string, unknown> = {}
        if (autoplayMusic !== undefined) data.autoplayMusic = Boolean(autoplayMusic)
        if (bgKey !== undefined) data.bgKey = String(bgKey)
        if (bgRotateInterval !== undefined) data.bgRotateInterval = Number(bgRotateInterval)
        if (body.timezone !== undefined) data.timezone = String(body.timezone)
        if (body.emailEnabled !== undefined) data.emailEnabled = Boolean(body.emailEnabled)

        const updated = await prisma.gameSession.update({
            where: { id: sessionId },
            data,
        })

        return NextResponse.json({ session: updated })
    } catch (error: any) {
        console.error('PATCH /api/game error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
