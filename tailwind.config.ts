import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                'tet-red': '#C0392B',
                'tet-darkRed': '#5D0000',
                'tet-gold': '#D4AF37',
                'tet-yellow': '#F39C12',
            },
            fontFamily: {
                sans: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
            },
            animation: {
                sway: 'sway 3s ease-in-out infinite',
                fall: 'fall 8s linear infinite',
                float: 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s ease-in-out infinite',
            },
            keyframes: {
                sway: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                fall: {
                    '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

export default config
