'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { CATEGORIES, STATUS_LABELS } from '@/lib/types'
import type { ReportStatus, ReportCategory } from '@/lib/types'

interface CheckResult {
  id: string
  category: ReportCategory
  status: ReportStatus
  createdAt: number
}

function CheckContent() {
  const searchParams = useSearchParams()
  const [reportId, setReportId] = useState(searchParams.get('id') ?? '')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async (id?: string) => {
    const target = id ?? reportId
    if (!target.trim()) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${target.trim()}`)
      if (!res.ok) {
        setError('접수번호를 찾을 수 없습니다. 번호를 다시 확인해주세요.')
        return
      }
      setResult(await res.json())
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) handleCheck(id)
  }, [])

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-blue-500" />,
    reviewing: <AlertCircle className="w-5 h-5 text-amber-500" />,
    completed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  }

  return (
    <div className="min-h-dvh bg-[#f0f4f8]">
      <div style={{ background: 'linear-gradient(160deg, #0f2447 0%, #1e3a5f 100%)' }} className="px-4 pt-8 pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">뒤로</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">처리현황 조회</h1>
        <p className="text-blue-300 text-sm mt-1">접수번호로 신고 처리 상태를 확인합니다</p>
      </div>

      <div className="px-4 -mt-8 pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">접수번호 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="RPT-202506-XXXXX"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              onClick={() => handleCheck()}
              disabled={loading || !reportId.trim()}
              className="px-4 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Search className="w-4 h-4" />
              )}
              조회
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-scale-in">
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-4">조회 결과</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">접수번호</span>
                <span className="font-mono text-sm font-bold text-slate-800">{result.id}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">신고 유형</span>
                <span className={`text-sm font-semibold ${CATEGORIES[result.category]?.color}`}>
                  {CATEGORIES[result.category]?.icon} {CATEGORIES[result.category]?.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">접수일시</span>
                <span className="text-sm text-slate-700">
                  {new Date(result.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">처리 상태</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${STATUS_LABELS[result.status].bg}`}>
                  {statusIcons[result.status]}
                  <span className={`text-sm font-semibold ${STATUS_LABELS[result.status].color}`}>
                    {STATUS_LABELS[result.status].label}
                  </span>
                </div>
              </div>
            </div>

            {result.status === 'completed' && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-700 font-semibold">처리가 완료되었습니다.</p>
                <p className="text-xs text-emerald-600 mt-0.5">신고해 주셔서 감사합니다.</p>
              </div>
            )}
            {result.status === 'reviewing' && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 font-semibold">현재 담당자가 검토 중입니다.</p>
                <p className="text-xs text-amber-600 mt-0.5">신속히 처리하겠습니다.</p>
              </div>
            )}
            {result.status === 'pending' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 font-semibold">신고가 접수되었습니다.</p>
                <p className="text-xs text-blue-600 mt-0.5">담당자 검토 후 처리가 시작됩니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f0f4f8] flex items-center justify-center"><p className="text-slate-400">로딩 중...</p></div>}>
      <CheckContent />
    </Suspense>
  )
}
