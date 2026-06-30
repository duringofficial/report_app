import Link from 'next/link'
import { Shield, Lock, Eye, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '@/lib/types'

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col" style={{ background: 'linear-gradient(160deg, #0f2447 0%, #1e3a5f 40%, #1a4080 100%)' }}>
      {/* Header */}
      <header className="px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <Shield className="w-3.5 h-3.5 text-blue-200" />
          <span className="text-xs font-medium text-blue-100 tracking-wide">KET 윤리경영</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          익명 신고 채널
        </h1>
        <p className="text-blue-200 text-sm leading-relaxed max-w-xs mx-auto">
          신고자 정보는 일체 수집되지 않습니다.<br />
          안심하고 신고해 주세요.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-5">
          {[
            { icon: Lock, label: '완전 익명' },
            { icon: Eye, label: '비공개 처리' },
            { icon: Shield, label: '신고자 보호' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-200" />
              </div>
              <span className="text-xs text-blue-300">{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Cards section */}
      <section className="flex-1 bg-[#f0f4f8] rounded-t-3xl px-4 pt-7 pb-10">
        <p className="text-center text-xs font-semibold text-slate-400 tracking-widest uppercase mb-5">
          신고 유형 선택
        </p>
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          {(Object.entries(CATEGORIES) as [string, typeof CATEGORIES[keyof typeof CATEGORIES]][]).map(
            ([key, cat], i) => (
              <Link
                key={key}
                href={`/report/${key}`}
                className={`group flex items-center gap-4 p-4 rounded-2xl bg-white border ${cat.border} card-hover shadow-sm animate-fade-in-up opacity-0`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
              >
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-base ${cat.color}`}>{cat.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </Link>
            )
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-8 space-y-3">
          <div>
            <Link
              href="/check"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors border border-slate-200 rounded-full px-4 py-2 bg-white"
            >
              <Shield className="w-3.5 h-3.5" />
              접수번호로 처리현황 조회
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            신고 접수 후 부여받은 접수번호로 처리 상태를 확인하실 수 있습니다.
          </p>
        </div>
      </section>
    </main>
  )
}
