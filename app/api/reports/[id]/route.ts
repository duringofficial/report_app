import { getReport, updateReport } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adminToken = request.headers.get('x-admin-token')

  const report = await getReport(id)
  if (!report) {
    return Response.json({ error: '신고 내역을 찾을 수 없습니다.' }, { status: 404 })
  }

  if (adminToken === process.env.ADMIN_PASSWORD) {
    return Response.json(report)
  }

  return Response.json({
    id: report.id,
    category: report.category,
    status: report.status,
    createdAt: report.createdAt,
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminToken = request.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: '권한이 없습니다.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status, adminNote } = body

  const updated = await updateReport(id, {
    ...(status && { status }),
    ...(adminNote !== undefined && { adminNote }),
  })

  if (!updated) {
    return Response.json({ error: '신고 내역을 찾을 수 없습니다.' }, { status: 404 })
  }

  return Response.json(updated)
}
