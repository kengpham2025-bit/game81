import type { MetadataRoute } from 'next';
import { articleDB, categoryDB, gameDB } from '@/lib/db';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE}/tin-tuc`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE}/giftcode`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/category/game-mobile`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/category/game-online`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/category/esports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/category/pc-console`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/category/cong-nghe`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/category/phim-anh`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const [categories, articles, games] = await Promise.all([
      categoryDB.findMany(),
      articleDB.findMany({ where: { status: 'published' }, take: 5000 }),
      gameDB.findMany(),
    ]);

    const allTags = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => allTags.add(t)));
    const tags = Array.from(allTags).map(t => ({ slug: t }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));

    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${BASE}/tin-tuc/${a.slug}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : a.publishedAt ? new Date(a.publishedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const gameUrls: MetadataRoute.Sitemap = games.map((g) => ({
      url: `${BASE}/game/${g.slug}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    const tagUrls: MetadataRoute.Sitemap = tags.map((t) => ({
      url: `${BASE}/tag/${encodeURIComponent(t.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryUrls, ...articleUrls, ...gameUrls, ...tagUrls];
  } catch (e) {
    console.error('sitemap', e);
    return staticRoutes;
  }
}
