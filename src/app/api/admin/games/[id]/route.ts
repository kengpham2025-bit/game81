import { NextRequest, NextResponse } from 'next/server';
import { gameDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';
import slugify from 'slugify';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    if (body.name && !body.slug) body.slug = slugify(body.name, { lower: true, strict: true });
    const game = await gameDB.update({ where: { id }, data: body });
    return NextResponse.json(game);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    if ((e as Error).message === 'Game not found') return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await gameDB.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
