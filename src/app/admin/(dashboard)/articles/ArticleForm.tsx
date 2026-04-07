'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

type CategoryItem = { id: string; name: string; slug: string; order?: number };

type GameOpt = { id: string; name: string; slug: string };

type ArticleDoc = {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  images: string[];
  categoryId?: string;
  categorySlug: string;
  author: string;
  tags: string[];
  isHot: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  status: string;
  giftcodeGameId?: string | null;
} | null;

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  images: string;
  categorySlug: string;
  author: string;
  tags: string;
  isHot: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  status: string;
  giftcodeGameId: string;
};

/** Parse response as JSON; if server returns HTML/plain text, return safe error instead of throwing. */
async function parseJsonResponse(res: Response): Promise<{ data: Record<string, unknown>; error?: string }> {
  const text = await res.text();
  try {
    const data = (text ? JSON.parse(text) : {}) as Record<string, unknown>;
    const err = typeof data?.error === 'string' ? data.error : undefined;
    return { data, error: err };
  } catch {
    return {
      data: {},
      error: res.ok ? 'Phản hồi từ server không hợp lệ.' : `Lỗi ${res.status}. Thử lại sau.`,
    };
  }
}

/** Form stores images/tags as strings; API/AI may return arrays. */
function imagesToList(images: unknown): string[] {
  if (Array.isArray(images)) return images.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof images === 'string' && images.trim()) return images.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

function tagsToList(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof tags === 'string' && tags.trim()) return tags.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

function imagesFieldToString(v: unknown, fallback: string): string {
  if (Array.isArray(v)) return v.map(String).join('\n');
  if (typeof v === 'string') return v;
  return fallback;
}

function tagsFieldToString(v: unknown, fallback: string): string {
  if (Array.isArray(v)) return v.map(String).join(', ');
  if (typeof v === 'string') return v;
  return fallback;
}

function normalizeApiArticleId(editArticleId: string | undefined, article: ArticleDoc | undefined | null): string {
  const raw = editArticleId ?? article?.id ?? article?._id;
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s || s === 'undefined' || s === 'null') return '';
  return s;
}

