import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_DENOMINATIONS } from '@/lib/distribute'

/**
 * GET — Fetch denominations (global defaults or session-specific).
 * Query: ?sessionId=xxx (optional — omit for global defaults)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    const denominations = await prisma.denomination.findMany({
        where: { sessionId: sessionId || null },
        orderBy: { amount: 'asc' },
    })

    // If no denominations exist yet, return defaults
    if (denominations.length === 0 && !sessionId) {
        return NextResponse.json({
            denominations: DEFAULT_DENOMINATIONS.map(amount => ({ id: null, amount, weight: 1 })),
            isDefault: true,
        })
    }

    return NextResponse.json({ denominations, isDefault: false })
}

/**
 * POST — Save/replace denominations.
 * Body: { denominations: [{ amount: number, weight?: number }], sessionId?: string }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { denominations, sessionId = null } = body

        if (!Array.isArray(denominations) || denominations.length === 0) {
            return NextResponse.json({ error: 'Cần ít nhất 1 mệnh giá' }, { status: 400 })
        }

        // Validate all amounts are positive integers divisible by 1000
        for (const d of denominations) {
            if (!d.amount || d.amount < 1000 || d.amount % 1000 !== 0) {
                return NextResponse.json({ error: `Mệnh giá không hợp lệ: ${d.amount}. Phải là bội số của 1.000` }, { status: 400 })
            }
        }

        // Delete existing and re-create (atomic via transaction)
        await prisma.$transaction([
            prisma.denomination.deleteMany({ where: { sessionId } }),
            prisma.denomination.createMany({
                data: denominations.map((d: { amount: number; weight?: number }) => ({
                    amount: d.amount,
                    weight: d.weight || 1,
                    sessionId,
                })),
            }),
        ])

        const saved = await prisma.denomination.findMany({
            where: { sessionId },
            orderBy: { amount: 'asc' },
        })

        return NextResponse.json({ denominations: saved })
    } catch (error: any) {
        console.error('POST /api/denominations error:', error)
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
