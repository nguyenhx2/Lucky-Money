import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendLiXiEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const authSession = await getServerSession(authOptions)
        if (!authSession?.user?.email) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        const { to, name, amount, imageUrl, wish, thiepUrl } = await request.json()
        if (!to || !name || !amount) {
            return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 })
        }

        const result = await sendLiXiEmail(to, name, amount, imageUrl, wish, thiepUrl)

        if (result.success) {
            return NextResponse.json({ success: true, message: `Đã gửi email tới ${to}` })
        }

        return NextResponse.json({ error: result.error || 'Gửi email thất bại' }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
    }
}
