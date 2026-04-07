'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminConfirm } from '@/components/AdminConfirm';
import { useToast } from '@/components/Toast';

type Game = { id: string; _id?: string; name: string; slug: string; avatar?: string; isTopWeek?: boolean; isTopMonth?: boolean };

function gameId(g: Game): string {
  return g.id ?? g._id ?? '';
}

export default function AdminGamesPage() {
  const { confirm } = useAdminConfirm();
  const { showToast } = useToast();
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/games')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setItems(list.map((g: Game) => ({ ...g, id: g.id ?? g._id ?? '' })).filter((g: Game) => gameId(g)));
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteGame = async (id: string) => {
    if (!id) return;
    const ok = await confirm('Xóa game này khỏi danh sách?', {
      title: 'Xóa game',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast('error', (d.error as string) || 'Không xóa được');
      return;
    }
    setItems((prev) => prev.filter((g) => gameId(g) !== id));
    showToast('success', 'Đã xóa game');
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Game</h1>
        <Link href="/admin/games/new" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Thêm game
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="pb-2">Avatar</th>
              <th className="pb-2">Tên</th>
              <th className="pb-2">Slug</th>
              <th className="pb-2">Top tuần</th>
              <th className="pb-2">Top tháng</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr key={gameId(g)} className="border-b border-gray-800">
                <td className="py-2">
                  {g.avatar ? (
                    <Image src={g.avatar} alt={g.name} width={32} height={32} className="rounded object-cover" />
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-2 text-white">{g.name}</td>
                <td className="py-2 text-gray-400">{g.slug}</td>
                <td className="py-2">{g.isTopWeek ? '✓' : '-'}</td>
                <td className="py-2">{g.isTopMonth ? '✓' : '-'}</td>
                <td className="py-2 flex gap-2">
                  <Link href={`/admin/games/${gameId(g)}`} className="text-red-500 hover:underline text-sm">Sửa</Link>
                  <button type="button" onClick={() => deleteGame(gameId(g))} className="text-gray-500 hover:text-red-500 text-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
