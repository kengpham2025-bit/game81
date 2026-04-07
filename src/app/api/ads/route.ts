import { NextRequest, NextResponse } from 'next/server';
import { getBannersByPositions } from '@/lib/ads';
import type { AdPosition } from '@/lib/ads';

const POSITIONS: AdPosition[] = ['header_banner', 'sidebar', 'footer_banner', 'footer_block'];

export async function GET(request: NextRequest) {
  try {
    const position = request.nextUrl.searchParams.get('position') as AdPosition | null;
    const positions = position && POSITIONS.includes(position) ? [position] : POSITIONS;
    const result = await getBannersByPositions(positions);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
