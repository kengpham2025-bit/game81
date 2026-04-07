'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function NewCategoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [showInNav, setShowInNav] = useState(true);
  const [navLabel, setNavLabel] = useState('');
  const [customPath, setCustomPath] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug: slug || undefined,
        order,
        showInNav,
        navLabel: navLabel.trim(),
        customPath: customPath.trim(),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      showToast('error', d.error || 'Lỗi tạo chuyên mục');
      return;
    }
    showToast('success', 'Tạo chuyên mục thành công!');
    router.push('/admin/categories');
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Thêm chuyên mục</h1>
      <p className="text-gray-400 text-sm mb-6 max-w-xl">
        Chuyên mục có <strong className="text-gray-300">hiện trên menu</strong> sẽ xuất hiện trên thanh điều hướng trang chủ (theo thứ tự). Ví dụ GIFTCODE dùng đường dẫn{' '}
        <code className="text-red-400">/giftcode</code> thay vì /category/giftcode.
      </p>
      <form onSubmit={submit} className="max-w-lg space-y-4">
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
          <label className="block text-sm text-gray-400 mb-1">Slug (URL bài trong chuyên mục)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Tự động từ tên"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Thứ tự trên menu</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} className="rounded" />
          <span className="text-gray-300">Hiện trên menu trang chủ</span>
        </label>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nhãn menu (để trống = dùng tên, thường IN HOA)</label>
          <input
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="VD: GAME MOBILE"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Đường dẫn menu tùy chỉnh</label>
          <input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
            placeholder="/category/slug hoặc /giftcode"
          />
          <p className="text-gray-500 text-xs mt-1">Để trống → link menu là /category/{'{slug}'}</p>
        </div>
        <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Tạo
        </button>
      </form>
    </div>
  );
}
