'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

type Cat = {
  _id: string;
  name: string;
  slug: string;
  order: number;
  showInNav?: boolean;
  navLabel?: string;
  customPath?: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [showInNav, setShowInNav] = useState(true);
  const [navLabel, setNavLabel] = useState('');
  const [customPath, setCustomPath] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        const cat = (Array.isArray(data) ? data : []).find((c: Cat) => c._id === id);
        if (cat) {
          setName(cat.name);
          setSlug(cat.slug);
          setOrder(cat.order ?? 0);
          setShowInNav(cat.showInNav !== false);
          setNavLabel(cat.navLabel || '');
          setCustomPath(cat.customPath || '');
        }
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        order,
        showInNav,
        navLabel: navLabel.trim(),
        customPath: customPath.trim(),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      showToast('error', d.error || 'Lỗi cập nhật chuyên mục');
      return;
    }
    showToast('success', 'Cập nhật chuyên mục thành công!');
    router.push('/admin/categories');
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Sửa chuyên mục</h1>
      <p className="text-gray-400 text-sm mb-6">
        Thay đổi thứ tự / nhãn / đường dẫn để khớp menu trang chủ (GAME MOBILE, GIFTCODE → /giftcode, …).
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
          <label className="block text-sm text-gray-400 mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Thứ tự menu</label>
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
          <label className="block text-sm text-gray-400 mb-1">Nhãn menu</label>
          <input value={navLabel} onChange={(e) => setNavLabel(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Đường dẫn menu (tùy chọn)</label>
          <input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
            placeholder="/giftcode"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Cập nhật
        </button>
      </form>
    </div>
  );
}
