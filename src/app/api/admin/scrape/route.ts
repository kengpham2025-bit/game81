import { NextRequest } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { isAllowedVideoEmbedSrc } from '@/lib/videoEmbed';
import type { CheerioAPI } from 'cheerio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

function absoluteUrl(base: string, href: string): string {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  try {
    const u = new URL(base);
    return new URL(href, u.origin).href;
  } catch {
    return href;
  }
}

// Common article containers to try (game8.vn, vnexpress, etc.)
const ARTICLE_CONTAINERS = [
  '.content-detail',
  '.detail-content',
  '.article-content',
  '.post-content',
  '.entry-content',
  '.article__content',
  '.article__body',
  '.news-content',
  '.news-detail',
  '.box-content',
  '.content-article',
  '.article-body',
  '.article__main',
  '.story-body',
  '.post-body',
  '[itemprop="articleBody"]',
  '.entry-body',
  'article .content',
  'article',
  '.article',
  '.post',
  '.content',
];

// Selectors that indicate ad/junk content to remove
const JUNK_SELECTORS = [
  '.ads',
  '.advertisement',
  '.ad',
  '.social-share',
  '.share-buttons',
  '.related-posts',
  '.related-articles',
  '.comments',
  '.comment-section',
  'script',
  'style',
  'noscript',
  '.nav',
  '.header',
  '.footer',
  '.sidebar',
];

function cleanContent($: CheerioAPI, container: AnyElement, pageUrl: string): string {
  const $el = $(container);
  const pageOrigin = (() => {
    try {
      return new URL(pageUrl).origin;
    } catch {
      return '';
    }
  })();

  // Remove junk elements (không xóa iframe — xử lý riêng cho video)
  JUNK_SELECTORS.forEach((sel) => $el.find(sel).remove());

  // Iframe: chỉ giữ video hợp lệ; lazy src → src
  $el.find('iframe').each((_, ifr) => {
    const $ifr = $(ifr);
    let src =
      $ifr.attr('src') ||
      $ifr.attr('data-src') ||
      $ifr.attr('data-lazy-src') ||
      $ifr.attr('data-original') ||
      '';
    src = src.trim();
    if (src.startsWith('//')) src = `https:${src}`;
    if (src && !src.startsWith('http') && pageOrigin) {
      try {
        src = new URL(src, pageOrigin).href;
      } catch {
        /* giữ nguyên */
      }
    }
    if (isAllowedVideoEmbedSrc(src)) {
      $ifr.attr('src', src);
      $ifr.removeAttr('data-src');
      $ifr.removeAttr('data-lazy-src');
      $ifr.removeAttr('data-original');
      if (!$ifr.attr('width')) $ifr.attr('width', '560');
      if (!$ifr.attr('height')) $ifr.attr('height', '315');
      $ifr.attr('allowfullscreen', '');
      $ifr.attr(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      $ifr.attr('loading', 'lazy');
      $ifr.attr('title', $ifr.attr('title') || 'Video nhúng');
    } else {
      $ifr.remove();
    }
  });
  
  // Fix lazy-loaded images (data-src, data-lazy-src, data-original, srcset)
  $el.find('img').each((_, img) => {
    const $img = $(img);
    let src =
      $img.attr('src') ||
      $img.attr('data-src') ||
      $img.attr('data-lazy-src') ||
      $img.attr('data-original') ||
      '';
    // Fix protocol-relative URL
    if (src.startsWith('//')) src = 'https:' + src;
    // Convert relative to absolute
    if (src && !src.startsWith('http') && pageOrigin) {
      try {
        src = new URL(src, pageOrigin).href;
      } catch {
        /* keep as is */
      }
    }
    if (src) $img.attr('src', src);

    // Also handle srcset for lazy loaded images
    const srcset = $img.attr('srcset') || $img.attr('data-srcset') || $img.attr('data-lazy-srcset') || '';
    if (srcset && !$img.attr('src')) {
      // If no src but has srcset, extract first URL
      const first = srcset.split(',')[0].trim().split(' ')[0].trim();
      if (first) {
        let full = first.startsWith('//') ? 'https:' + first : first;
        if (!full.startsWith('http') && pageOrigin) {
          try {
            full = new URL(full, pageOrigin).href;
          } catch {
            full = first;
          }
        }
        $img.attr('src', full);
      }
    }

    // Clean tracking parameters from src
    const cleanSrc = $img.attr('src') || '';
    if (cleanSrc.includes('?') && !cleanSrc.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|jfif)(\?|$)/i)) {
      $img.attr('src', cleanSrc.split('?')[0]);
    }
  });
  
  $el.find('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && pageOrigin) {
      $(a).attr('href', absoluteUrl(pageOrigin + '/', href));
    }
  });
  
  return $el.html() || '';
}

