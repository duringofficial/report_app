'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Copy, Search, Home } from 'lucide-react'
import { useState, Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-dvh bg-[#f0f4f8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Success icon */}
        <div className="flex justify-center mb-6 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-7 animate-fade-in-up opacity-0 delay-200" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">신고가 접수되었습니다</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            담당자가 검토 후 신속히 처리하겠습니다.<br />
            아래 접수번호를 꼭 보관해 주세요.
          </p>
        </div>

        {/* Report ID card */}
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 animate-fade-in-up opacity-0 delay-300"
          style={{ animationFillMode: 'forwards' }}
        >
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-3">접수번호</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <p className="font-mono text-lg font-bold text-slate-800 tracking-widest">{id}</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0"
              title="복사"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-blue-500" />
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 leading-relaxed">
              ⚠️ 이 번호는 다시 확인하기 어렵습니다. 스크린샷을 찍거나 메모해 보관하세요.
            </p>
          </div>
        </div>

        {/* Processing timeline */}
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 animate-fade-in-up opacity-0 delay-400"
          style={{ animationFillMode: 'forwards' }}
        >
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-4">처리 절차</p>
          <div className="space-y-3">
            {[
              { step: '접수', desc: '신고가 시스템에 등록됩니다', done: true },
              { step: '검토', desc: '담당자가 내용을 검토합니다', done: false },
              { step: '처리', desc: '적절한 조치가 취해집니다', done: false },
              { step: '완료', desc: '처리 결과가 반영됩니다', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {item.done ? '✓' : i + 1}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${item.done ? 'text-emerald-700' : 'text-slate-500'}`}>{item.step}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          className="grid grid-cols-2 gap-3 animate-fade-in-up opacity-0 delay-500"
          style={{ animationFillMode: 'forwards' }}
        >
          <Link
            href={`/check?id=${id}`}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            현황 조회
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
          >
            <Home className="w-4 h-4" />
            처음으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f0f4f8] flex items-center justify-center"><p className="text-slate-400">로딩 중...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}
