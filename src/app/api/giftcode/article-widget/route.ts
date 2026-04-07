import { NextRequest, NextResponse } from 'next/server';
import { articleDB, giftCodeDB, giftCodeClaimDB } from '@/lib/db';

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')?.trim();
    if (!slug) return NextResponse.json({ enabled: false }, { status: 400 });

    const article = await articleDB.findFirst({
      where: { slug, status: 'published' },
    });

    if (!article?.giftcodeGameId) {
      return NextResponse.json({ enabled: false });
    }

    const cat = article.categorySlug || '';
    if (cat !== 'giftcode') {
      return NextResponse.json({
        enabled: false,
        reason: 'not_giftcode_category',
        message: 'Bai can chuyen muc GIFTCODE de hien o nhan ma.',
      });
    }

    const gameId = article.giftcodeGameId;
    const gc = await giftCodeDB.findFirst({ where: { gameId } });

    if (!gc) {
      return NextResponse.json({
        enabled: true,
        gameName: '',
        remaining: 0,
        total: 0,
        hasCodes: false,
        message: 'Chua co kho ma cho game nay trong admin.',
      });
    }

    const codes: string[] = JSON.parse(gc.codes || '[]');
    const remaining = codes.length;
    const quota = gc.quotaTotal > 0 ? gc.quotaTotal : Math.max(remaining, gc.count || 0);
    const total = Math.max(quota, remaining);

    const ip = clientIp(request);
    const claimed = await giftCodeClaimDB.findFirst({ where: { articleSlug: slug, ip } });

    return NextResponse.json({
      enabled: true,
      gameName: gc.game?.name || 'Game',
      remaining,
      total,
      hasCodes: remaining > 0,
      alreadyClaimed: !!claimed,
      codeIfClaimed: claimed?.code || null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
