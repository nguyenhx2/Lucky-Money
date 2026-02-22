/**
 * Kho lời chúc Tết Bính Ngọ 2026
 * Vietnamese Lunar New Year wishes for Year of the Horse
 */

const TET_WISHES: string[] = [
    // Chúc sức khỏe & may mắn
    'Năm mới Bính Ngọ, chúc bạn vạn sự như ý, mã đáo thành công!',
    'Chúc năm mới an khang thịnh vượng, phi ngựa đón tài lộc đầy nhà!',
    'Tết đến xuân về, mong bạn luôn khỏe mạnh, hạnh phúc tràn đầy!',
    'Năm Ngọ vạn lộc, chúc gia đình bình an, vui vẻ bên nhau!',
    'Chúc mừng năm mới! Mã đáo thành công, vạn sự hanh thông!',

    // Chúc sự nghiệp
    'Năm Bính Ngọ, chúc công việc thuận lợi, thăng tiến vượt bậc!',
    'Xuân Bính Ngọ, phi như ngựa chiến, chinh phục mọi đỉnh cao!',
    'Năm mới tới, chúc sự nghiệp thăng hoa, lương thưởng rủng rỉnh!',
    'Tết Bính Ngọ, chúc bạn như ngựa chiến trường, dũng mãnh tiến về phía trước!',
    'Chúc năm mới code chạy không bug, deploy lần nào cũng xanh!',

    // Chúc tài lộc
    'Lộc xuân đầu năm, ngựa vàng mang phúc, tiền bạc đầy kho!',
    'Năm Ngọ phát tài, tiền vào như nước, lộc đến như mây!',
    'Xuân về lộc đến, chúc bạn túi luôn đầy, ví không bao giờ vơi!',
    'Tết Bính Ngọ, mã đáo thành công, kim ngân đầy túi!',
    'Năm mới năm me, lì xì đầy ví, may mắn ngập tràn!',

    // Chúc hạnh phúc & tình yêu
    'Chúc bạn năm mới tràn đầy yêu thương, hạnh phúc bền lâu!',
    'Xuân Bính Ngọ, chúc tình yêu nở hoa, duyên lành kết trái!',
    'Năm mới chúc bạn gặp nhiều niềm vui, nụ cười luôn trên môi!',
    'Tết đến chúc gia đình hạnh phúc, sum vầy ấm áp bên nhau!',
    'Năm Ngọ chúc bạn yêu đời, sống vui, sống khỏe mỗi ngày!',

    // Chúc vui vẻ & đặc biệt
    'Bính Ngọ rước lộc, ngựa phi về đích, ước mơ thành hiện thực!',
    'Năm mới chúc bạn đẹp trai/xinh gái hơn, giàu có gấp đôi!',
    'Tết Ngọ an vui, mọi ước mong đều trọn vẹn, xuân tươi rạng rỡ!',
    'Chúc năm mới ngựa phi vạn dặm, thành công rực rỡ!',
    'Xuân Bính Ngọ, chúc bạn NTQ-er thật nhiều sức khỏe và niềm vui!',
    'Xuân Bính Ngọ, chúc bạn luôn giữ được tinh thần lạc quan và năng lượng tích cực!',
    'Năm mới chúc bạn đi thật xa, làm thật tốt và sống thật vui!',
    'Bính Ngọ gõ cửa, mong bạn thêm một tuổi mới nhiều trưởng thành và thành công!',
    'Năm Bính Ngọ, chúc bạn dám nghĩ, dám làm và dám bứt phá!',
    'Chúc bạn một năm mới bình an trong tâm, vững vàng trong bước đi!',
    'Xuân này mong bạn luôn được yêu thương và trân trọng!',
    'Năm mới chúc bạn tài lộc đủ đầy, niềm vui trọn vẹn!',
    'Bính Ngọ rực rỡ, chúc bạn một năm đáng nhớ và nhiều điều tự hào!',
    'Năm Bính Ngọ, chúc bạn tăng tốc như chiến mã, đổi mới không ngừng, bứt phá mọi giới hạn!',
]

/**
 * Get a random Tết wish for the Year of the Horse 2026
 */
export function getRandomWish(): string {
    return TET_WISHES[Math.floor(Math.random() * TET_WISHES.length)]
}

/**
 * All wishes for reference
 */
export const ALL_WISHES = TET_WISHES
