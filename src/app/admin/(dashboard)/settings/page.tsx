'use client';

import { useState, useEffect } from 'react';
import {
  IconCheck,
  IconClipboard,
  IconSmartphone,
  IconRobot,
  IconBraces,
  IconSave,
  IconChart,
  IconMail,
  IconBrandFacebook,
} from '@/components/icons';
import { DEFAULT_JSON_LD_EXTRA } from '@/lib/defaultJsonLdExtra';
import { useToast } from '@/components/Toast';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteName: 'GAMEVIET.IO.VN',
    siteTitle: 'GAMEVIET.IO.VN - Tin tức Game, Esports, Công nghệ',
    siteDescription: 'Cập nhật tin tức game mobile, game online, esports, công nghệ, giftcode mới nhất. Đọc tin hot và bài viết chuyên sâu tại GAMEVIET.IO.VN',
    siteKeywords: 'game, tin tức game, esports, giftcode, game mobile, game online, liên minh huyền thoại, valorant, pubg, công nghệ',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterSite: '@gamevietio',
    canonicalBase: 'https://gameviet.io.vn',
    robotsIndex: true,
    robotsFollow: true,
    locale: 'vi_VN',
    jsonLdExtra: DEFAULT_JSON_LD_EXTRA,
    googleAnalyticsId: '',
    facebookUrl: '',
    supportEmail: '',
    spamEmail: '',
  });

  useEffect(() => {
    fetch('/api/admin/seo-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setForm((prev) => ({
            ...prev,
            siteName: data.siteName ?? prev.siteName,
            siteTitle: data.siteTitle ?? prev.siteTitle,
            siteDescription: data.siteDescription ?? prev.siteDescription,
            siteKeywords: data.siteKeywords ?? prev.siteKeywords,
            ogImage: data.ogImage ?? '',
            ogType: data.ogType ?? 'website',
            twitterCard: data.twitterCard ?? 'summary_large_image',
            twitterSite: data.twitterSite ?? '',
            canonicalBase: data.canonicalBase ?? '',
            robotsIndex: data.robotsIndex !== false,
            robotsFollow: data.robotsFollow !== false,
            locale: data.locale ?? 'vi_VN',
            jsonLdExtra: data.jsonLdExtra?.trim() ? data.jsonLdExtra : DEFAULT_JSON_LD_EXTRA,
            googleAnalyticsId: data.googleAnalyticsId ?? '',
            facebookUrl: data.facebookUrl ?? '',
            supportEmail: data.supportEmail ?? '',
            spamEmail: data.spamEmail ?? '',
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast('error', d.error || 'Lỗi lưu cấu hình');
        return;
      }
      setSaved(true);
      showToast('success', 'Lưu cấu hình SEO thành công!');
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cấu hình SEO</h1>
          <p className="text-gray-400 text-sm mt-1">Các giá trị này dùng cho meta toàn site, Open Graph và SEO</p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
            <IconCheck className="w-5 h-5 shrink-0" aria-hidden />
            Đã lưu!
          </span>
        )}
      </div>
      <form onSubmit={submit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconClipboard className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tên site (Site Name)</label>
              <input value={form.siteName} onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Canonical Base URL</label>
              <input value={form.canonicalBase} onChange={(e) => setForm((f) => ({ ...f, canonicalBase: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" placeholder="https://gameviet.io.vn" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Tiêu đề mặc định (Title)</label>
              <input value={form.siteTitle} onChange={(e) => setForm((f) => ({ ...f, siteTitle: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Mô tả mặc định (Meta Description)</label>
              <textarea value={form.siteDescription} onChange={(e) => setForm((f) => ({ ...f, siteDescription: e.target.value }))} rows={3} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Từ khóa (Meta Keywords)</label>
              <input value={form.siteKeywords} onChange={(e) => setForm((f) => ({ ...f, siteKeywords: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" placeholder="game, tin tức game, esports, giftcode..." />
            </div>
          </div>
        </div>

        {/* Open Graph & Twitter */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconSmartphone className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Open Graph & Twitter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ảnh Open Graph (URL)</label>
              <input value={form.ogImage} onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">OG Type</label>
              <select value={form.ogType} onChange={(e) => setForm((f) => ({ ...f, ogType: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none">
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="blog">Blog</option>
                <option value="news">News</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Twitter Card</label>
              <select value={form.twitterCard} onChange={(e) => setForm((f) => ({ ...f, twitterCard: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none">
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Twitter @site</label>
              <input value={form.twitterSite} onChange={(e) => setForm((f) => ({ ...f, twitterSite: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" placeholder="@gamevietio" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Locale</label>
              <input value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))} className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Robots */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconRobot className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Robots & Indexing
          </h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.robotsIndex} onChange={(e) => setForm((f) => ({ ...f, robotsIndex: e.target.checked }))} className="w-5 h-5 rounded bg-[#222] border-[#333] text-[#e11d48] focus:ring-[#e11d48]" />
              <span className="text-gray-300">Cho phép index (robots)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.robotsFollow} onChange={(e) => setForm((f) => ({ ...f, robotsFollow: e.target.checked }))} className="w-5 h-5 rounded bg-[#222] border-[#333] text-[#e11d48] focus:ring-[#e11d48]" />
              <span className="text-gray-300">Cho phép follow links</span>
            </label>
          </div>
        </div>

        {/* JSON-LD */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconBraces className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            JSON-LD bổ sung
          </h2>
          <textarea
            value={form.jsonLdExtra}
            onChange={(e) => setForm((f) => ({ ...f, jsonLdExtra: e.target.value }))}
            rows={14}
            spellCheck={false}
            className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Google Analytics */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconChart className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Google Analytics
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Measurement ID (G-XXXXXXXXXX hoặc UA-XXXXX-X)</label>
              <input
                value={form.googleAnalyticsId}
                onChange={(e) => setForm((f) => ({ ...f, googleAnalyticsId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-gray-500 text-xs mt-1">Nhập ID Google Analytics 4 (G-...) hoặc Universal Analytics (UA-...)</p>
            </div>
          </div>
        </div>

        {/* Liên hệ & Hỗ trợ */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconMail className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Liên hệ & Hỗ trợ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Facebook Support (URL Fanpage)</label>
              <input
                value={form.facebookUrl}
                onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
                placeholder="https://facebook.com/yourfanpage"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email hỗ trợ (hiển thị công khai)</label>
              <input
                value={form.supportEmail}
                onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
                placeholder="support@gameviet.io.vn"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Email nhận Spam/Báo cáo</label>
              <input
                value={form.spamEmail}
                onChange={(e) => setForm((f) => ({ ...f, spamEmail: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
                placeholder="spam@gameviet.io.vn"
              />
              <p className="text-gray-500 text-xs mt-1">Dùng để nhận các thư báo cáo vi phạm, spam từ người dùng</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#e11d48] text-white font-semibold rounded-lg hover:bg-[#be123c] disabled:opacity-50 transition-colors"
        >
          {saving ? (
            'Đang lưu...'
          ) : (
            <>
              <IconSave className="w-5 h-5 shrink-0" aria-hidden />
              Lưu cấu hình SEO
            </>
          )}
        </button>
      </form>
    </div>
  );
}
