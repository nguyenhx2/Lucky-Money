import type { Metadata } from 'next'
import { Quicksand, Dancing_Script } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const quicksand = Quicksand({
    subsets: ['vietnamese', 'latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-quicksand',
    display: 'swap',
})

const dancingScript = Dancing_Script({
    subsets: ['vietnamese', 'latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-dancing',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Hái Lộc Đầu Xuân - Tết Bính Ngọ 2026',
    description: 'Ứng dụng hái lì xì may mắn trực tuyến. Chúc Mừng Năm Mới Bính Ngọ 2026 - Vạn Sự Như Ý, Phát Tài Phát Lộc!',
    keywords: ['lì xì', 'tết', 'lucky money', 'hái lộc', 'năm mới', 'bính ngọ 2026', 'ntq'],
    authors: [{ name: 'NTQ Technology' }],
    openGraph: {
        title: 'Hái Lộc Đầu Xuân - Tết Bính Ngọ 2026',
        description: 'Ứng dụng hái lì xì may mắn trực tuyến. Chúc Mừng Năm Mới Bính Ngọ 2026 - Vạn Sự Như Ý, Phát Tài Phát Lộc!',
        url: '/',
        siteName: 'Lucky Money',
        locale: 'vi_VN',
        type: 'website',
        images: [
            {
                url: '/background/bg-lantern.webp',
                width: 1200,
                height: 630,
                alt: 'Hái Lộc Đầu Xuân - Lucky Money',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hái Lộc Đầu Xuân - Tết Bính Ngọ 2026',
        description: 'Ứng dụng hái lì xì may mắn trực tuyến. Chúc Mừng Năm Mới Bính Ngọ 2026 - Vạn Sự Như Ý, Phát Tài Phát Lộc!',
        images: ['/background/bg-lantern.webp'],
    },
    icons: { icon: '/favicon.svg' },
    metadataBase: process.env.NEXTAUTH_URL
        ? new URL(process.env.NEXTAUTH_URL.startsWith('http') ? process.env.NEXTAUTH_URL : `https://${process.env.NEXTAUTH_URL}`)
        : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" className={`${quicksand.variable} ${dancingScript.variable}`}>
            <body className="font-sans">
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    )
}
