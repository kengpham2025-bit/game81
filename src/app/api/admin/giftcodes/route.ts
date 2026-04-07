import { NextRequest, NextResponse } from 'next/server';
import { giftCodeDB, gameDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

export async function GET() {
  try {
    await requireAdmin();
    const items = await giftCodeDB.findMany({ include: { game: true } });
    return NextResponse.json(items);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

function parseCodes(body: { codes?: string[]; codesText?: string }): string[] {
  if (Array.isArray(body.codes)) {
    return [...new Set(body.codes.map((c) => String(c).trim()).filter(Boolean))];
  }
  if (typeof body.codesText === 'string') {
    return [
      ...new Set(
        body.codesText
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
      ),
    ];
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { gameId, count, quotaTotal } = body;
    if (!gameId) return NextResponse.json({ error: 'Thiếu gameId' }, { status: 400 });

    const parsedCodes = parseCodes(body);
    const codesPayload = typeof body.codesText === 'string' || Array.isArray(body.codes);

    let doc = await giftCodeDB.findFirst({ where: { gameId } });
    if (doc) {
      if (codesPayload) {
        doc = await giftCodeDB.update({
          where: { id: doc.id },
          data: { codes: parsedCodes, count: parsedCodes.length },
        });
      } else if (count !== undefined && count !== null) {
        doc = await giftCodeDB.update({
          where: { id: doc.id },
          data: { count: Number(count) || 0 },
        });
      }
      if (quotaTotal !== undefined && quotaTotal !== null) {
        doc = await giftCodeDB.update({
          where: { id: doc.id },
          data: { quotaTotal: Math.max(0, Number(quotaTotal) || 0) },
        });
      }
    } else {
      const codes = codesPayload ? parsedCodes : [];
      const n = codes.length > 0 ? codes.length : Number(count) || 0;
      const qt =
        quotaTotal !== undefined && quotaTotal !== null
          ? Math.max(0, Number(quotaTotal) || 0)
          : n > 0
            ? n
            : Math.max(0, Number(count) || 0);
      doc = await giftCodeDB.create({ gameId, count: n, codes, quotaTotal: qt });
    }
    return NextResponse.json(doc);
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const id = request.nextUrl.searchParams.get('id');
    if (!id?.trim()) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
    await giftCodeDB.delete({ where: { id: id.trim() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
