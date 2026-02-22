import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Grant retry to a user
export async function POST(request: Request) {
    try {
        const authSession = await getServerSession(authOptions)
        if (!authSession?.user?.email) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { sessionId, userEmail } = await request.json()
        if (!sessionId || !userEmail) {
            return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 })
        }

        const grant = await prisma.retryGrant.create({
            data: { sessionId, userEmail },
        })

        return NextResponse.json({ grant })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}

// GET: List retry grants for active session
export async function GET() {
    try {
        const session = await prisma.gameSession.findFirst({
            where: { isActive: true },
            include: { retryGrants: true },
        })

        return NextResponse.json({ grants: session?.retryGrants || [] })
    } catch {
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
    }
}

// DELETE: Remove a retry grant
export async function DELETE(request: Request) {
    try {
        const { grantId } = await request.json()
        if (!grantId) {
            return NextResponse.json({ error: 'Thiếu grantId' }, { status: 400 })
        }

        await prisma.retryGrant.delete({ where: { id: grantId } })
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
