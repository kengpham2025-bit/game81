'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminConfirm } from '@/components/AdminConfirm';
import { useToast } from '@/components/Toast';

type Msg = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  ip?: string;
  createdAt: string;
};

export default function MailInboxClient() {
  const { confirm } = useAdminConfirm();
  const { showToast } = useToast();
  const [list, setList] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/mail-messages');
    if (!res.ok) return;
    const data = await res.json();
    const raw = Array.isArray(data) ? data : [];
    setList(raw.map((m: Msg & { id?: string }) => ({ ...m, _id: m._id ?? m.id ?? '' })).filter((m: Msg) => m._id));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string, read: boolean) => {
    await fetch('/api/admin/mail-messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read }),
    });
    setList((prev) => prev.map((m) => (m._id === id ? { ...m, read } : m)));
  };

  const remove = async (id: string) => {
    if (!id) return;
    const ok = await confirm('Xóa vĩnh viễn tin nhắn này?', {
      title: 'Xóa tin nhắn',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/mail-messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showToast('error', (d.error as string) || 'Không xóa được');
      return;
    }
    setList((prev) => prev.filter((m) => (m._id ?? m.id) !== id));
    if (openId === id) setOpenId(null);
    showToast('success', 'Đã xóa tin nhắn');
  };

  if (loading) {
    return <p className="text-gray-500">Đang tải…</p>;
  }

  if (list.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 text-center text-gray-500">
        Chưa có tin nhắn. Khách gửi qua trang{' '}
        <a href="/lien-he" className="text-[#e11d48] hover:underline" target="_blank" rel="noreferrer">
          /lien-he
        </a>{' '}
        sẽ hiện tại đây.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((m) => {
        const expanded = openId === m._id;
        return (
          <li
            key={m._id}
            className={`rounded-xl border overflow-hidden ${m.read ? 'border-[#333] bg-[#141414]' : 'border-[#e11d48]/40 bg-[#1a1014]'}`}
          >
            <button
              type="button"
              onClick={() => {
                setOpenId(expanded ? null : m._id);
                if (!m.read) markRead(m._id, true);
              }}
              className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-2 justify-between hover:bg-white/5"
            >
              <span className={`font-medium ${m.read ? 'text-gray-400' : 'text-white'}`}>{m.name}</span>
              <span className="text-gray-500 text-sm">{m.email}</span>
              <span className="text-gray-600 text-xs w-full sm:w-auto">
                {new Date(m.createdAt).toLocaleString('vi-VN')}
              </span>
            </button>
            {expanded && (
              <div className="px-4 pb-4 pt-0 border-t border-[#333] space-y-3">
                {m.subject && <p className="text-[#e11d48] font-medium pt-3">{m.subject}</p>}
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                {m.ip && <p className="text-gray-600 text-xs">IP: {m.ip}</p>}
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Liên hệ')}`}
                    className="px-4 py-2 bg-[#e11d48] text-white rounded-lg text-sm font-medium hover:bg-[#be123c]"
                  >
                    Trả lời qua mail
                  </a>
                  <button
                    type="button"
                    onClick={() => markRead(m._id, !m.read)}
                    className="px-4 py-2 bg-[#333] text-white rounded-lg text-sm hover:bg-[#444]"
                  >
                    {m.read ? 'Đánh dấu chưa đọc' : 'Đã đọc'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m._id)}
                    className="px-4 py-2 border border-red-900 text-red-400 rounded-lg text-sm hover:bg-red-950/50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
