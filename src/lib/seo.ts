import { seoSettingsDB } from '@/lib/db';
import { DEFAULT_JSON_LD_EXTRA } from '@/lib/defaultJsonLdExtra';

let cached: Record<string, unknown> | null = null;

export type SeoSettingsMerged = {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  canonicalBase: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  locale: string;
  jsonLdExtra: string;
  googleAnalyticsId: string;
  facebookUrl: string;
  supportEmail: string;
  spamEmail: string;
};

const DEFAULT_SEO: SeoSettingsMerged = {
  siteName: 'GAMEVIET.IO.VN',
  siteTitle: 'GAMEVIET.IO.VN - Tin tuc Game, Esports, Cong nghe',
  siteDescription:
    'Cap nhat tin tuc game mobile, game online, esports, cong nghe, giftcode moi nhat.',
  siteKeywords: 'game, tin tuc game, esports, giftcode, game mobile, game online',
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  canonicalBase: '',
  robotsIndex: true,
  robotsFollow: true,
  locale: 'vi_VN',
  jsonLdExtra: DEFAULT_JSON_LD_EXTRA,
  googleAnalyticsId: '',
  facebookUrl: '',
  supportEmail: '',
  spamEmail: '',
};

function mergeSeo(doc: Record<string, unknown> | null | undefined): SeoSettingsMerged {
  const d = doc || {};
  return {
    siteName: String(d.siteName ?? DEFAULT_SEO.siteName),
    siteTitle: String(d.siteTitle ?? DEFAULT_SEO.siteTitle),
    siteDescription: String(d.siteDescription ?? DEFAULT_SEO.siteDescription),
    siteKeywords: String(d.siteKeywords ?? DEFAULT_SEO.siteKeywords),
    ogImage: String(d.ogImage ?? ''),
    ogType: String(d.ogType ?? DEFAULT_SEO.ogType),
    twitterCard: String(d.twitterCard ?? DEFAULT_SEO.twitterCard),
    twitterSite: String(d.twitterSite ?? ''),
    canonicalBase: String(d.canonicalBase ?? ''),
    robotsIndex: d.robotsIndex !== false,
    robotsFollow: d.robotsFollow !== false,
    locale: String(d.locale ?? DEFAULT_SEO.locale),
    jsonLdExtra: String(d.jsonLdExtra ?? DEFAULT_JSON_LD_EXTRA),
    googleAnalyticsId: String(d.googleAnalyticsId ?? ''),
    facebookUrl: String(d.facebookUrl ?? '').trim(),
    supportEmail: String(d.supportEmail ?? '').trim(),
    spamEmail: String(d.spamEmail ?? '').trim(),
  };
}

export async function getSeoSettings(): Promise<SeoSettingsMerged> {
  if (cached) return cached as SeoSettingsMerged;
  try {
    const doc = await seoSettingsDB.findFirst();
    if (doc) {
      const merged = mergeSeo(doc as unknown as Record<string, unknown>);
      cached = merged as unknown as Record<string, unknown>;
      return merged;
    }
  } catch (e) {
    console.error('getSeoSettings', e);
  }
  return mergeSeo(null);
}

export function clearSeoSettingsCache() {
  cached = null;
}
