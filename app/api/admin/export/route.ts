import { listReports } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const adminToken = request.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: '권한이 없습니다.' }, { status: 401 })
  }

  const { reports } = await listReports({ limit: 9999 })

  const csv = [
    ['접수번호', '유형', '익명여부', '신고자이름', '신고자부서', '상태', '발생일', '발생장소', '연락처', '내용', '관리자메모', '접수일시'].join(','),
    ...reports.map((r) =>
      [
        r.id,
        r.category,
        r.isAnonymous ? '익명' : '기명',
        r.reporterName ?? '',
        r.reporterDept ?? '',
        r.status,
        r.incidentDate ?? '',
        r.location ?? '',
        r.contact ?? '',
        `"${(r.content ?? '').replace(/"/g, '""')}"`,
        `"${(r.adminNote ?? '').replace(/"/g, '""')}"`,
        new Date(r.createdAt).toLocaleString('ko-KR'),
      ].join(',')
    ),
  ].join('\n')

  const bom = '﻿'
  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="during_reports_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
