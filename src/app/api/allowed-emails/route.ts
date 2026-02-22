import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — list all allowed emails
export async function GET() {
    const emails = await prisma.allowedEmail.findMany({
        orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ emails })
}

// POST — add emails (supports batch via comma/newline/semicolon separated list)
export async function POST(req: NextRequest) {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const body = await req.json()
    const { emails: rawEmails, label } = body as { emails: string; label?: string }

    if (!rawEmails) {
        return NextResponse.json({ error: 'Missing emails' }, { status: 400 })
    }

    // Parse email list — support comma, semicolon, newline, space separation
    const emailList = rawEmails
        .split(/[,;\n\r\s]+/)
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e.includes('@'))

    if (emailList.length === 0) {
        return NextResponse.json({ error: 'No valid emails found' }, { status: 400 })
    }

    // Batch insert — skip duplicates (single SQL instead of N upserts)
    const result = await prisma.allowedEmail.createMany({
        data: emailList.map((email: string) => ({
            email,
            label: label || null,
        })),
        skipDuplicates: true,
    })

    return NextResponse.json({ added: result.count, total: emailList.length })
}

// DELETE — remove email(s): ?id=single | body { ids: [...] } | body { all: true }
export async function DELETE(req: NextRequest) {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // Single delete via query param
    if (id) {
        await prisma.allowedEmail.delete({ where: { id } })
        return NextResponse.json({ ok: true, deleted: 1 })
    }

    // Bulk delete via body
    try {
        const body = await req.json()
        if (body.all === true) {
            const { count } = await prisma.allowedEmail.deleteMany({})
            return NextResponse.json({ ok: true, deleted: count })
        }
        if (Array.isArray(body.ids) && body.ids.length > 0) {
            const { count } = await prisma.allowedEmail.deleteMany({ where: { id: { in: body.ids } } })
            return NextResponse.json({ ok: true, deleted: count })
        }
    } catch { /* body parse error — fallthrough */ }

    return NextResponse.json({ error: 'Missing id, ids[], or all flag' }, { status: 400 })
}
