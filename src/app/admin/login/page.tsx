'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedSecret, setSeedSecret] = useState('');
  const [showSeedForm, setShowSeedForm] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  const runSeed = async (secret?: string) => {
    setSeedMsg('');
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'x-seed-secret': secret } : {}),
        },
        body: JSON.stringify(secret ? { secret } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSeedMsg(data.error || 'Seed thất bại. Kiểm tra D1 database và biến môi trường.');
        return;
      }
      setSeedMsg(data.message || 'Khởi tạo xong. Đăng nhập bằng ADMIN_EMAIL / ADMIN_PASSWORD đã cấu hình trên server.');
      setShowSeedForm(false);
      setSeedSecret('');
    } finally {
      setSeeding(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }
      router.push('/admin');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-black border border-gray-800 rounded-lg p-6">
        <h1 className="text-xl font-bold text-red-500 mb-6">GAMEVIET.IO.VN — Đăng nhập quản trị</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        {!isDev && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowSeedForm((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Không đăng nhập được? Khởi tạo lại admin
            </button>
            {showSeedForm && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                <label className="block text-xs text-gray-400 mb-1">Mã bí mật (SEED_SECRET)</label>
                <input
                  type="password"
                  value={seedSecret}
                  onChange={(e) => setSeedSecret(e.target.value)}
                  placeholder="Nhập SEED_SECRET từ server"
                  className="w-full px-2 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white mb-2"
                />
                <button
                  type="button"
                  disabled={seeding || !seedSecret.trim()}
                  onClick={() => runSeed(seedSecret.trim())}
                  className="w-full py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  {seeding ? 'Đang khởi tạo...' : 'Khởi tạo lại admin'}
                </button>
              </div>
            )}
          </div>
        )}
        {(isDev || seedMsg) && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            {isDev && (
              <button
                type="button"
                disabled={seeding}
                onClick={() => runSeed()}
                className="w-full py-2 text-sm bg-gray-800 text-gray-300 rounded border border-gray-700 hover:border-red-600 hover:text-white disabled:opacity-50"
              >
                {seeding ? 'Đang khởi tạo...' : 'Khởi tạo admin + chuyên mục (chỉ dev)'}
              </button>
            )}
            {seedMsg && <p className="text-green-500 text-xs mt-2">{seedMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
