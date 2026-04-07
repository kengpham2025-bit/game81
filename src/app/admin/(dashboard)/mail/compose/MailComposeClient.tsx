'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function MailComposeClient({ defaultTo }: { defaultTo: string }) {
  const { showToast } = useToast();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const sendRealEmail = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      showToast('warning', 'Nhập đầy đủ thông tin người nhận, tiêu đề và nội dung');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Lỗi gửi email');
        return;
      }
      showToast('success', 'Gửi email thành công!');
      setSubject('');
      setBody('');
    } finally {
      setSending(false);
    }
  };

  const openMail = () => {
    const q = new URLSearchParams();
    if (subject) q.set('subject', subject);
    if (body) q.set('body', body);
    const href = `mailto:${encodeURIComponent(to)}${q.toString() ? `?${q.toString()}` : ''}`;
    window.location.href = href;
  };

  return (
    <div className="max-w-2xl space-y-5 bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
      <div>
        <label className="block text-gray-400 mb-1.5">Đến (email)</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          type="email"
          className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-1.5">Tiêu đề</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-1.5">Nội dung</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none resize-y"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={sendRealEmail}
          disabled={sending || !to.trim()}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {sending ? 'Đang gửi...' : 'Gửi email thực'}
        </button>
        <button
          type="button"
          onClick={openMail}
          disabled={!to.trim()}
          className="px-6 py-3 bg-[#e11d48] text-white font-semibold rounded-lg hover:bg-[#be123c] disabled:opacity-50"
        >
          Mở ứng dụng mail
        </button>
      </div>
      <p className="text-gray-500 text-sm">
        <strong className="text-green-500">Gửi email thực:</strong> Cần cấu hình SMTP trong .env.local.<br />
        <strong className="text-rose-500">Mở ứng dụng mail:</strong> Dùng Gmail/Outlook trên máy tính (không cần cấu hình).
      </p>
    </div>
  );
}
