'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AD_BANNER_SPECS, getAdBannerSpec } from '@/lib/adBannerSpecs';

type Category = { _id: string; name: string; slug: string };

export default function EditAdPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('sidebar');
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [adText, setAdText] = useState('');
  const [sponsorLabel, setSponsorLabel] = useState('');
  const [inArticleKind, setInArticleKind] = useState<'image' | 'text'>('image');
  const [alt, setAlt] = useState('Banner quảng cáo');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch(`/api/admin/ads/${id}`).then((r) => r.json()),
    ])
      .then(([catsData, adData]) => {
        setCategories(Array.isArray(catsData) ? catsData.filter(Boolean) : []);
        const ad = adData && typeof adData === 'object' ? adData : null;
        if (ad && (ad.id ?? ad._id)) {
          setName(ad.name || '');
          setPosition(ad.position || 'sidebar');
          setCategorySlugs(Array.isArray(ad.categorySlugs) ? ad.categorySlugs : []);
          setImageUrl(ad.imageUrl || '');
          setLinkUrl(ad.linkUrl || '');
          setAdText(ad.adText || '');
          setSponsorLabel(ad.sponsorLabel || '');
          const textAd =
            ad.position === 'in_article' &&
            String(ad.adText || '').trim() &&
            !String(ad.imageUrl || '').trim();
          setInArticleKind(textAd ? 'text' : 'image');
          setAlt(ad.alt || 'Banner quảng cáo');
          setOrder(ad.order ?? 0);
          setIsActive(ad.isActive !== false);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedSpec = getAdBannerSpec(position);
  const showCategorySelect = selectedSpec?.supportsCategories;

  const toggleCategory = (slug: string) => {
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isTextInArticle = position === 'in_article' && inArticleKind === 'text';
    const res = await fetch(`/api/admin/ads/${id}`, {
      method: 'PUT',
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
    if (!res.ok) {
      const d = await res.json();
      showToast('error', d.error || 'Lỗi cập nhật quảng cáo');
      return;
    }
    showToast('success', 'Cập nhật quảng cáo thành công!');
    router.push('/admin/ads');
    router.refresh();
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/ads" className="text-gray-400 hover:text-white inline-flex items-center gap-1.5">
          <IconArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          Quảng cáo
        </Link>
        <h1 className="text-2xl font-bold text-white">Sửa quảng cáo</h1>
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
                categories.map((cat) => (
                  <button
                    key={cat._id}
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
                placeholder="VD: ☀️ HOT: SALE…"
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

        <button type="submit" className="px-6 py-2.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors">
          Cập nhật
        </button>
      </form>
    </div>
  );
}
