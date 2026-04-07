import * as cheerio from 'cheerio';
import { isAllowedVideoEmbedSrc } from '@/lib/videoEmbed';

/**
 * Loại bỏ script, onclick và các handler từ HTML cào ngoài
 * (tránh lỗi shareFBNew is not defined, XSS). Giữ iframe video hợp lệ.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  try {
    const $ = cheerio.load(html, undefined, false);
    $('script, object, embed').remove();
    $('iframe').each((_, el) => {
      const src = ($(el).attr('src') || '').trim();
      const ok = src.startsWith('//') ? isAllowedVideoEmbedSrc(`https:${src}`) : isAllowedVideoEmbedSrc(src);
      if (!ok) $(el).remove();
    });
    $('*').each((_, el) => {
      const node = el as { attribs?: Record<string, string> };
      const attribs = node.attribs;
      if (!attribs) return;
      for (const name of Object.keys(attribs)) {
        const lower = name.toLowerCase();
        if (lower.startsWith('on')) {
          $(el).removeAttr(name);
        }
        if (lower === 'href' && /^\s*javascript:/i.test(attribs[name] || '')) {
          $(el).removeAttr('href');
        }
      }
    });
    return $.root().html() || '';
  } catch {
    return html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  }
}