function extractTitle($: CheerioAPI): string {
  // Try various title selectors
  return (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('h2').first().text().trim() ||
    $('title').text().trim() ||
    ''
  );
}

function extractDescription($: CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    ''
  ).trim();
}

function extractThumbnail($: CheerioAPI, baseUrl: string): string {
  // Try meta tags first (most reliable for social sharing images)
  const candidates = [
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('meta[itemprop="image"]').attr('content'),
    $('article img').first().attr('src'),
    $('.post img').first().attr('src'),
    $('img.wp-post-image').attr('src'),
  ];

  for (let thumb of candidates) {
    if (!thumb) continue;
    // Fix protocol-relative URL
    if (thumb.startsWith('//')) thumb = 'https:' + thumb;
    // Convert relative to absolute
    if (!thumb.startsWith('http')) {
      thumb = absoluteUrl(baseUrl, thumb);
    }
    // Only return if it looks like a valid image URL
    if (thumb.startsWith('http') && (thumb.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|jfif)(\?|$)/i) || thumb.includes('/image') || thumb.includes('/images') || thumb.includes('/media') || thumb.includes('/upload') || thumb.includes('/img'))) {
      return thumb;
    }
  }

  return '';
}

function extractImages($: CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const isAdImage = (src: string) => {
    const s = src.toLowerCase();
    return (
      s.includes('pixel') ||
      s.includes('tracking') ||
      s.includes('1x1') ||
      s.includes('blank') ||
      s.includes('avatar') && s.includes('default') ||
      s.includes('icon') && !s.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) ||
      s.includes('logo') && !s.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)
    );
  };

  const extractSrc = (el: AnyElement): string | null => {
    const $el = $(el);
    // Ưu tiên: src > data-src > data-lazy-src > data-original > srcset
    const src =
      $el.attr('src') ||
      $el.attr('data-src') ||
      $el.attr('data-lazy-src') ||
      $el.attr('data-original') ||
      '';
    if (src) return src.trim();

    // Thử srcset
    const srcset = $el.attr('srcset') || $el.attr('data-srcset') || $el.attr('data-lazy-srcset') || '';
    if (srcset) {
      // Lấy URL đầu tiên trong srcset (format: "url size, url size, ...")
      const first = srcset.split(',')[0].trim().split(' ')[0];
      if (first) return first.trim();
    }
    return null;
  };

  $('img').each((_, el) => {
    let src = extractSrc(el);
    if (!src || seen.has(src)) return;

    // Fix protocol-relative URL
    if (src.startsWith('//')) src = 'https:' + src;

    if (isAdImage(src)) return;

    // Convert relative to absolute
    let full = src;
    if (!src.startsWith('http')) {
      full = absoluteUrl(baseUrl, src);
    }

    // Accept any http URL that looks like an image (more permissive)
    if (
      full.startsWith('http') &&
      (full.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|jfif|bmp|tiff?|ico)(\?|$)/i) ||
        full.includes('/image/') ||
        full.includes('/images/') ||
        full.includes('/media/') ||
        full.includes('/upload/') ||
        full.includes('/img/') ||
        full.includes('photo') ||
        full.includes('thumbnail'))
    ) {
      images.push(full);
      seen.add(src);
    }
  });

  // Also try to find og:image meta tags if no images found
  if (images.length === 0) {
    $('meta[property="og:image"]').each((_, el) => {
      const src = $(el).attr('content');
      if (src && !seen.has(src)) {
        let full = src.startsWith('http') ? src : absoluteUrl(baseUrl, src);
        if (full.startsWith('http')) {
          images.push(full);
          seen.add(src);
        }
      }
    });
  }

  return images;
}

