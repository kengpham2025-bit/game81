import { adDB } from '@/lib/db';

export type AdPosition = 'header_banner' | 'sidebar' | 'footer_banner' | 'footer_block' | 'in_article';

export type AdItem = {
  _id: string;
  name: string;
  position: string;
  categorySlugs: string[];
  imageUrl: string;
  adText?: string;
  sponsorLabel?: string;
  linkUrl: string;
  alt?: string;
  order: number;
  createdAt?: Date;
};

export async function getBannersByPositions(
  positions: AdPosition[],
  categorySlug?: string
): Promise<Record<AdPosition, AdItem[]>> {
  const result = {
    header_banner: [] as AdItem[],
    sidebar: [] as AdItem[],
    footer_banner: [] as AdItem[],
    footer_block: [] as AdItem[],
    in_article: [] as AdItem[],
  };
  try {
    const allAds = await adDB.findMany();
    const now = new Date();

    for (const ad of allAds) {
      if (!ad || typeof ad !== 'object') continue;
      const pos = ad.position as AdPosition;
      if (!positions.includes(pos)) continue;
      if (!result[pos]) continue;
      if (!ad.isActive) continue;
      if (ad.startAt && new Date(ad.startAt as unknown as string) > now) continue;
      if (ad.endAt && new Date(ad.endAt as unknown as string) < now) continue;
      const cats = ad.categorySlugs ?? [];
      if (Array.isArray(cats) && cats.length > 0 && categorySlug && !cats.includes(categorySlug)) continue;
      result[pos].push({
        _id: ad.id,
        name: ad.name,
        position: ad.position,
        categorySlugs: Array.isArray(ad.categorySlugs) ? ad.categorySlugs : [],
        imageUrl: ad.imageUrl,
        adText: ad.adText ?? undefined,
        sponsorLabel: ad.sponsorLabel ?? undefined,
        linkUrl: ad.linkUrl,
        alt: ad.alt ?? undefined,
        order: ad.order,
        createdAt: ad.createdAt ? new Date(ad.createdAt) : undefined,
      });
    }
  } catch (e) {
    console.error('getBannersByPositions', e);
  }
  return result;
}

export async function getArticleAds(categorySlug?: string): Promise<AdItem[]> {
  const banners = await getBannersByPositions(['in_article'], categorySlug);
  return banners.in_article;
}
