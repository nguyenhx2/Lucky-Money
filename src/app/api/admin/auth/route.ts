import { NextResponse } from 'next/server'
import crypto from 'crypto'

const SALT = 'HaiLocDauXuan2026'

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + SALT).digest('hex')
}

export async function POST(request: Request) {
    try {
        const { password } = await request.json()
        const storedHash = process.env.ADMIN_PASSWORD_HASH

        if (!storedHash || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
        }

        const inputHash = hashPassword(password)

        if (inputHash === storedHash) {
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
    } catch {
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
    }
}
