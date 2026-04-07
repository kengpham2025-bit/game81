import { NextResponse } from 'next/server';
import { categoryDB } from '@/lib/db';
import { getAdminUser } from '@/lib/auth';
import { DEFAULT_MENU_CATEGORIES } from '@/lib/defaultMenuCategories';

export async function POST() {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    for (const c of DEFAULT_MENU_CATEGORIES) {
      await categoryDB.upsert({
        where: { slug: c.slug },
        create: c,
        update: c,
      });
    }
    return NextResponse.json({ ok: true, message: `Da dong bo ${DEFAULT_MENU_CATEGORIES.length} chuyen muc menu.` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Loi dong bo' }, { status: 500 });
  }
}
