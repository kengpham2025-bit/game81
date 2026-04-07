/** URL tuyệt đối cho OG / Facebook (ảnh relative → full URL). */
export function toAbsoluteUrl(siteBase: string, path: string): string {
  const base = siteBase.replace(/\/$/, '');
  const p = (path || '').trim();
  if (!p) return base;
  if (/^https?:\/\//i.test(p)) return p;
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
}
