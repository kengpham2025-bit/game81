'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SyncMenuButton from './SyncMenuButton';
import { useAdminConfirm } from '@/components/AdminConfirm';
import { useToast } from '@/components/Toast';

type Cat = {
  id: string;
  name: string;
  slug: string;
  order: number;
  showInNav?: boolean;
  customPath?: string;
};

export default function AdminCategoriesPage() {
  const { confirm } = useAdminConfirm();
  const { showToast } = useToast();
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const deleteCat = async (id: string) => {
    if (!id) return;
    const ok = await confirm('Xóa chuyên mục này? Các bài viết thuộc slug này có thể bị ảnh hưởng hiển thị.', {
      title: 'Xóa chuyên mục',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast('error', (d.error as string) || 'Không xóa được');
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== id));
    showToast('success', 'Đã xóa chuyên mục');
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Chuyên mục & menu trang chủ</h1>
          <p className="text-gray-500 text-sm mt-1">Thứ tự + cột Menu = thanh điều hướng GAME VIỆT</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SyncMenuButton />
          <Link href="/admin/categories/new" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold">
            Thêm chuyên mục
          </Link>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-4 max-w-3xl">
        Menu trang chủ: <strong className="text-gray-400">TRANG CHỦ</strong>, GAME MOBILE … GAME NFT, THƯ VIỆN GAME, COSPLAY, VIDEO, GIFTCODE. Bấm{' '}
        <strong>Đồng bộ menu chuẩn</strong> để tạo/cập nhật đúng danh sách này.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="pb-2">Tên</th>
              <th className="pb-2">Slug</th>
              <th className="pb-2">Thứ tự</th>
              <th className="pb-2">Menu</th>
              <th className="pb-2">Link menu</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-gray-800">
                <td className="py-2 text-white">{c.name}</td>
                <td className="py-2 text-gray-400">{c.slug}</td>
                <td className="py-2 text-gray-400">{c.order}</td>
                <td className="py-2 text-gray-400">{c.showInNav !== false ? 'Có' : 'Không'}</td>
                <td className="py-2 text-gray-500 text-xs font-mono max-w-[140px] truncate">
                  {c.customPath?.trim() || `/category/${c.slug}`}
                </td>
                <td className="py-2 flex gap-2">
                  <Link href={`/admin/categories/${c.id}`} className="text-red-500 hover:underline text-sm">Sửa</Link>
                  <button type="button" onClick={() => deleteCat(c.id)} className="text-gray-500 hover:text-red-500 text-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
