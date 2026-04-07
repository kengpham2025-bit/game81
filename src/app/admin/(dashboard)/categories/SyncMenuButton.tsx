'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAdminConfirm } from '@/components/AdminConfirm';

export default function SyncMenuButton() {
  const { showToast } = useToast();
  const { confirm } = useAdminConfirm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    const ok = await confirm(
      'Đồng bộ menu trang chủ về danh sách chuẩn:\nGAME MOBILE … VIDEO, THƯ VIỆN GAME, COSPLAY, GIFTCODE → /giftcode',
      { title: 'Đồng bộ menu', confirmText: 'Đồng bộ', cancelText: 'Hủy bỏ', variant: 'default' }
    );
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories/sync-menu', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Lỗi');
        return;
      }
      showToast('success', data.message || 'Đã đồng bộ menu');
      router.refresh();
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={sync}
      disabled={loading}
      className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm font-semibold"
    >
      {loading ? 'Đang đồng bộ…' : 'Đồng bộ menu chuẩn'}
    </button>
  );
}
