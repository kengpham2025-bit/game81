import { NextRequest, NextResponse } from 'next/server';
import { articleDB, categoryDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';
import slugify from 'slugify';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      articleDB.findMany({ skip, take: limit }),
      articleDB.count(),
    ]);
    return NextResponse.json({ items, total, page, limit });
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const slug = body.slug || slugify(body.title, { lower: true, strict: true });
    const existing = await articleDB.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });

    const article = await articleDB.create({
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content,
      thumbnail: body.thumbnail || '',
      images: body.images || [],
      categoryId: body.categoryId || undefined,
      categorySlug: body.categorySlug || '',
      author: body.author || 'GAMEVIET',
      tags: body.tags || [],
      isHot: body.isHot,
      isFeatured: body.isFeatured,
      metaTitle: body.metaTitle || undefined,
      metaDescription: body.metaDescription || undefined,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      status: body.status || 'published',
      giftcodeGameId: body.giftcodeGameId || undefined,
    });
    return NextResponse.json(article);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
