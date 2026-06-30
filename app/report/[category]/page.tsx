'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Lock, AlertCircle } from 'lucide-react'
import { CATEGORIES } from '@/lib/types'
import type { ReportCategory } from '@/lib/types'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as ReportCategory

  const cat = CATEGORIES[category]

  const [form, setForm] = useState({
    content: '',
    incidentDate: '',
    location: '',
    contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!cat) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f0f4f8]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">잘못된 신고 유형입니다.</p>
          <Link href="/" className="text-blue-600 font-medium">← 처음으로</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.content.trim().length < 10) {
      setError('상세 내용을 10자 이상 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, ...form }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      router.push(`/success?id=${data.id}`)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#f0f4f8]">
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0f2447 0%, #1e3a5f 100%)' }} className="px-4 pt-8 pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">뒤로</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center text-2xl`}>
            {cat.icon}
          </div>
          <div>
            <p className="text-xs text-blue-300 mb-0.5">신고 유형</p>
            <h1 className="text-xl font-bold text-white">{cat.label}</h1>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="px-4 -mt-8 pb-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Privacy notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border-b border-blue-100">
            <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              이름·사번 등 개인정보는 수집되지 않으며, IP 주소도 저장하지 않습니다.
              연락처는 본인이 원할 경우에만 선택적으로 입력하세요.
            </p>
          </div>

          <div className="p-5 space-y-5">
            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                상세 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="육하원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜)에 따라 구체적으로 작성해 주시면 신속한 처리에 도움이 됩니다."
                rows={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                required
              />
              <p className="mt-1 text-xs text-slate-400 text-right">{form.content.length}자</p>
            </div>

            {/* Incident Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                발생일 <span className="text-slate-400 font-normal">(선택)</span>
              </label>
              <input
                type="date"
                value={form.incidentDate}
                onChange={(e) => setForm((f) => ({ ...f, incidentDate: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                발생 부서·장소 <span className="text-slate-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="예: 2공장 작업실, 영업팀 사무실"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                연락처 <span className="text-slate-400 font-normal">(선택·익명 유지 가능)</span>
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="처리 결과 안내를 원하시면 입력 (전화·이메일)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                입력하지 않아도 신고가 접수됩니다. 연락처를 남기시면 처리 결과를 안내받을 수 있습니다.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  제출 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  신고 제출하기
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              제출 버튼을 누르면 신고가 접수되고 접수번호가 발급됩니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
