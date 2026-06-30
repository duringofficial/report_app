'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Save, Trash2 } from 'lucide-react'
import { CATEGORIES, STATUS_LABELS } from '@/lib/types'
import type { Report, ReportStatus } from '@/lib/types'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<ReportStatus>('pending')
  const [adminNote, setAdminNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const token = document.cookie.match(/admin_token=([^;]+)/)?.[1]
    fetch(`/api/reports/${id}`, {
      headers: { 'x-admin-token': token ?? '' },
    })
      .then((r) => {
        if (r.status === 401) { router.push('/admin'); return null }
        if (!r.ok) { router.push('/admin/dashboard'); return null }
        return r.json()
      })
      .then((data) => {
        if (data) {
          setReport(data)
          setStatus(data.status)
          setAdminNote(data.adminNote ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSave = async () => {
    const token = document.cookie.match(/admin_token=([^;]+)/)?.[1]
    setSaving(true)
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token ?? '' },
        body: JSON.stringify({ status, adminNote }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReport(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const cat = CATEGORIES[report.category]

  const statusOptions: { value: ReportStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'pending', label: '접수됨', icon: <Clock className="w-4 h-4" />, color: 'border-blue-300 bg-blue-50 text-blue-700' },
    { value: 'reviewing', label: '처리중', icon: <AlertTriangle className="w-4 h-4" />, color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { value: 'completed', label: '완료', icon: <CheckCircle className="w-4 h-4" />, color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  ]

  return (
    <div className="min-h-dvh bg-[#f0f4f8]">
      <div style={{ background: 'linear-gradient(160deg, #0f2447 0%, #1e3a5f 100%)' }} className="px-4 pt-8 pb-16">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">목록으로</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center text-2xl`}>
            {cat.icon}
          </div>
          <div>
            <p className="text-xs text-blue-300 mb-0.5">{report.id}</p>
            <h1 className="text-xl font-bold text-white">{cat.label}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 pb-10 space-y-4 max-w-2xl mx-auto">
        {/* Report content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-4">신고 내용</p>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">상세 내용</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{report.content}</p>
              </div>
            </div>

            {/* 익명/기명 배지 */}
            <div className="flex items-center gap-2">
              {report.isAnonymous === false ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                  👤 기명 신고
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                  🔒 익명 신고
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {report.reporterName && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">신고자 이름</p>
                  <p className="text-sm font-medium text-slate-700">{report.reporterName}</p>
                </div>
              )}
              {report.reporterDept && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">신고자 부서</p>
                  <p className="text-sm font-medium text-slate-700">{report.reporterDept}</p>
                </div>
              )}
              {report.incidentDate && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">발생일</p>
                  <p className="text-sm font-medium text-slate-700">{report.incidentDate}</p>
                </div>
              )}
              {report.location && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">발생 장소</p>
                  <p className="text-sm font-medium text-slate-700">{report.location}</p>
                </div>
              )}
              {report.contact && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-1">연락처</p>
                  <p className="text-sm font-medium text-slate-700">{report.contact}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                접수일시: {new Date(report.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* Status management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-4">처리 관리</p>

          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">처리 상태 변경</p>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-xs font-semibold ${
                    status === opt.value
                      ? opt.color + ' border-opacity-100'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              내부 메모 <span className="text-slate-400 font-normal">(직원에게 표시되지 않음)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="처리 관련 메모를 입력하세요..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
            />
          </div>

          {saved && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 font-medium">저장되었습니다.</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                변경사항 저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
