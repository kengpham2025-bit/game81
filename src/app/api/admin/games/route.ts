import { NextRequest, NextResponse } from 'next/server';
import { gameDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';
import slugify from 'slugify';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

export async function GET() {
  try {
    await requireAdmin();
    const items = await gameDB.findMany();
    return NextResponse.json(items);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const slug = body.slug || slugify(body.name, { lower: true, strict: true });
    const game = await gameDB.create({ name: body.name, slug, avatar: body.avatar, banner: body.banner, category: body.category, order: body.order, isTopWeek: body.isTopWeek, isTopMonth: body.isTopMonth });
    return NextResponse.json(game);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
