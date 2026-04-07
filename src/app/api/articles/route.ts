import { NextRequest, NextResponse } from 'next/server';
import { articleDB, categoryDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'));
    const category = searchParams.get('category');
    const hot = searchParams.get('hot');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    const q = searchParams.get('q');

    if (slug) {
      const article = await articleDB.findFirst({ where: { slug, status: 'published' } });
      if (!article) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
      await articleDB.updateViewCount({ where: { slug } });
      return NextResponse.json(article);
    }

    const where: Record<string, unknown> = { status: 'published' };
    if (category) where.categorySlug = category;
    if (hot === 'true') where.isHot = true;
    if (featured === 'true') where.isFeatured = true;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      articleDB.findMany({ where, skip, take: limit }),
      articleDB.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
