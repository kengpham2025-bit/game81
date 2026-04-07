'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAdminConfirm } from '@/components/AdminConfirm';

type Article = {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  status: string;
  publishedAt?: string;
};

/** Chuẩn hóa id từ API — loại bỏ thiếu id hoặc chuỗi "undefined"/"null" (tránh /admin/articles/undefined) */
function extractArticleId(a: Article & { _id?: unknown }): string {
  const raw = a.id ?? a._id;
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s || s === 'undefined' || s === 'null') return '';
  return s;
}

export default function AdminArticlesClient() {
  const { showToast } = useToast();
  const { confirm } = useAdminConfirm();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/articles?limit=500&page=1', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const raw = Array.isArray(data) ? data : data?.items;
        if (Array.isArray(raw)) {
          setArticles(
            raw
              .map((a: Article & { _id?: unknown }) => ({
                ...a,
                id: extractArticleId(a),
              }))
              .filter((a) => a.id)
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirm('Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác.', {
      title: 'Xóa bài viết',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Lỗi xóa bài viết');
        return;
      }
      showToast('success', 'Đã xóa bài viết');
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportTxt = () => {
    const domain = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn').replace(/^https?:\/\//, '');
    const content = articles
      .filter((a) => a.slug?.trim())
      .map((a) => `${domain}/${a.slug.trim()}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `url-bai-viet-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Đã xuất file TXT');
  };

  if (loading) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Bài viết</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportTxt}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Xuất TXT
          </button>
          <Link href="/admin/articles/new" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Thêm bài viết
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="pb-2">Tiêu đề</th>
                <th className="pb-2">Chuyên mục</th>
                <th className="pb-2">Trạng thái</th>
                <th className="pb-2">Ngày</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-gray-800">
                  <td className="py-2 max-w-xs truncate text-white">{a.title}</td>
                  <td className="py-2 text-gray-400">{a.categorySlug || '-'}</td>
                  <td className="py-2">
                    <span className={a.status === 'published' ? 'text-green-500' : 'text-yellow-500'}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500 text-sm">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-3">
                      {a.id ? (
                        <Link href={`/admin/articles/${a.id}`} className="text-red-500 hover:underline text-sm">
                          Sửa
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-sm">Sửa</span>
                      )}
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="text-gray-500 hover:text-red-500 text-sm disabled:opacity-50"
                      >
                        {deletingId === a.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
