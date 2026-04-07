/**
 * JSON-LD bổ sung mặc định — Organization (bổ sung cho WebSite đã có ở trang chủ).
 * Sửa sameAs (Facebook, YouTube…), logo URL theo domain trong Admin → SEO.
 */
export const DEFAULT_JSON_LD_EXTRA = `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://gameviet.io.vn/#organization",
  "name": "GAMEVIET.IO.VN",
  "alternateName": "Game Việt",
  "url": "https://gameviet.io.vn",
  "description": "Tin tức game mobile, game online, esports, công nghệ và giftcode.",
  "logo": {
    "@type": "ImageObject",
    "url": "https://gameviet.io.vn/favicon.ico"
  },
  "sameAs": []
}`;

export function resolveJsonLdExtra(stored: string | null | undefined): string {
  const t = stored?.trim();
  return t || DEFAULT_JSON_LD_EXTRA;
}

export function applyBaseUrlToJsonLd(jsonStr: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  if (!base || base === 'https://gameviet.io.vn') return jsonStr;
  return jsonStr.replaceAll('https://gameviet.io.vn', base);
}
