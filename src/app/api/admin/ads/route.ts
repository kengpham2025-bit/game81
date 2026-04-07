import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { adDB } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const ads = await adDB.findManyAdmin();
    return NextResponse.json(ads);
  } catch (e) {
    return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const name = String(body?.name ?? '').trim();
    const position = String(body?.position ?? 'sidebar').trim();
    const imageUrl = String(body?.imageUrl ?? '').trim();
    const adText = String(body?.adText ?? '').trim();
    const linkUrl = String(body?.linkUrl ?? '').trim();

    if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên quảng cáo' }, { status: 400 });

    const isInArticleText = position === 'in_article' && adText.length > 0;
    if (isInArticleText) {
      if (!linkUrl) {
        return NextResponse.json({ error: 'Quảng cáo text trong bài cần có link khi click' }, { status: 400 });
      }
    } else if (!imageUrl) {
      return NextResponse.json({ error: 'Cần URL ảnh cho vị trí này' }, { status: 400 });
    }

    const ad = await adDB.create({
      name,
      position,
      categorySlugs: Array.isArray(body.categorySlugs) ? (body.categorySlugs as string[]) : [],
      imageUrl: isInArticleText ? '' : imageUrl,
      adText: isInArticleText ? adText : adText,
      sponsorLabel: String(body?.sponsorLabel ?? '').trim(),
      linkUrl,
      alt: String(body?.alt ?? 'Banner quang cao').trim() || 'Banner quang cao',
      order: Number(body?.order) || 0,
      isActive: body?.isActive !== false,
      startAt: body?.startAt ? new Date(body.startAt as string) : undefined,
      endAt: body?.endAt ? new Date(body.endAt as string) : undefined,
    });
    return NextResponse.json(ad);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[POST /api/admin/ads]', err);
    const msg = err.message || 'Yêu cầu không hợp lệ';
    const isValidation = msg.includes('Thiếu') || msg.includes('Cần') || msg.includes('Vui lòng');
    return NextResponse.json(
      { error: msg },
      { status: isValidation ? 400 : 500 }
    );
  }
}
