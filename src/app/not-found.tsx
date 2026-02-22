import Link from 'next/link'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3D0000] via-[#5D0000] to-[#2D0000] flex items-center justify-center px-4">
            <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative z-10 text-center max-w-md">
                <div className="text-8xl mb-4 font-bold text-yellow-500/20">404</div>
                <div className="text-6xl mb-6">🐴</div>
                <h1 className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-3"
                    style={{ textShadow: '0 0 20px rgba(255,200,50,0.3)' }}>
                    Ngựa chạy lạc rồi!
                </h1>
                <p className="text-yellow-200/60 text-lg mb-8">
                    Trang bạn tìm không tồn tại hoặc đã bay xa rồi.
                </p>

                <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all text-sm"
                >
                    Phi ngựa về trang chủ
                </Link>

                <p className="text-yellow-200/20 text-xs mt-10">
                    Tết Bính Ngọ 2026 — Hái Lộc Đầu Xuân
                </p>
            </div>
        </div>
    )
}