/** `editArticleId`: id từ URL (server) — ưu tiên hơn object article sau serialize, tránh PUT nhầm / thiếu id */
export default function ArticleForm({
  article,
  editArticleId,
}: {
  article?: ArticleDoc;
  editArticleId?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [games, setGames] = useState<GameOpt[]>([]);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const resolvedArticleId = useMemo(
    () => normalizeApiArticleId(editArticleId, article),
    [editArticleId, article?.id, article?._id]
  );
  const [form, setForm] = useState<FormState>({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    thumbnail: article?.thumbnail || '',
    images: article?.images?.join('\n') || '',
    categorySlug: article?.categorySlug || '',
    author: article?.author || 'GAMEVIET',
    tags: article?.tags?.join(', ') || '',
    isHot: article?.isHot ?? false,
    isFeatured: article?.isFeatured ?? false,
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
    status: article?.status || 'published',
    giftcodeGameId: article?.giftcodeGameId ? String(article.giftcodeGameId) : '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategoriesLoaded(true);
        if (Array.isArray(data)) {
          const list = data as CategoryItem[];
          setCategories(list);
          setForm((f) => {
            if (f.categorySlug) return f;
            const first = list.find((c) => c.slug !== 'trang-chu') || list[0];
            return first ? { ...f, categorySlug: first.slug } : f;
          });
        }
      })
      .catch(() => setCategoriesLoaded(true));
    fetch('/api/admin/games')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGames(data as GameOpt[]);
      })
      .catch(() => {});
  }, []);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const { data, error: errMsg } = await parseJsonResponse(res);
      if (!res.ok) throw new Error(errMsg || (data?.error as string) || 'Lỗi cào bài');
      setForm((f) => ({
        ...f,
        title: (data.title as string) || f.title,
        excerpt: (data.excerpt as string) || f.excerpt,
        content: (data.content as string) || f.content,
        thumbnail: (data.thumbnail as string) || f.thumbnail,
        images: Array.isArray(data.images) ? (data.images as string[]).join('\n') : f.images,
      }));
      setScrapeUrl('');
      showToast('success', 'Đã cào bài và ảnh.');
    } catch (e) {
      showToast('error', (e as Error).message);
    } finally {
      setScraping(false);
    }
  };

  const handleAiRewrite = async () => {
    if (!form.content.trim()) {
      showToast('warning', 'Cần có nội dung trước khi dùng AI viết lại.');
      return;
    }
    setRewriting(true);
    try {
      const res = await fetch('/api/admin/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          tags: form.tags,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          thumbnail: form.thumbnail,
          images: imagesToList(form.images),
        }),
      });
      const { data, error: errMsg } = await parseJsonResponse(res);
      if (!res.ok) throw new Error(errMsg || (data?.error as string) || 'Lỗi AI');
      setForm((f) => {
        const prevImg = f.images;
        const prevTags = f.tags;
        return {
          ...f,
          title: (data.title as string) || f.title,
          excerpt: (data.excerpt as string) || f.excerpt,
          tags: data.tags != null ? tagsFieldToString(data.tags, prevTags) : prevTags,
          metaTitle: (data.metaTitle as string) ?? f.metaTitle,
          metaDescription: (data.metaDescription as string) ?? f.metaDescription,
          content: (data.content as string) || f.content,
          thumbnail: (data.thumbnail as string) || f.thumbnail,
          images: data.images != null ? imagesFieldToString(data.images, prevImg) : prevImg,
        };
      });
    } catch (e) {
      showToast('error', (e as Error).message);
    } finally {
      setRewriting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      images: imagesToList(form.images),
      tags: tagsToList(form.tags),
      giftcodeGameId: form.giftcodeGameId?.trim() || null,
    };
    const articleId = resolvedArticleId;
    const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles';
    const method = articleId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const { data } = await parseJsonResponse(res);
    if (!res.ok) {
      showToast('error', (data?.error as string) || 'Lỗi lưu');
      return;
    }
    showToast('success', articleId ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết thành công!');
    if (articleId) {
      router.push('/admin/articles');
    } else {
      const newId = data?.id ?? data?._id;
      const safe =
        newId != null &&
        String(newId).trim() &&
        String(newId) !== 'undefined' &&
        String(newId) !== 'null'
          ? String(newId).trim()
          : '';
      router.push(safe ? `/admin/articles/${safe}` : '/admin/articles');
    }
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg">
        <input
          type="url"
          placeholder="URL bài gốc để cào..."
          value={scrapeUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={handleScrape}
          disabled={scraping}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {scraping ? 'Đang cào...' : 'Cào bài + ảnh'}
        </button>
        <button
          type="button"
          onClick={handleAiRewrite}
          disabled={rewriting || !form.content.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {rewriting ? 'Đang xử lý...' : 'AI viết lại + SEO'}
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Tiêu đề *</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Slug (URL)</label>
        <input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          placeholder="tu-dong-tu-tieu-de-neu-de-trong"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Mô tả ngắn / Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Nội dung (HTML) *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
          rows={16}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Ảnh đại diện (URL)</label>
        <input
          value={form.thumbnail}
          onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Ảnh trong bài (mỗi URL một dòng)</label>
        <textarea
          value={form.images}
          onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Chuyên mục</label>
          <select
            value={
              categories.some((c) => c.slug === form.categorySlug)
                ? form.categorySlug
                : form.categorySlug
                  ? `__other__${form.categorySlug}`
                  : ''
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith('__other__')) {
                setForm((f) => ({ ...f, categorySlug: v.replace('__other__', '') }));
              } else {
                setForm((f) => ({ ...f, categorySlug: v }));
              }
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          >
            {!categoriesLoaded ? (
              <option value="">Đang tải chuyên mục...</option>
            ) : categories.length === 0 ? (
              <option value="">— Chưa có chuyên mục —</option>
            ) : null}
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
            {form.categorySlug && !categories.some((c) => c.slug === form.categorySlug) && (
              <option value={`__other__${form.categorySlug}`}>
                {form.categorySlug} (slug cũ — thêm chuyên mục tương ứng nếu cần)
              </option>
            )}
          </select>
          {categoriesLoaded && categories.length === 0 && (
            <p className="text-amber-500 text-xs mt-1">
              Chưa có chuyên mục. Vào{' '}
              <a href="/admin/categories" className="underline">
                Chuyên mục
              </a>{' '}
              hoặc chạy seed.
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Game giftcode (đồng bộ kho mã admin)</label>
          <select
            value={form.giftcodeGameId}
            onChange={(e) => setForm((f) => ({ ...f, giftcodeGameId: e.target.value }))}
            className="w-full max-w-xl px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="">— Không hiện ô nhận mã —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <p className="text-amber-500/90 text-xs mt-1.5">
            Bài giftcode: chọn chuyên mục <strong className="text-amber-400">GIFTCODE</strong> (slug <code className="text-gray-400">giftcode</code>) + chọn đúng game trùng bảng Admin → Giftcode. Người đọc phải Share Facebook rồi mới nhận được mã (mỗi IP 1 mã/bài).
          </p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tác giả</label>
          <input
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isHot}
            onChange={(e) => setForm((f) => ({ ...f, isHot: e.target.checked }))}
            className="rounded"
          />
          <span className="text-gray-300">Tin Hot</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            className="rounded"
          />
          <span className="text-gray-300">Nổi bật</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Trạng thái:</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Meta Title (SEO)</label>
        <input
          value={form.metaTitle}
          onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Meta Description (SEO)</label>
        <textarea
          value={form.metaDescription}
          onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          rows={2}
        />
      </div>
      <div className="flex gap-4">
        <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          {resolvedArticleId ? 'Cập nhật' : 'Tạo bài viết'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
          Hủy
        </button>
      </div>
    </form>
  );
}
