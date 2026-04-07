import type { MetadataRoute } from 'next';
import { getSeoSettings } from '@/lib/seo';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSeoSettings();
  const allow = s?.robotsIndex !== false && s?.robotsFollow !== false;
  return {
    rules: [
      { userAgent: '*', allow: allow ? '/' : [], disallow: allow ? ['/admin', '/admin/*', '/api/admin/*'] : ['/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
