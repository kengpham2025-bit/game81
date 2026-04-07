import { NextResponse } from 'next/server';
import { getSeoSettings } from '@/lib/seo';

export async function GET() {
  try {
    const settings = await getSeoSettings();
    return NextResponse.json(settings || {});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
