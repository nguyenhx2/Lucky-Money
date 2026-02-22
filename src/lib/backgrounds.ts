// Available backgrounds with adaptive title styling
export const BACKGROUNDS: { key: string; label: string; src: string | null; overlay: string; titleClass: string; subtitleClass: string; headerBg: string }[] = [
    {
        key: 'default', label: 'Mặc định (gradient)', src: null, overlay: '',
        titleClass: 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 text-shadow-gold',
        subtitleClass: 'text-yellow-200/90',
        headerBg: 'bg-gradient-to-b from-black/40 via-black/20 to-transparent'
    },
    {
        key: 'tet1', label: 'Khung Tết 1 (đèn lồng)', src: '/background/bg-lantern.webp', overlay: 'bg-black/15',
        titleClass: 'text-red-800 [text-shadow:_0_0_8px_white,_0_0_16px_white,_0_2px_4px_rgba(0,0,0,0.3)]',
        subtitleClass: 'text-red-900/90 [text-shadow:_0_0_6px_white,_0_0_12px_white]',
        headerBg: 'bg-gradient-to-b from-amber-50/70 via-amber-50/40 to-transparent'
    },
    {
        key: 'tet2', label: 'Khung Tết 2 (dưa hấu)', src: '/background/bg-watermelon.webp', overlay: 'bg-black/10',
        titleClass: 'text-red-800 [text-shadow:_0_0_8px_white,_0_0_16px_white,_0_2px_4px_rgba(0,0,0,0.3)]',
        subtitleClass: 'text-red-900/90 [text-shadow:_0_0_6px_white,_0_0_12px_white]',
        headerBg: 'bg-gradient-to-b from-amber-50/70 via-amber-50/40 to-transparent'
    },
]
