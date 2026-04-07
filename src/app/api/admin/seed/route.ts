import { NextRequest, NextResponse } from 'next/server';
import { userDB, categoryDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { DEFAULT_MENU_CATEGORIES } from '@/lib/defaultMenuCategories';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-seed-secret');
    if (secret !== process.env.SEED_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Không được phép' }, { status: 403 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gameviet.io.vn';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hashed = await bcrypt.hash(adminPass, 10);

    const existingUser = await userDB.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      await userDB.update({ where: { email: adminEmail }, data: { password: hashed } });
    } else {
      await userDB.create({ email: adminEmail, password: hashed, name: 'Admin', role: 'admin' });
    }

    for (const c of DEFAULT_MENU_CATEGORIES) {
      await categoryDB.upsert({
        where: { slug: c.slug },
        create: c,
        update: c,
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Khởi tạo thành công. Đăng nhập bằng ADMIN_EMAIL / ADMIN_PASSWORD trong .env trên server.',
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[seed]', err);
    const isDev = process.env.NODE_ENV !== 'production';
    const message = err.message || 'Lỗi khởi tạo';
    return NextResponse.json(
      { error: isDev ? message : 'Lỗi khởi tạo. Kiểm tra SEED_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD và D1 đã chạy migration.' },
      { status: 500 }
    );
  }
}
