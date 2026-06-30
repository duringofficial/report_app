import { saveReport, listReports } from '@/lib/kv'
import { generateReportId } from '@/lib/id'
import type { ReportCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: ReportCategory[] = ['harassment', 'sexual', 'violence', 'improvement', 'safety']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, isAnonymous, reporterName, reporterDept, content, incidentDate, location, contact } = body

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return Response.json({ error: '올바른 카테고리를 선택해주세요.' }, { status: 400 })
    }
    if (!content || content.trim().length < 10) {
      return Response.json({ error: '내용을 10자 이상 입력해주세요.' }, { status: 400 })
    }
    if (!isAnonymous && !reporterName?.trim()) {
      return Response.json({ error: '기명 신고 시 이름을 입력해주세요.' }, { status: 400 })
    }

    const now = Date.now()
    const report = {
      id: generateReportId(),
      category: category as ReportCategory,
      isAnonymous: isAnonymous !== false,
      reporterName: !isAnonymous ? reporterName?.trim() : undefined,
      reporterDept: !isAnonymous ? reporterDept?.trim() || undefined : undefined,
      content: content.trim(),
      incidentDate: incidentDate || undefined,
      location: location?.trim() || undefined,
      contact: contact?.trim() || undefined,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }

    await saveReport(report)

    return Response.json({ id: report.id }, { status: 201 })
  } catch {
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const adminToken = request.headers.get('x-admin-token')

  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: '권한이 없습니다.' }, { status: 401 })
  }

  const category = searchParams.get('category') as ReportCategory | null
  const status = searchParams.get('status') as 'pending' | 'reviewing' | 'completed' | null
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const result = await listReports({ category: category ?? undefined, status: status ?? undefined, limit, offset })

  return Response.json(result)
}
