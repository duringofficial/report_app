import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return Response.json({ ok: true })
}
