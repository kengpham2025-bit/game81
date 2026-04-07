'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogout() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <button type="button" onClick={logout} className="text-sm text-red-500 hover:underline">
      Đăng xuất
    </button>
  );
}
