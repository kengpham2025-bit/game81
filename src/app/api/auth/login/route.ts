import { NextRequest, NextResponse } from 'next/server';
import { userDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Thiếu email hoặc mật khẩu' }, { status: 400 });
    }

    const user = await userDB.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 });
    }
    const { password: _, ...safe } = user;
    const token = Buffer.from(
      JSON.stringify({ id: user.id, email: user.email })
    ).toString('base64');
    const res = NextResponse.json({ user: safe, token });
    res.cookies.set('admin_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
