import { formatCurrency, THIEP_IMAGES } from './distribute'
import { readFileSync } from 'fs'
import { join } from 'path'

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || ''
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || ''
const MAILGUN_FROM = `Lộc Xuân 2026 <hailoc@${MAILGUN_DOMAIN}>`

/**
 * Read a local asset from the public folder and return
 * { buffer, filename, contentType } for Mailgun inline attachment.
 */
function readLocalAsset(localPath: string | null | undefined): {
  buffer: Buffer; filename: string; contentType: string; cid: string
} | null {
  if (!localPath) return null
  try {
    const filePath = localPath.startsWith('http')
      ? null // skip remote URLs — shouldn't happen
      : join(process.cwd(), 'public', localPath)
    if (!filePath) return null

    const buffer = readFileSync(filePath)
    const filename = localPath.split('/').pop() || 'image.webp'
    const ext = filename.split('.').pop()?.toLowerCase() || 'webp'
    const mimeMap: Record<string, string> = {
      webp: 'image/webp', png: 'image/png',
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'
    // CID = content ID used in <img src="cid:..."> in HTML
    const cid = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return { buffer, filename, contentType, cid }
  } catch (err) {
    console.error(`Failed to read image for email: ${localPath}`, err)
    return null
  }
}

function buildEmailHtml(
  name: string,
  amount: number,
  liXiCid?: string | null,
  thiepCid?: string | null,
  logoCid?: string | null,
  wish?: string | null
): string {
  const formattedAmount = formatCurrency(amount)

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chúc mừng ${name}!</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:16px 0;">
<tr><td align="center" style="padding:0 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#E8302A,#C41E1E);border-radius:20px 20px 0 0;padding:32px 24px 24px;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">🧧</div>
    <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:800;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.15);">Hái Lộc Đầu Xuân</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">Tết Bính Ngọ 2026 🐎</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="background:#FFFFFF;padding:28px 24px 16px;text-align:center;">
    <p style="margin:0;color:#333333;font-size:16px;line-height:1.5;">Xin chào <strong style="color:#E8302A;">${name}</strong> 👋</p>
    <p style="margin:8px 0 0;color:#666666;font-size:15px;line-height:1.5;">Chúc mừng bạn đã nhận được lộc xuân! 🌸</p>
  </td></tr>

  <!-- Amount Card -->
  <tr><td style="background:#FFFFFF;padding:8px 24px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#FFF5E6,#FFF0D6);border:2px solid #FFD700;border-radius:16px;">
      <tr><td style="padding:24px 16px;text-align:center;">
        <p style="margin:0 0 6px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Số tiền bạn nhận được</p>
        <h2 style="margin:0;color:#E8302A;font-size:36px;font-weight:900;letter-spacing:0.5px;">${formattedAmount}</h2>
      </td></tr>
    </table>
  </td></tr>

  ${liXiCid ? `
  <!-- Lì xì Image -->
  <tr><td style="background:#FFFFFF;padding:12px 24px;text-align:center;">
    <img src="cid:${liXiCid}" alt="Bao lì xì" style="display:inline-block;max-width:120px;max-height:180px;width:auto;height:auto;border-radius:12px;border:2px solid #FFD700;box-shadow:0 4px 16px rgba(0,0,0,0.1);" />
  </td></tr>
  ` : ''}

  ${wish ? `
  <!-- Lời chúc Tết -->
  <tr><td style="background:#FFFFFF;padding:16px 24px;text-align:center;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#FFF8F0,#FFFAF5);border:1px solid #FFE4B0;border-radius:12px;">
      <tr><td style="padding:16px 20px;text-align:center;">
        <p style="margin:0;color:#C41E1E;font-size:15px;line-height:1.6;font-style:italic;font-weight:500;">"${wish}"</p>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Thiệp chúc Tết -->
  <tr><td style="background:#FFFFFF;padding:12px 24px 20px;text-align:center;">
    <p style="margin:0 0 10px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">🎋 Thiệp chúc Tết 🎋</p>
    ${thiepCid
      ? `<img src="cid:${thiepCid}" alt="Thiệp chúc Tết" width="460" style="display:block;width:100%;max-width:460px;border-radius:14px;border:2px solid #FFE4B0;box-shadow:0 6px 20px rgba(0,0,0,0.08);margin:0 auto;" />`
      : `<p style="color:#ccc;font-size:14px;">Thiệp không khả dụng</p>`}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:linear-gradient(135deg,#E8302A,#C41E1E);border-radius:0 0 20px 20px;padding:20px 24px;text-align:center;">
    <p style="margin:0;color:rgba(255,255,255,0.95);font-size:11px;font-weight:600;">${logoCid ? `<img src="cid:${logoCid}" alt="NTQ" style="display:block;height:24px;margin:0 auto 8px;" />` : ''}From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" style="color:rgba(255,255,255,0.95);text-decoration:underline;">NTQ Technology</a> with ❤️</p>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:11px;font-weight:400;">🐎 Tết Bính Ngọ 2026 — Hái Lộc Đầu Xuân</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:10px;">Email tự động. Vui lòng không trả lời.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function sendLiXiEmail(
  to: string,
  name: string,
  amount: number,
  imageUrl?: string | null,
  wish?: string | null,
  thiepUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    return { success: false, error: 'Mailgun not configured' }
  }

  // Use provided thiepUrl (from DB) or fall back to random
  const thiepPath = thiepUrl || THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)]
  const thiepAsset = readLocalAsset(thiepPath)
  const liXiAsset = readLocalAsset(imageUrl)
  const logoAsset = readLocalAsset('/images/NTQ-logo-white.png')

  const html = buildEmailHtml(
    name,
    amount,
    liXiAsset?.cid || null,
    thiepAsset?.cid || null,
    logoAsset?.cid || null,
    wish
  )

  // Build multipart/form-data with inline attachments
  const formData = new FormData()
  formData.append('from', MAILGUN_FROM)
  formData.append('to', to)
  formData.append('subject', `🧧 Chúc mừng ${name}! Bạn đã nhận lộc Tết Bính Ngọ 2026 🐎`)
  formData.append('html', html)

  // Attach images inline (Mailgun "inline" field)
  if (liXiAsset) {
    const blob = new Blob([new Uint8Array(liXiAsset.buffer)], { type: liXiAsset.contentType })
    formData.append('inline', blob, liXiAsset.cid)
  }
  if (thiepAsset) {
    const blob = new Blob([new Uint8Array(thiepAsset.buffer)], { type: thiepAsset.contentType })
    formData.append('inline', blob, thiepAsset.cid)
  }
  if (logoAsset) {
    const blob = new Blob([new Uint8Array(logoAsset.buffer)], { type: logoAsset.contentType })
    formData.append('inline', blob, logoAsset.cid)
  }

  try {
    const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
      },
      body: formData,
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error('Mailgun error:', res.status, txt)
      return { success: false, error: `Mailgun ${res.status}: ${txt}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

// ─── Combined Email: Lộc + Bonus ───

interface DrawInfo {
  amount: number
  imageUrl?: string | null
  wish?: string | null
  thiepUrl?: string | null
}

function buildCombinedEmailHtml(
  name: string,
  firstDraw: DrawInfo,
  bonusDraw: DrawInfo,
  liXi1Cid?: string | null,
  liXi2Cid?: string | null,
  thiep1Cid?: string | null,
  thiep2Cid?: string | null,
  logoCid?: string | null
): string {
  const total = firstDraw.amount + bonusDraw.amount
  const f1 = formatCurrency(firstDraw.amount)
  const f2 = formatCurrency(bonusDraw.amount)
  const fTotal = formatCurrency(total)

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chúc mừng ${name}!</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:16px 0;">
<tr><td align="center" style="padding:0 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#E8302A,#C41E1E);border-radius:20px 20px 0 0;padding:32px 24px 24px;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">🧧</div>
    <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:800;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.15);">Hái Lộc Đầu Xuân</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">Tết Bính Ngọ 2026 🐎</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="background:#FFFFFF;padding:28px 24px 16px;text-align:center;">
    <p style="margin:0;color:#333333;font-size:16px;line-height:1.5;">Xin chào <strong style="color:#E8302A;">${name}</strong> 👋</p>
    <p style="margin:8px 0 0;color:#666666;font-size:15px;line-height:1.5;">Chúc mừng bạn đã nhận được lộc xuân kép! 🌸✨</p>
  </td></tr>

  <!-- 2 Lì xì images side-by-side -->
  ${liXi1Cid || liXi2Cid ? `
  <tr><td style="background:#FFFFFF;padding:12px 24px;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        ${liXi1Cid ? `<td style="padding:0 8px;text-align:center;vertical-align:top;">
          <p style="margin:0 0 6px;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lộc lần 1</p>
          <img src="cid:${liXi1Cid}" alt="Bao lì xì" style="display:inline-block;max-width:100px;max-height:150px;width:auto;height:auto;border-radius:10px;border:2px solid #FFD700;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
        </td>` : ''}
        ${liXi2Cid ? `<td style="padding:0 8px;text-align:center;vertical-align:top;">
          <p style="margin:0 0 6px;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lộc thêm</p>
          <img src="cid:${liXi2Cid}" alt="Bao lì xì Lộc thêm" style="display:inline-block;max-width:100px;max-height:150px;width:auto;height:auto;border-radius:10px;border:2px solid #9B59B6;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
        </td>` : ''}
      </tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Amount Cards: Lộc + Bonus -->
  <tr><td style="background:#FFFFFF;padding:8px 24px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#FFF5E6,#FFF0D6);border:2px solid #FFD700;border-radius:16px;">
      <tr><td style="padding:18px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">🧧 Lộc lần 1</p>
        <h2 style="margin:0;color:#E8302A;font-size:28px;font-weight:900;">${f1}</h2>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#FFFFFF;padding:8px 24px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#F5F0FF,#EDE5FF);border:2px solid #9B59B6;border-radius:16px;">
      <tr><td style="padding:18px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">🎁 Lộc thêm</p>
        <h2 style="margin:0;color:#8E44AD;font-size:28px;font-weight:900;">${f2}</h2>
      </td></tr>
    </table>
  </td></tr>

  <!-- Total -->
  <tr><td style="background:#FFFFFF;padding:12px 24px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#C41E1E,#A31818);border-radius:16px;">
      <tr><td style="padding:20px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:rgba(255,255,255,0.85);font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">🎉 Tổng lộc nhận được</p>
        <h2 style="margin:0;color:#FFD700;font-size:32px;font-weight:900;">${fTotal}</h2>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Phúc lộc song toàn — May mắn nhân đôi! 🍀</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Wish 1 -->
  ${firstDraw.wish ? `
  <tr><td style="background:#FFFFFF;padding:8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#FFF8F0,#FFFAF5);border:1px solid #FFE4B0;border-radius:12px;">
      <tr><td style="padding:14px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#999;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lời chúc lần 1</p>
        <p style="margin:0;color:#C41E1E;font-size:14px;line-height:1.6;font-style:italic;font-weight:500;">"${firstDraw.wish}"</p>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Wish 2 (Bonus) -->
  ${bonusDraw.wish ? `
  <tr><td style="background:#FFFFFF;padding:8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#F5F0FF,#FAF5FF);border:1px solid #D5C4F7;border-radius:12px;">
      <tr><td style="padding:14px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#999;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lời chúc Lộc thêm</p>
        <p style="margin:0;color:#8E44AD;font-size:14px;line-height:1.6;font-style:italic;font-weight:500;">"${bonusDraw.wish}"</p>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Thiệp 1 -->
  <tr><td style="background:#FFFFFF;padding:12px 24px 8px;text-align:center;">
    <p style="margin:0 0 10px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">🎋 Thiệp chúc Tết — Lần 1 🎋</p>
    ${thiep1Cid
      ? `<img src="cid:${thiep1Cid}" alt="Thiệp 1" width="460" style="display:block;width:100%;max-width:460px;border-radius:14px;border:2px solid #FFE4B0;box-shadow:0 6px 20px rgba(0,0,0,0.08);margin:0 auto;" />`
      : `<p style="color:#ccc;font-size:14px;">Thiệp không khả dụng</p>`}
  </td></tr>

  <!-- Thiệp 2 (Bonus) -->
  <tr><td style="background:#FFFFFF;padding:8px 24px 20px;text-align:center;">
    <p style="margin:0 0 10px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">🎁 Thiệp Lộc thêm 🎁</p>
    ${thiep2Cid
      ? `<img src="cid:${thiep2Cid}" alt="Thiệp Lộc thêm" width="460" style="display:block;width:100%;max-width:460px;border-radius:14px;border:2px solid #D5C4F7;box-shadow:0 6px 20px rgba(0,0,0,0.08);margin:0 auto;" />`
      : `<p style="color:#ccc;font-size:14px;">Thiệp không khả dụng</p>`}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:linear-gradient(135deg,#E8302A,#C41E1E);border-radius:0 0 20px 20px;padding:20px 24px;text-align:center;">
    <p style="margin:0;color:rgba(255,255,255,0.95);font-size:11px;font-weight:600;">${logoCid ? `<img src="cid:${logoCid}" alt="NTQ" style="display:block;height:24px;margin:0 auto 8px;" />` : ''}From <a href="https://www.ntq.technology/" target="_blank" rel="noopener noreferrer" style="color:rgba(255,255,255,0.95);text-decoration:underline;">NTQ Technology</a> with ❤️</p>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:11px;font-weight:400;">🐎 Tết Bính Ngọ 2026 — Hái Lộc Đầu Xuân</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:10px;">Email tự động. Vui lòng không trả lời.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function sendCombinedLiXiEmail(
  to: string,
  name: string,
  firstDraw: DrawInfo,
  bonusDraw: DrawInfo
): Promise<{ success: boolean; error?: string }> {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    return { success: false, error: 'Mailgun not configured' }
  }

  const thiep1Path = firstDraw.thiepUrl || THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)]
  // Bonus thiệp must differ from first draw’s thiệp
  const thiep2Candidates = THIEP_IMAGES.filter(t => t !== thiep1Path)
  const thiep2Path = bonusDraw.thiepUrl || (thiep2Candidates.length > 0 ? thiep2Candidates[Math.floor(Math.random() * thiep2Candidates.length)] : THIEP_IMAGES[Math.floor(Math.random() * THIEP_IMAGES.length)])
  const thiep1Asset = readLocalAsset(thiep1Path)
  const thiep2Asset = readLocalAsset(thiep2Path)
  const liXi1Asset = readLocalAsset(firstDraw.imageUrl)
  const liXi2Asset = readLocalAsset(bonusDraw.imageUrl)
  const logoAsset = readLocalAsset('/images/NTQ-logo-white.png')

  // Ensure unique CIDs for 2 different thiệp/lì xì
  if (thiep2Asset && thiep1Asset && thiep2Asset.cid === thiep1Asset.cid) {
    thiep2Asset.cid = 'bonus_' + thiep2Asset.cid
  }
  if (liXi2Asset && liXi1Asset && liXi2Asset.cid === liXi1Asset.cid) {
    liXi2Asset.cid = 'bonus_' + liXi2Asset.cid
  }

  const html = buildCombinedEmailHtml(
    name,
    firstDraw,
    bonusDraw,
    liXi1Asset?.cid || null,
    liXi2Asset?.cid || null,
    thiep1Asset?.cid || null,
    thiep2Asset?.cid || null,
    logoAsset?.cid || null
  )

  const formData = new FormData()
  formData.append('from', MAILGUN_FROM)
  formData.append('to', to)
  const total = formatCurrency(firstDraw.amount + bonusDraw.amount)
  formData.append('subject', `🧧 Chúc mừng ${name}! Lộc kép ${total} - Tết Bính Ngọ 2026 🐎`)
  formData.append('html', html)

  // Attach all images inline
  for (const asset of [liXi1Asset, liXi2Asset, thiep1Asset, thiep2Asset, logoAsset]) {
    if (asset) {
      const blob = new Blob([new Uint8Array(asset.buffer)], { type: asset.contentType })
      formData.append('inline', blob, asset.cid)
    }
  }

  try {
    const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
      },
      body: formData,
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error('Mailgun combined error:', res.status, txt)
      return { success: false, error: `Mailgun ${res.status}: ${txt}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Combined email send error:', error)
    return { success: false, error: error.message }
  }
}
