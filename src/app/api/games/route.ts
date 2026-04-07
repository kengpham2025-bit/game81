import { NextRequest, NextResponse } from 'next/server';
import { gameDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topWeek = searchParams.get('topWeek');
    const topMonth = searchParams.get('topMonth');

    const where: Record<string, unknown> = {};
    if (topWeek === 'true') where.isTopWeek = true;
    if (topMonth === 'true') where.isTopMonth = true;

    const games = await gameDB.findMany({ where });
    return NextResponse.json(games);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
