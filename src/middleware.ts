import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Chặn URL /admin/articles/undefined hoặc /.../null → redirect về danh sách.
 * Chạy trước mọi page, tránh 404 khi link hoặc cache cũ dùng id sai.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last === 'undefined' || last === 'null') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/articles';
    return NextResponse.redirect(redirectUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/articles/:path*'],
};
