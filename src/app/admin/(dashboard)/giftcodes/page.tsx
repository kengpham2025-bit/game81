'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

type Game = { id?: string; _id?: string; name: string; slug: string; avatar?: string };
type Item = { id?: string; _id: string; gameId: Game; count: number; codes?: string[]; quotaTotal?: number };

function normalizeGiftcodesPayload(data: unknown): Item[] {
  if (!Array.isArray(data)) return [];
  return data.map((row: Item & { id?: string }) => ({
    ...row,
    _id: row._id ?? row.id ?? '',
    gameId: row.gameId && typeof row.gameId === 'object'
      ? { ...row.gameId, _id: (row.gameId as Game)._id ?? (row.gameId as Game).id ?? '' }
      : row.gameId,
  })).filter((row: Item) => row._id);
}

export default function AdminGiftcodesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string; count: number } | null>(null);
  const [editingCodesId, setEditingCodesId] = useState<string | null>(null);
  const [codesDraft, setCodesDraft] = useState('');

  const refresh = useCallback(() => {
    return Promise.all([
      fetch('/api/admin/giftcodes').then((r) => r.json()),
      fetch('/api/admin/games').then((r) => r.json()),
    ]).then(([codes, gamesList]) => {
      setItems(normalizeGiftcodesPayload(codes));
      setGames(Array.isArray(gamesList) ? gamesList : []);
    });
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const saveCount = async (gameId: string, count: number) => {
    const res = await fetch('/api/admin/giftcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, count }),
    });
    if (!res.ok) return;
    setEditing(null);
    refresh();
  };

  const openCodesEditor = (row: Item) => {
    setEditingCodesId(row._id);
    setCodesDraft((row.codes || []).join('\n'));
  };

  const saveCodes = async (gameId: string) => {
    const res = await fetch('/api/admin/giftcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, codesText: codesDraft }),
    });
    if (!res.ok) return;
    setEditingCodesId(null);
    setCodesDraft('');
    refresh();
  };

  const saveQuotaTotal = async (gameId: string, quotaTotal: number) => {
    await fetch('/api/admin/giftcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, quotaTotal }),
    });
    refresh();
  };

  const deleteRow = async (docId: string, gameName: string) => {
    if (!docId) return;
    if (!confirm(`Xóa giftcode của game "${gameName}"? Hành động không hoàn tác.`)) return;
    const res = await fetch(`/api/admin/giftcodes?id=${encodeURIComponent(docId)}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert((d.error as string) || 'Xóa thất bại.');
      return;
    }
    setEditing(null);
    setEditingCodesId(null);
    refresh();
  };

  const gameIdNorm = (g: Game) => g.id ?? g._id ?? '';
  const gamesNotInList = games.filter(
    (g) => !items.some((row) => gameIdNorm(row.gameId as Game) === gameIdNorm(g))
  );

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Giftcode</h1>

      <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Thêm giftcode cho game</h2>
        <p className="text-sm text-gray-400 mb-3">
          Chọn game chưa có trong bảng bên dưới, nhập mã (mỗi dòng một mã) hoặc chỉ số lượng. Cột <strong className="text-gray-300">Tổng hiển thị</strong> (vd 200) để hiện &quot;Còn X/200&quot; trên bài giftcode.
        </p>
        {games.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có game nào trong hệ thống — thêm game ở mục Game trước.</p>
        ) : gamesNotInList.length === 0 ? (
          <p className="text-amber-500/90 text-sm">
            Mọi game đã có dòng giftcode — xóa một dòng nếu muốn thêm lại cho game đó, hoặc tạo game mới.
          </p>
        ) : (
          <AddGiftCodeForm games={gamesNotInList} onAdded={refresh} />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="pb-2">Game</th>
              <th className="pb-2">Mã giftcode</th>
              <th className="pb-2">Số lượng</th>
              <th className="pb-2 text-gray-500">Tổng hiển thị</th>
              <th className="pb-2 w-[140px]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Chưa có giftcode nào — dùng mục &quot;Thêm giftcode cho game&quot; phía trên.
                </td>
              </tr>
            )}
            {items.map((row) => {
              const g = row.gameId as unknown as Game;
              const isEdit = editing?.id === row._id;
              const codes = row.codes || [];
              const preview =
                codes.length === 0
                  ? '—'
                  : codes.length <= 2
                    ? codes.join(', ')
                    : `${codes[0]}, ${codes[1]}… (+${codes.length - 2})`;
              return (
                <tr key={row._id} className="border-b border-gray-800 align-top">
                  <td className="py-2 flex items-center gap-2">
                    {g?.avatar && <Image src={g.avatar} alt={g?.name} width={24} height={24} className="rounded" />}
                    <span className="text-white">{g?.name || '-'}</span>
                  </td>
                  <td className="py-2 max-w-[280px]">
                    {editingCodesId === row._id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={codesDraft}
                          onChange={(e) => setCodesDraft(e.target.value)}
                          rows={6}
                          placeholder="Mỗi dòng một mã"
                          className="w-full min-w-[240px] px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-white text-sm font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveCodes((g?._id || g?.id || row._id) as string)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500"
                          >
                            Lưu mã
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCodesId(null);
                              setCodesDraft('');
                            }}
                            className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-300 text-sm break-all">{preview}</span>
                        <button
                          type="button"
                          onClick={() => openCodesEditor(row)}
                          className="block mt-1 text-gray-500 hover:text-red-500 text-sm"
                        >
                          Nhập / sửa mã
                        </button>
                      </>
                    )}
                  </td>
                  <td className="py-2">
                    {isEdit ? (
                      <input
                        type="number"
                        defaultValue={row.count}
                        onBlur={(e) => saveCount((g?._id || g?.id || row._id) as string, parseInt(e.target.value, 10) || 0)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && saveCount((g?._id || g?.id || row._id) as string, parseInt((e.target as HTMLInputElement).value, 10) || 0)
                        }
                        className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="text-red-500 font-bold">{row.count}</span>
                    )}
                  </td>
                  <td className="py-2 text-gray-400 text-sm">
                    <input
                      type="number"
                      min={0}
                      defaultValue={row.quotaTotal || row.codes?.length || row.count || 0}
                      title="Số phần quà hiển thị (vd 200) — còn lại = số mã trong danh sách"
                      onBlur={(e) => saveQuotaTotal((g?._id || g?.id || row._id) as string, Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-2">
                    {!isEdit && editingCodesId !== row._id && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => setEditing({ id: row._id, count: row.count })}
                          className="text-gray-500 hover:text-red-500 text-sm"
                        >
                          Sửa số
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row._id, g?.name || 'game')}
                          className="text-gray-500 hover:text-red-600 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddGiftCodeForm({ games, onAdded }: { games: Game[]; onAdded: () => void }) {
  const [gameId, setGameId] = useState('');
  const [count, setCount] = useState(0);
  const [quotaTotal, setQuotaTotal] = useState(0);
  const [codesText, setCodesText] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    const body: Record<string, unknown> = { gameId };
    if (codesText.trim()) {
      body.codesText = codesText;
      body.quotaTotal = quotaTotal > 0 ? quotaTotal : codesText.split(/\r?\n/).filter((l) => l.trim()).length;
    } else {
      body.count = count;
      body.quotaTotal = quotaTotal > 0 ? quotaTotal : count;
    }
    await fetch('/api/admin/giftcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setGameId('');
    setCount(0);
    setQuotaTotal(0);
    setCodesText('');
    onAdded();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tổng hiển thị (vd 200)</label>
          <input
            type="number"
            min={0}
            value={quotaTotal}
            onChange={(e) => setQuotaTotal(parseInt(e.target.value, 10) || 0)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white w-24"
            placeholder="200"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Game</label>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white min-w-[180px]"
            required
          >
            <option value="">-- Chọn game --</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Số lượng (khi không nhập mã)</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white w-24"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Thêm / lưu
        </button>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Danh sách mã (mỗi dòng một mã) — ưu tiên hơn số lượng</label>
        <textarea
          value={codesText}
          onChange={(e) => setCodesText(e.target.value)}
          rows={5}
          placeholder="ABC123&#10;XYZ789"
          className="w-full max-w-xl px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white font-mono text-sm"
        />
      </div>
    </form>
  );
}
