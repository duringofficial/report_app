import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { listReports, countByCategory } from '@/lib/kv'
import { CATEGORIES, STATUS_LABELS } from '@/lib/types'
import type { Report, ReportCategory } from '@/lib/types'
import Link from 'next/link'
import { LogOut, BarChart3, FileText, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react'

async function getAdminToken() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_token')?.value
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>
}) {
  const token = await getAdminToken()
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    redirect('/admin')
  }

  const { category, status } = await searchParams
  const { reports, total } = await listReports({
    category: category as ReportCategory | undefined,
    status: status as 'pending' | 'reviewing' | 'completed' | undefined,
  })
  const counts = await countByCategory()
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

  const allReports = await listReports({})
  const pendingCount = allReports.reports.filter((r: Report) => r.status === 'pending').length
  const reviewingCount = allReports.reports.filter((r: Report) => r.status === 'reviewing').length
  const completedCount = allReports.reports.filter((r: Report) => r.status === 'completed').length

  return (
    <div className="min-h-dvh bg-[#f0f4f8]">
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(160deg, #0f2447 0%, #1e3a5f 100%)' }} className="px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">관리자 대시보드</h1>
            <p className="text-blue-300 text-xs">KET 익명 신고 채널</p>
          </div>
          <form action="/api/admin/login" method="POST">
            <div className="flex items-center gap-4">
            <a
              href="/api/admin/export"
              className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV 내보내기
            </a>
            <Link
              href="/api/admin/logout"
              className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </Link>
          </div>
          </form>
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="전체 신고"
            value={totalCount}
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="접수됨"
            value={pendingCount}
            icon={<Clock className="w-5 h-5 text-slate-500" />}
            color="bg-slate-50"
          />
          <StatCard
            label="처리중"
            value={reviewingCount}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            color="bg-amber-50"
          />
          <StatCard
            label="완료"
            value={completedCount}
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
            color="bg-emerald-50"
          />
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">유형별 현황</p>
          </div>
          <div className="space-y-2">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = counts[key] ?? 0
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{cat.icon} {cat.label}</span>
                    <span className="text-xs font-semibold text-slate-700">{count}건</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                      style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/admin/dashboard"
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !category && !status
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            전체
          </Link>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link
              key={key}
              href={`/admin/dashboard?category=${key}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === key
                  ? `${cat.color.replace('text-', 'bg-').replace('-700', '-600')} text-white border-transparent`
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['pending', 'reviewing', 'completed'] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/dashboard?${category ? `category=${category}&` : ''}status=${s}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                status === s
                  ? `${STATUS_LABELS[s].bg} ${STATUS_LABELS[s].color} border-transparent`
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {STATUS_LABELS[s].label}
            </Link>
          ))}
        </div>

        {/* Report list */}
        <div>
          <p className="text-xs text-slate-400 mb-3">총 {total}건</p>
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-slate-400 text-sm">신고 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report: Report) => {
                const cat = CATEGORIES[report.category]
                const statusInfo = STATUS_LABELS[report.status]
                return (
                  <Link
                    key={report.id}
                    href={`/admin/dashboard/${report.id}`}
                    className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-4 card-hover"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-sm font-semibold ${cat.color}`}>{cat.label}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{report.content}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(report.createdAt).toLocaleDateString('ko-KR')} · {report.id}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
