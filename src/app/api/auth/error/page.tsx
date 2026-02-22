'use client'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3D0000] via-[#5D0000] to-[#2D0000] flex items-center justify-center px-4">
            {/* Tết pattern overlay */}
            <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative z-10 text-center max-w-md">
                <div className="text-7xl mb-6">🐴</div>
                <h1 className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-3"
                    style={{ textShadow: '0 0 20px rgba(255,200,50,0.3)' }}>
                    Ngựa lạc đường rồi!
                </h1>
                <p className="text-yellow-200/60 text-lg mb-2">
                    Có lỗi xảy ra khi đăng nhập.
                </p>
                <p className="text-yellow-200/35 text-sm mb-8">
                    Tài khoản của bạn có thể chưa được cấp quyền tham gia Hái Lộc.
                    <br />Vui lòng liên hệ admin hoặc thử lại.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all text-sm"
                    >
                        Về trang chủ
                    </a>
                    <a
                        href="/api/auth/signin"
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm text-yellow-200/80 font-medium rounded-xl border border-yellow-500/20 hover:bg-white/15 transition-all text-sm"
                    >
                        Thử đăng nhập lại
                    </a>
                </div>

                <p className="text-yellow-200/20 text-xs mt-10">
                    Tết Bính Ngọ 2026 - Hái Lộc Đầu Xuân
                </p>
            </div>
        </div>
    )
}
