'use client';

import { useState } from 'react';

export default function LienHeForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: '' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'err', text: data.error || 'Lỗi' });
        return;
      }
      setMsg({ type: 'ok', text: data.message || 'Đã gửi thành công.' });
      setForm({ name: '', email: '', subject: '', body: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {msg && (
        <div
          className={`mb-6 p-4 rounded-lg text-base ${msg.type === 'ok' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <div>
          <label className="block text-neutral-400 mb-1.5">Họ tên</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1.5">Tiêu đề</label>
          <input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
            placeholder="Tùy chọn"
          />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1.5">Nội dung</label>
          <textarea
            required
            rows={6}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none resize-y min-h-[140px]"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
        </button>
      </form>
    </>
  );
}
