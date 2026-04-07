import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { adDB } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const { id } = await params;
    const ad = await adDB.findUnique({ where: { id } });
    if (!ad) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json(ad);
  } catch (e) {
    return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const ex = await adDB.findUnique({ where: { id } });
    if (!ex) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

    const name = body.name !== undefined ? String(body.name) : ex.name;
    const position = body.position !== undefined ? String(body.position) : ex.position;
    const categorySlugs = Array.isArray(body.categorySlugs) ? body.categorySlugs : ex.categorySlugs;
    let imageUrl = body.imageUrl !== undefined ? String(body.imageUrl || '').trim() : ex.imageUrl;
    const adText = body.adText !== undefined ? String(body.adText || '').trim() : ex.adText;
    const sponsorLabel = body.sponsorLabel !== undefined ? String(body.sponsorLabel || '').trim() : ex.sponsorLabel;
    const linkUrl = body.linkUrl !== undefined ? String(body.linkUrl ?? '').trim() : ex.linkUrl;
    const alt = body.alt !== undefined ? String(body.alt) : ex.alt;
    const order = body.order !== undefined ? Number(body.order) || 0 : ex.order;
    const isActive = body.isActive !== undefined ? body.isActive !== false : ex.isActive;
    const startAt = body.startAt !== undefined ? (body.startAt ? new Date(body.startAt) : undefined) : (ex.startAt ? new Date(ex.startAt) : undefined);
    const endAt = body.endAt !== undefined ? (body.endAt ? new Date(body.endAt) : undefined) : (ex.endAt ? new Date(ex.endAt) : undefined);

    const isInArticleText = position === 'in_article' && adText.length > 0;
    if (isInArticleText) {
      if (!linkUrl) {
        return NextResponse.json({ error: 'Quang cao text trong bai can co link khi click' }, { status: 400 });
      }
      imageUrl = '';
    } else if (!imageUrl) {
      return NextResponse.json({ error: 'Can URL anh cho vi tri nay' }, { status: 400 });
    }

    const ad = await adDB.update({
      where: { id },
      data: { name, position, categorySlugs, imageUrl, adText, sponsorLabel, linkUrl, alt, order, isActive, startAt, endAt } as Parameters<typeof adDB.update>[0]['data'],
    });
    return NextResponse.json(ad);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const { id } = await params;
    await adDB.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
  }
}
