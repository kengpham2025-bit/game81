import { NextResponse } from 'next/server';
import { giftCodeDB, gameDB } from '@/lib/db';

export async function GET() {
  try {
    const list = await giftCodeDB.findMany({
      include: { game: true },
      take: 20,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
