import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { userDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminUser();
    if (!session) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const body = await request.json();
    const { email, currentPassword, newPassword, confirmPassword } = body;

    if (!email?.trim() || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();
    const sessionEmail = session.email.trim().toLowerCase();
    if (emailNorm !== sessionEmail) {
      return NextResponse.json({ error: 'Email phải trùng với tài khoản đăng nhập' }, { status: 403 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Mật khẩu mới không khớp' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    const dbUser = await userDB.findUnique({ where: { email: session.email } });
    if (!dbUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, dbUser.password);
    if (!match) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userDB.update({ where: { email: session.email }, data: { password: hashed } });

    return NextResponse.json({ ok: true, message: 'Đổi mật khẩu thành công' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
