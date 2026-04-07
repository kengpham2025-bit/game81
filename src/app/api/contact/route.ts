import { NextRequest, NextResponse } from 'next/server';
import { contactMessageDB } from '@/lib/db';

const lastSubmit = new Map<string, number>();
const COOLDOWN_MS = 45_000;
const MAX_BODY = 8000;

function getIp(req: NextRequest): string {
  const x = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  return x.split(',')[0]?.trim() || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const now = Date.now();
    const prev = lastSubmit.get(ip) || 0;
    if (now - prev < COOLDOWN_MS) {
      return NextResponse.json({ error: 'Vui long doi vai giay roi gui lai.' }, { status: 429 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const subject = String(body.subject || '').trim().slice(0, 200);
    const text = String(body.body || body.message || '').trim().slice(0, MAX_BODY);
    const honeypot = String(body.website || '').trim();

    if (honeypot) {
      return NextResponse.json({ ok: true });
    }
    if (!name || !email || !text) {
      return NextResponse.json({ error: 'Vui long dien ho ten, email va noi dung.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email khong hop le.' }, { status: 400 });
    }

    await contactMessageDB.create({ name, email, subject, body: text, ip });
    lastSubmit.set(ip, now);

    return NextResponse.json({ ok: true, message: 'Da gui. Chung toi se phan hoi som nhat co the.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Khong gui duoc. Thu lai sau.' }, { status: 500 });
  }
}
