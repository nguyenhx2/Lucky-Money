/**
 * Distribution algorithm for Lucky Money envelopes.
 * Supports both hardcoded default and dynamic denominations from DB.
 */

export const DEFAULT_DENOMINATIONS = [50000, 100000, 200000, 500000] as const

const LI_XI_IMAGES = [
    '/assets/li-xi/li-xi-binh-ngo-3.webp',
    '/assets/li-xi/li-xi-binh-ngo.webp',
    '/assets/li-xi/li-xi-binh-ngo-1.webp',
    '/assets/li-xi/li-xi-binh-ngo-8.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-9.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-4.webp',
    '/assets/li-xi/li-xi-minh-hoa-tet-2026-10.webp',
]

export const THIEP_IMAGES = [
    '/assets/thiep/thiep-chuc-tet-truyen-thong-3.webp',
    '/assets/thiep/thiep-chuc-tet-truyen-thong-2.webp',
    '/assets/thiep/thiep-chuc-tet9.webp',
    '/assets/thiep/thiep-chuc-tet8.webp',
    '/assets/thiep/thiep-chuc-tet7.webp',
    '/assets/thiep/thiep-chuc-tet-5.webp',
    '/assets/thiep/thiep-chuc-tet-4.webp',
]

export function getRandomThiep(): string {
    return THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)]
}

/** Return a random thiệp that is NOT the excluded one */
export function getRandomThiepExcluding(excludeUrl?: string | null): string {
    const candidates = excludeUrl ? THIEP_IMAGES.filter(t => t !== excludeUrl) : THIEP_IMAGES
    if (candidates.length === 0) return THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)]
    return candidates[Math.floor(Math.random() * candidates.length)]
}

export interface EnvelopeDistribution {
    amount: number
    imageUrl: string
    positionTop: number
    positionLeft: number
    positionDelay: number
}

/**
 * Distribute budget into envelopes using given denominations.
 * @param budget Total budget in VND
 * @param quantity Number of envelopes to create
 * @param denominations Sorted array of allowed denominations (ascending). Defaults to DEFAULT_DENOMINATIONS.
 */
export function distributeBudget(
    budget: number,
    quantity: number,
    denominations: number[] = [...DEFAULT_DENOMINATIONS]
): EnvelopeDistribution[] {
    // Sort ascending and dedupe
    const denoms = [...new Set(denominations)].sort((a, b) => a - b)
    if (denoms.length === 0) throw new Error('Cần ít nhất 1 mệnh giá!')

    const minDenom = denoms[0]
    const maxDenom = denoms[denoms.length - 1]

    if (budget < quantity * minDenom) {
        throw new Error(`Ngân sách quá thấp! Cần ít nhất ${(quantity * minDenom).toLocaleString('vi-VN')} VNĐ.`)
    }
    if (budget > quantity * maxDenom) {
        throw new Error(`Ngân sách quá cao! Tối đa ${(quantity * maxDenom).toLocaleString('vi-VN')} VNĐ.`)
    }

    // Start everyone at minimum denomination
    const amounts = new Array(quantity).fill(minDenom)
    let remaining = budget - quantity * minDenom

    // Randomly upgrade envelopes to higher denominations
    let attempts = 0
    while (remaining > 0 && attempts < 50000) {
        const idx = Math.floor(Math.random() * quantity)
        const current = amounts[idx]
        const currentDenomIdx = denoms.indexOf(current)

        if (currentDenomIdx < denoms.length - 1) {
            // Find possible upgrades
            const possibleUpgrades = denoms
                .slice(currentDenomIdx + 1)
                .filter(d => d - current <= remaining)

            if (possibleUpgrades.length > 0) {
                const upgrade = possibleUpgrades[Math.floor(Math.random() * possibleUpgrades.length)]
                remaining -= (upgrade - current)
                amounts[idx] = upgrade
            }
        }
        attempts++
    }

    // If still remaining (edge case), do a greedy pass
    if (remaining > 0) {
        for (let i = 0; i < quantity && remaining > 0; i++) {
            const current = amounts[i]
            const currentDenomIdx = denoms.indexOf(current)
            for (let j = denoms.length - 1; j > currentDenomIdx; j--) {
                const cost = denoms[j] - current
                if (cost <= remaining) {
                    remaining -= cost
                    amounts[i] = denoms[j]
                    break
                }
            }
        }
    }

    // Validate: every amount must be a valid denomination
    for (const amt of amounts) {
        if (!denoms.includes(amt)) {
            throw new Error(`Lỗi phân phối: ${amt} không phải mệnh giá hợp lệ.`)
        }
    }

    // Validate: total must not exceed budget
    const total = amounts.reduce((a: number, b: number) => a + b, 0)
    if (total > budget) {
        throw new Error(`Lỗi: tổng (${total.toLocaleString('vi-VN')}) vượt quá ngân sách (${budget.toLocaleString('vi-VN')}).`)
    }

    // Shuffle with Fisher-Yates
    for (let i = amounts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [amounts[i], amounts[j]] = [amounts[j], amounts[i]]
    }

    // Create envelope data with random positions and images
    return amounts.map((amount: number) => ({
        amount,
        imageUrl: LI_XI_IMAGES[Math.floor(Math.random() * LI_XI_IMAGES.length)],
        positionTop: 15 + Math.random() * 55,
        positionLeft: 10 + Math.random() * 80,
        positionDelay: Math.random() * 2,
    }))
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
