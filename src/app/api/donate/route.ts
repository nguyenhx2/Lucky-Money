import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function requireAdmin(req: Request) {
    const auth = req.headers.get('x-admin-auth')
    return auth === process.env.ADMIN_PASSWORD || auth === 'true'
}

/** GET — list all donors (admin only) */
export async function GET(req: Request) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const donors = await prisma.donateContributor.findMany({ orderBy: { createdAt: 'asc' } })
    const total = donors.reduce((s, d) => s + d.amount, 0)
    return NextResponse.json({ donors, total })
}

/** POST — add a donor (admin only) */
export async function POST(req: Request) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { name, email, amount, note } = await req.json()
    if (!name || !email || !amount) {
        return NextResponse.json({ error: 'name, email, amount are required' }, { status: 400 })
    }
    try {
        const donor = await prisma.donateContributor.create({
            data: { name, email: email.toLowerCase().trim(), amount: Number(amount), note: note || null },
        })
        return NextResponse.json({ donor })
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Email này đã có trong danh sách' }, { status: 409 })
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
    }
}

/** PATCH — update a donor (admin only) */
export async function PATCH(req: Request) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, name, email, amount, note } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    try {
        const donor = await prisma.donateContributor.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email: email.toLowerCase().trim() }),
                ...(amount !== undefined && { amount: Number(amount) }),
                ...(note !== undefined && { note: note || null }),
            },
        })
        return NextResponse.json({ donor })
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Email này đã tồn tại' }, { status: 409 })
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
    }
}

/** DELETE — remove a donor (admin only) */
export async function DELETE(req: Request) {
    if (!requireAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await prisma.donateContributor.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
