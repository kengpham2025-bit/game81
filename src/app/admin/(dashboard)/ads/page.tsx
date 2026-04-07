'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AD_BANNER_SPECS } from '@/lib/adBannerSpecs';
import { useAdminConfirm } from '@/components/AdminConfirm';
import { useToast } from '@/components/Toast';
import {
  IconArrowUp,
  IconLayoutPanel,
  IconMegaphone,
  IconBlocks,
  IconPlus,
  IconCheck,
  IconX,
  IconPencil,
  IconTrash,
} from '@/components/icons';

const POSITION_META: Record<string, { label: string; Icon: typeof IconArrowUp }> = {
  header_banner: { label: 'Banner đầu trang', Icon: IconArrowUp },
  sidebar: { label: 'Sidebar', Icon: IconLayoutPanel },
  footer_banner: { label: 'Banner footer', Icon: IconMegaphone },
  footer_block: { label: 'Khối footer', Icon: IconBlocks },
  in_article: { label: 'Trong bài (ảnh/text)', Icon: IconMegaphone },
};

function PositionLabel({ position }: { position: string }) {
  const m = POSITION_META[position];
  if (!m) return <span>{position}</span>;
  const { Icon, label } = m;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

type Ad = {
  id?: string;
  _id?: string;
  name: string;
  position: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
};

function adId(a: Ad): string {
  return a.id ?? a._id ?? '';
}

export default function AdminAdsPage() {
  const { confirm } = useAdminConfirm();
  const { showToast } = useToast();
  const [items, setItems] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ads')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    if (!id) return;
    await fetch(`/api/admin/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    setItems((prev) => prev.map((a) => (adId(a) === id ? { ...a, isActive: !current } : a)));
  };

  const deleteAd = async (id: string) => {
    if (!id) return;
    const ok = await confirm('Xóa banner quảng cáo này?', {
      title: 'Xóa quảng cáo',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast('error', (d.error as string) || 'Không xóa được');
      return;
    }
    setItems((prev) => prev.filter((a) => adId(a) !== id));
    showToast('success', 'Đã xóa quảng cáo');
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quảng cáo / Banner</h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý banner toàn site — mỗi vị trí có khuyến nghị kích thước ảnh (xem ô dưới và form thêm/sửa).
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e11d48] text-white font-semibold rounded-lg hover:bg-[#be123c] transition-colors"
        >
          <IconPlus className="w-5 h-5 shrink-0" aria-hidden />
          Thêm quảng cáo
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {AD_BANNER_SPECS.map((spec) => {
          const key = spec.value;
          const { label, Icon } = POSITION_META[key] ?? { label: spec.label, Icon: IconMegaphone };
          const count = items.filter((i) => i.position === key).length;
          const active = items.filter((i) => i.position === key && i.isActive).length;
          return (
            <div key={key} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <p className="text-2xl font-bold text-[#e11d48]">
                {active}/{count}
              </p>
              <p className="text-gray-400 text-sm mt-1 inline-flex items-center gap-1.5">
                <Icon className="w-4 h-4 shrink-0 text-gray-500" aria-hidden />
                {label}
              </p>
              <p className="text-[#e11d48]/90 text-xs font-mono mt-2">{spec.sizeRecommended}</p>
              <p className="text-gray-500 text-xs mt-1 leading-snug">{spec.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#333] text-gray-400 text-sm bg-[#222]">
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Vị trí</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={adId(a)} className="border-b border-[#333] hover:bg-[#222]">
                <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                <td className="px-4 py-3 text-gray-400">
                  <span className="px-2 py-1 bg-[#222] rounded text-xs inline-flex items-center gap-1">
                    <PositionLabel position={a.position} />
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(adId(a), a.isActive)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium ${
                      a.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {a.isActive ? (
                      <>
                        <IconCheck className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <IconX className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        Tắt
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-400">{a.order}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link
                    href={`/admin/ads/${adId(a)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#222] text-[#e11d48] rounded text-sm hover:bg-[#333]"
                  >
                    <IconPencil className="w-4 h-4 shrink-0" aria-hidden />
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteAd(adId(a))}
                    className="inline-flex items-center justify-center px-3 py-1 bg-[#222] text-gray-400 rounded text-sm hover:bg-red-600 hover:text-white"
                    aria-label="Xóa quảng cáo"
                  >
                    <IconTrash className="w-4 h-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <IconMegaphone className="w-16 h-16 mx-auto mb-3 text-gray-600" aria-hidden />
          <p>Chưa có quảng cáo nào. Hãy thêm banner đầu tiên!</p>
        </div>
      )}
    </div>
  );
}
