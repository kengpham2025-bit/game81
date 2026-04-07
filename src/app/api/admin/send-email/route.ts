import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminUser } from '@/lib/auth';

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST?.trim(),
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const cfg = getSmtpConfig();
    if (!cfg.host || !cfg.auth.user || !cfg.auth.pass) {
      return NextResponse.json({
        error: 'Chưa cấu hình SMTP. Vui lòng thêm SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM vào file .env.local',
      }, { status: 400 });
    }

    const body = await request.json();
    const { to, subject, body: message } = body;

    if (!to?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Thiếu thông tin người nhận, tiêu đề hoặc nội dung' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    });

    await transporter.sendMail({
      from: cfg.from,
      to: to.trim(),
      subject: subject.trim(),
      text: message.trim(),
      html: `<p>${message.trim().replace(/\n/g, '<br>')}</p>`,
    });

    return NextResponse.json({ ok: true, message: 'Gửi email thành công!' });
  } catch (e) {
    console.error('SMTP error:', e);
    return NextResponse.json({ error: 'Không gửi được email. Kiểm tra cấu hình SMTP.' }, { status: 500 });
  }
}
