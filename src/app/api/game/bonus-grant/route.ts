import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Manually grant bonus to a user
export async function POST(request: Request) {
    try {
        const { sessionId, userEmail } = await request.json()
        if (!sessionId || !userEmail) {
            return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 })
        }

        // Check for existing bonus grant (unique constraint)
        const existing = await prisma.bonusGrant.findUnique({
            where: { sessionId_userEmail: { sessionId, userEmail } },
        })
        if (existing) {
            return NextResponse.json({ error: 'Người này đã có bonus grant' }, { status: 409 })
        }

        const grant = await prisma.bonusGrant.create({
            data: { sessionId, userEmail },
        })

        return NextResponse.json({ grant })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}

// DELETE: Remove a bonus grant
export async function DELETE(request: Request) {
    try {
        const { grantId } = await request.json()
        if (!grantId) {
            return NextResponse.json({ error: 'Thiếu grantId' }, { status: 400 })
        }

        await prisma.bonusGrant.delete({ where: { id: grantId } })
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
