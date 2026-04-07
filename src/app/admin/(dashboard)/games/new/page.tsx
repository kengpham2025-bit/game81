'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

type Category = { id: string; name: string; slug: string };

export default function NewGamePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isTopWeek, setIsTopWeek] = useState(false);
  const [isTopMonth, setIsTopMonth] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      showToast('error', 'Vui lòng chọn chuyên mục cho game.');
      return;
    }
    const res = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, avatar: avatar || undefined, isTopWeek, isTopMonth }),
    });
    if (!res.ok) {
      const d = await res.json();
      showToast('error', d.error || 'Lỗi tạo game');
      return;
    }
    showToast('success', 'Tạo game thành công!');
    router.push('/admin/games');
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Thêm game</h1>
      <form onSubmit={submit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tên *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" required />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Chuyên mục (slug) *</label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          >
            <option value="">-- Chọn chuyên mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name} ({c.slug})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Avatar (URL)</label>
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isTopWeek} onChange={(e) => setIsTopWeek(e.target.checked)} className="rounded" />
          <span className="text-gray-300">Top game tuần</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isTopMonth} onChange={(e) => setIsTopMonth(e.target.checked)} className="rounded" />
          <span className="text-gray-300">Top game tháng</span>
        </label>
        <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">Tạo</button>
      </form>
    </div>
  );
}
