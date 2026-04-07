'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconKey, IconSave, IconCheck } from '@/components/icons';

type Props = { defaultEmail: string };

export default function PasswordFormClient({ defaultEmail }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: defaultEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email.trim()) {
      setError('Nhập email / tài khoản đăng nhập');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Lỗi');
        return;
      }

      setSuccess(data.message || 'Đổi mật khẩu thành công');
      setForm((f) => ({
        ...f,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Đổi mật khẩu</h1>
        <p className="text-gray-400 text-base mt-2 leading-relaxed">
          Nhập email tài khoản admin và mật khẩu để cập nhật.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600 rounded-lg text-green-400 text-base flex items-center gap-2">
          <IconCheck className="w-6 h-6 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-base leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Email / tài khoản</label>
          <input
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 text-base bg-[#222] border border-[#333] rounded-lg text-white placeholder:text-gray-500 focus:border-[#e11d48] focus:outline-none"
            required
            placeholder="admin@example.com"
          />
          <p className="text-gray-500 text-sm mt-1.5">Phải trùng với tài khoản đang đăng nhập.</p>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Mật khẩu hiện tại</label>
          <input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="w-full px-4 py-3 text-base bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
            required
            minLength={1}
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Mật khẩu mới</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            className="w-full px-4 py-3 text-base bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
            required
            minLength={6}
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className="w-full px-4 py-3 text-base bg-[#222] border border-[#333] rounded-lg text-white focus:border-[#e11d48] focus:outline-none"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold bg-[#e11d48] text-white rounded-lg hover:bg-[#be123c] disabled:opacity-50 transition-colors"
        >
          {saving ? (
            'Đang lưu...'
          ) : (
            <>
              <IconSave className="w-5 h-5 shrink-0" />
              Đổi mật khẩu
            </>
          )}
        </button>
      </form>
    </div>
  );
}
