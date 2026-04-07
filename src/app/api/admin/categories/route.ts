import { NextRequest, NextResponse } from 'next/server';
import { categoryDB } from '@/lib/db';
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
    const items = await categoryDB.findMany();
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
    const cat = await categoryDB.create({ name: body.name, slug, description: body.description, order: body.order, showInNav: body.showInNav, navLabel: body.navLabel, customPath: body.customPath });
    return NextResponse.json(cat);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