function jsonResponse(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    let body: { url?: string };
    try {
      body = (await request.json()) as { url?: string };
    } catch {
      return jsonResponse({ error: 'Dữ liệu không hợp lệ' }, 400);
    }
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!rawUrl) {
      return jsonResponse({ error: 'Thiếu URL' }, 400);
    }

    let url: string;
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return jsonResponse({ error: 'Vui lòng nhập URL đầy đủ (ví dụ https://example.com/bai-viet)' }, 400);
      }
      const host = (parsed.hostname || '').toLowerCase();
      const looksLikeDomain = host.length >= 4 && (host.includes('.') || host === 'localhost') && !/^[:.-]/.test(host);
      if (!looksLikeDomain) {
        return jsonResponse({ error: 'URL không hợp lệ. Vui lòng nhập địa chỉ đầy đủ (ví dụ https://vnexpress.net/bai-viet)' }, 400);
      }
      url = parsed.href;
    } catch {
      return jsonResponse({ error: 'URL không hợp lệ. Vui lòng nhập địa chỉ đầy đủ (ví dụ https://example.com/bai-viet)' }, 400);
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': new URL(url).origin + '/',
      },
    });

    if (!res.ok) {
      return jsonResponse({ error: `Không tải được trang (status: ${res.status})` }, 400);
    }

    const html = await res.text();
    if (!html || html.length < 500) {
      return jsonResponse({ error: 'Trang trả về nội dung quá ngắn hoặc trống' }, 400);
    }
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    // Extract title
    const title = extractTitle($);
    
    // Extract description
    const description = extractDescription($);
    
    // Extract content - try multiple containers (game8.vn, vnexpress, etc.)
    let content = '';
    for (const selector of ARTICLE_CONTAINERS) {
      const el = $(selector).first();
      const textLen = el.length ? el.text().trim().length : 0;
      if (el.length && textLen > 100) {
        try {
          content = cleanContent($, el[0], url);
        } catch {
          content = el.html() || '';
        }
        if (content && content.length > 300) break;
      }
    }

    if (!content || content.length < 200) {
      $('body').find('script,style,nav,header,footer,aside').remove();
      content = $('body').html() || '';
    }
    
    // Get all images
    const images = extractImages($, url);
    
    // Get thumbnail
    const thumbnail = extractThumbnail($, url);

    if (!title) {
      return jsonResponse({ error: 'Không lấy được tiêu đề bài viết' }, 400);
    }
    if (!content || content.length < 80) {
      return jsonResponse({ error: 'Không lấy được nội dung bài viết. Trang có thể dùng JavaScript để render.' }, 400);
    }

    return jsonResponse({
      title: title.trim(),
      excerpt: description.slice(0, 300),
      content: content,
      thumbnail: thumbnail,
      images: images.slice(0, 50),
      sourceUrl: url,
    }, 200);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (err.message === 'Không được phép') {
      return jsonResponse({ error: 'Không được phép' }, 401);
    }
    console.error('Scrape error:', err);
    const msg = err.message || 'Lỗi cào dữ liệu';
    const isNetwork = /fetch|network|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(msg);
    return jsonResponse(
      { error: isNetwork ? 'Không kết nối được tới URL. Kiểm tra địa chỉ và thử lại.' : msg },
      500
    );
  }
}
