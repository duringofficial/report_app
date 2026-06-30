import type { Report, ReportCategory, ReportStatus } from './types'

let kvClient: typeof import('@vercel/kv').kv | null = null

async function getKV() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  if (!kvClient) {
    const mod = await import('@vercel/kv')
    kvClient = mod.kv
  }
  return kvClient
}

// In-memory fallback for local dev (non-persistent)
const memStore = new Map<string, unknown>()
const memSets = new Map<string, Array<{ score: number; member: string }>>()

const mem = {
  async get<T>(key: string): Promise<T | null> {
    return (memStore.get(key) as T) ?? null
  },
  async set(key: string, value: unknown): Promise<void> {
    memStore.set(key, value)
  },
  async zadd(key: string, entry: { score: number; member: string }): Promise<void> {
    const set = memSets.get(key) ?? []
    set.push(entry)
    memSets.set(key, set)
  },
  async zrange(key: string, start: number, stop: number, opts?: { rev?: boolean }): Promise<string[]> {
    const set = memSets.get(key) ?? []
    const sorted = [...set].sort((a, b) => opts?.rev ? b.score - a.score : a.score - b.score)
    const end = stop === -1 ? sorted.length : stop + 1
    return sorted.slice(start, end).map((e) => e.member)
  },
  async zcard(key: string): Promise<number> {
    return (memSets.get(key) ?? []).length
  },
}

async function kget<T>(key: string): Promise<T | null> {
  const kv = await getKV()
  if (kv) return kv.get<T>(key)
  return mem.get<T>(key)
}

async function kset(key: string, value: unknown): Promise<void> {
  const kv = await getKV()
  if (kv) { await kv.set(key, value); return }
  await mem.set(key, value)
}

async function kzadd(key: string, entry: { score: number; member: string }): Promise<void> {
  const kv = await getKV()
  if (kv) { await kv.zadd(key, entry); return }
  await mem.zadd(key, entry)
}

async function kzrange(key: string, start: number, stop: number, opts?: { rev?: boolean }): Promise<string[]> {
  const kv = await getKV()
  if (kv) return kv.zrange(key, start, stop, { rev: opts?.rev })
  return mem.zrange(key, start, stop, opts)
}

async function kzcard(key: string): Promise<number> {
  const kv = await getKV()
  if (kv) return kv.zcard(key)
  return mem.zcard(key)
}

export async function saveReport(report: Report): Promise<void> {
  await kset(`report:${report.id}`, report)
  await kzadd('reports:all', { score: report.createdAt, member: report.id })
  await kzadd(`reports:cat:${report.category}`, { score: report.createdAt, member: report.id })
}

export async function getReport(id: string): Promise<Report | null> {
  return kget<Report>(`report:${id}`)
}

export async function updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
  const report = await getReport(id)
  if (!report) return null
  const updated = { ...report, ...updates, updatedAt: Date.now() }
  await kset(`report:${id}`, updated)
  return updated
}

export async function listReports(opts?: {
  category?: ReportCategory
  status?: ReportStatus
  limit?: number
  offset?: number
}): Promise<{ reports: Report[]; total: number }> {
  const key = opts?.category ? `reports:cat:${opts.category}` : 'reports:all'
  const total = await kzcard(key)
  const ids = await kzrange(key, opts?.offset ?? 0, -1, { rev: true })

  const reports: Report[] = []
  for (const id of ids) {
    const r = await getReport(id)
    if (!r) continue
    if (opts?.status && r.status !== opts.status) continue
    reports.push(r)
    if (opts?.limit && reports.length >= opts.limit) break
  }

  return { reports, total }
}

export async function countByCategory(): Promise<Record<string, number>> {
  const cats = ['harassment', 'sexual', 'violence', 'improvement', 'safety']
  const counts: Record<string, number> = {}
  for (const cat of cats) {
    counts[cat] = await kzcard(`reports:cat:${cat}`)
  }
  return counts
}
