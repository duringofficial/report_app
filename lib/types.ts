export type ReportCategory =
  | 'harassment'
  | 'sexual'
  | 'violence'
  | 'improvement'
  | 'safety'

export type ReportStatus = 'pending' | 'reviewing' | 'completed'

export interface Report {
  id: string
  category: ReportCategory
  content: string
  incidentDate?: string
  location?: string
  contact?: string
  status: ReportStatus
  adminNote?: string
  createdAt: number
  updatedAt: number
}

export const CATEGORIES: Record<
  ReportCategory,
  { label: string; color: string; bg: string; border: string; icon: string; description: string }
> = {
  harassment: {
    label: '직장내 괴롭힘',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    icon: '👥',
    description: '반복적 모욕·따돌림·업무 배제 등',
  },
  sexual: {
    label: '성희롱·성추행',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: '⚠️',
    description: '성적 언행·신체접촉 등 모든 성적 불쾌 행위',
  },
  violence: {
    label: '폭행',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '🚨',
    description: '신체적 폭력·위협 행위',
  },
  improvement: {
    label: '편의사항 개선',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: '💡',
    description: '업무 환경·복지·편의시설 개선 제안',
  },
  safety: {
    label: '안전보건 부적합',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '🦺',
    description: '산업안전·보건 기준 미충족 사항',
  },
}

export const STATUS_LABELS: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '접수됨', color: 'text-blue-700', bg: 'bg-blue-100' },
  reviewing: { label: '처리중', color: 'text-amber-700', bg: 'bg-amber-100' },
  completed: { label: '완료', color: 'text-emerald-700', bg: 'bg-emerald-100' },
}
