'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AD_BANNER_SPECS, getAdBannerSpec } from '@/lib/adBannerSpecs';

type Category = { id?: string; _id?: string; name: string; slug: string };

export default function NewAdPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('sidebar');
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [adText, setAdText] = useState('');
  const [sponsorLabel, setSponsorLabel] = useState('');
  /** in_article: ảnh hoặc text+link */
  const [inArticleKind, setInArticleKind] = useState<'image' | 'text'>('image');
  const [alt, setAlt] = useState('Banner quảng cáo');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data.filter(Boolean) : []))
      .catch(() => setCategories([]));
  }, []);

  const selectedSpec = getAdBannerSpec(position);
  const showCategorySelect = selectedSpec?.supportsCategories;

  const toggleCategory = (slug: string) => {
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const isTextInArticle = position === 'in_article' && inArticleKind === 'text';
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          position,
          categorySlugs: showCategorySelect ? categorySlugs : [],
          imageUrl: isTextInArticle ? '' : imageUrl,
          linkUrl,
          adText: isTextInArticle ? adText : '',
          sponsorLabel: isTextInArticle ? sponsorLabel : '',
          alt,
          order,
          isActive,
        }),
      });
      const text = await res.text();
      let d: { error?: string } = {};
      try {
        d = text ? JSON.parse(text) : {};
      } catch {
        d = { error: res.ok ? 'Phản hồi không hợp lệ' : `Lỗi ${res.status}. Thử lại sau.` };
      }
      if (!res.ok) {
        showToast('error', d.error || 'Lỗi tạo quảng cáo');
        return;
      }
      showToast('success', 'Tạo quảng cáo thành công!');
      router.push('/admin/ads');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/ads" className="text-gray-400 hover:text-white inline-flex items-center gap-1.5">
          <IconArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          Quảng cáo
        </Link>
        <h1 className="text-2xl font-bold text-white">Thêm quảng cáo</h1>
      </div>
      <form onSubmit={submit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tên *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Vị trí *</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            {AD_BANNER_SPECS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} — {p.sizeRecommended}
              </option>
            ))}
          </select>
          {selectedSpec && (
            <p className="mt-2 text-xs text-amber-200/90 bg-amber-950/40 border border-amber-900/50 rounded-lg px-3 py-2 leading-relaxed">
              <strong className="text-amber-100">Kích thước ảnh:</strong> {selectedSpec.sizeRecommended}. {selectedSpec.hint}
            </p>
          )}
        </div>

        {showCategorySelect && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Áp dụng cho chuyên mục
              <span className="ml-2 text-gray-500 font-normal">(để trống = mọi chuyên mục)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có chuyên mục nào</p>
              ) : (
                categories.filter((c): c is Category => c != null && !!(c.id ?? c._id ?? c.slug)).map((cat) => (
                  <button
                    key={cat.id ?? cat._id ?? cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categorySlugs.includes(cat.slug)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
            {categorySlugs.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Đã chọn: {categorySlugs.join(', ')}
              </p>
            )}
          </div>
        )}

        {showCategorySelect && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Kiểu quảng cáo trong bài</label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inArticleKind"
                  checked={inArticleKind === 'image'}
                  onChange={() => setInArticleKind('image')}
                  className="rounded-full"
                />
                <span className="text-white text-sm">Ảnh banner</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inArticleKind"
                  checked={inArticleKind === 'text'}
                  onChange={() => setInArticleKind('text')}
                  className="rounded-full"
                />
                <span className="text-white text-sm">Text + link (không ảnh)</span>
              </label>
            </div>
          </div>
        )}

        {showCategorySelect && inArticleKind === 'text' ? (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nội dung quảng cáo (text) *</label>
              <textarea
                value={adText}
                onChange={(e) => setAdText(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="VD: ☀️ HOT: SALE CỰC MẠNH ĐẾN TỪ SHOP…"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tên nhà tài trợ / shop</label>
              <input
                value={sponsorLabel}
                onChange={(e) => setSponsorLabel(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="VD: Techmaster"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Link khi click *</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="https://..."
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL ảnh *</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Link khi click</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Alt (SEO)</label>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Thứ tự</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          <div className="flex items-center pt-7">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-400">Hiển thị</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang tạo...' : 'Tạo quảng cáo'}
        </button>
      </form>
    </div>
  );
}
