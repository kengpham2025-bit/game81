'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

type Category = { id: string; name: string; slug: string };

export default function EditGamePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isTopWeek, setIsTopWeek] = useState(false);
  const [isTopMonth, setIsTopMonth] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch('/api/admin/games')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const game = list.find((g: { id?: string; _id?: string }) => (g.id ?? g._id) === id);
        if (game) {
          setName(game.name || '');
          setSlug(game.slug || game.category || '');
          setAvatar(game.avatar || '');
          setIsTopWeek(!!game.isTopWeek);
          setIsTopMonth(!!game.isTopMonth);
        }
        setLoading(false);
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, avatar: avatar || undefined, isTopWeek, isTopMonth }),
    });
    if (!res.ok) {
      const d = await res.json();
      showToast('error', d.error || 'Lỗi cập nhật game');
      return;
    }
    showToast('success', 'Cập nhật game thành công!');
    router.push('/admin/games');
    router.refresh();
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Sửa game</h1>
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
        <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cập nhật</button>
      </form>
    </div>
  );
}
