import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { contactMessageDB } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const list = await contactMessageDB.findMany();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const { id, read } = await request.json();
    if (!id) return NextResponse.json({ error: 'Id không hợp lệ' }, { status: 400 });

    await contactMessageDB.update({ where: { id }, data: { read: Boolean(read) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu id hợp lệ' }, { status: 400 });

    await contactMessageDB.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
  }
}
