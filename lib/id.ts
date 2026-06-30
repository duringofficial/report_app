const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateReportId(): string {
  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const rand = Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  return `RPT-${ym}-${rand}`
}
