import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

/**
 * GET — returns current DonateSettings (public, logged-in users only).
 * Used by DonateModal to know which views to show.
 */
export async function GET() {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const settings = await prisma.donateSettings.findUnique({ where: { id: SINGLETON_ID } })
    // Return defaults if not yet created
    return NextResponse.json({
        showPublicView: settings?.showPublicView ?? true,
        showContributorView: settings?.showContributorView ?? true,
    })
}

/**
 * PATCH — admin only. Toggle showPublicView and/or showContributorView.
 * Body: { showPublicView?: boolean, showContributorView?: boolean }
 */
export async function PATCH(req: Request) {
    const adminAuth = req.headers.get('x-admin-auth')
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    if (!adminAuth && !adminPasswordHash) {
        return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const body = await req.json()
    const { showPublicView, showContributorView } = body

    const data: Record<string, boolean> = {}
    if (typeof showPublicView === 'boolean') data.showPublicView = showPublicView
    if (typeof showContributorView === 'boolean') data.showContributorView = showContributorView

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: 'Không có dữ liệu' }, { status: 400 })
    }

    const updated = await prisma.donateSettings.upsert({
        where: { id: SINGLETON_ID },
        create: { id: SINGLETON_ID, showPublicView: true, showContributorView: true, ...data },
        update: data,
    })

    return NextResponse.json(updated)
}
