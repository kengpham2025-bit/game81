import { NextRequest, NextResponse } from 'next/server';
import { articleDB, giftCodeDB, giftCodeClaimDB } from '@/lib/db';

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body.articleSlug === 'string' ? body.articleSlug.trim() : '';
    const sharedConfirmed = body.sharedConfirmed === true;

    if (!slug) {
      return NextResponse.json({ error: 'Thieu articleSlug' }, { status: 400 });
    }
    if (!sharedConfirmed) {
      return NextResponse.json({ error: 'Can chia se bai len Facebook truoc.' }, { status: 403 });
    }

    const article = await articleDB.findFirst({
      where: { slug, status: 'published' },
    });

    if (!article?.giftcodeGameId || article.categorySlug !== 'giftcode') {
      return NextResponse.json({ error: 'Bai khong hop le de nhan ma.' }, { status: 400 });
    }

    const gameId = article.giftcodeGameId;
    const ip = clientIp(request);

    const existing = await giftCodeClaimDB.findFirst({ where: { articleSlug: slug, ip } });
    if (existing) {
      return NextResponse.json({ ok: true, code: existing.code, already: true });
    }

    for (let attempt = 0; attempt < 8; attempt++) {
      const gc = await giftCodeDB.findFirst({ where: { gameId } });
      if (!gc) {
        return NextResponse.json({ error: 'Da het ma trong dot nay.' }, { status: 410 });
      }
      const codes: string[] = JSON.parse(gc.codes || '[]');
      if (!codes.length) {
        return NextResponse.json({ error: 'Da het ma trong dot nay.' }, { status: 410 });
      }
      const code = codes[0];
      const rest = codes.slice(1);

      await giftCodeDB.update({
        where: { id: gc.id },
        data: { codes: rest, count: rest.length },
      });

      try {
        await giftCodeClaimDB.create({ articleSlug: slug, gameId, ip, code });
        return NextResponse.json({ ok: true, code });
      } catch (e: unknown) {
        const restoredCodes: string[] = JSON.parse(gc.codes || '[]');
        restoredCodes.push(code);
        await giftCodeDB.update({
          where: { id: gc.id },
          data: { codes: restoredCodes, count: restoredCodes.length },
        });
        const again = await giftCodeClaimDB.findFirst({ where: { articleSlug: slug, ip } });
        if (again) return NextResponse.json({ ok: true, code: again.code, already: true });
        throw e;
      }
    }

    return NextResponse.json({ error: 'Thu lai sau.' }, { status: 429 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
