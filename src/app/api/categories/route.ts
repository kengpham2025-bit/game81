import { NextResponse } from 'next/server';
import { categoryDB } from '@/lib/db';

export async function GET() {
  try {
    const categories = await categoryDB.findMany();
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
