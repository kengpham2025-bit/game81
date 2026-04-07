import { NextRequest, NextResponse } from 'next/server';
import { articleDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const article = await articleDB.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json(article);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    if (body.slug) {
      const existing = await articleDB.findFirst({ where: { slug: body.slug } });
      if (existing && existing.id !== id) return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = { ...body };
    if (body.publishedAt) updateData.publishedAt = new Date(body.publishedAt);
    const article = await articleDB.update({ where: { id }, data: updateData as Parameters<typeof articleDB.update>[0]['data'] });
    return NextResponse.json(article);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await articleDB.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
