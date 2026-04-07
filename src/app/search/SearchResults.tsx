'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  publishedAt?: string;
};

export default function SearchResults({ query }: { query: string }) {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(!!query);

  useEffect(() => {
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/articles?limit=30&q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query) return <p className="text-gray-500">Nhập từ khóa và tìm kiếm.</p>;
  if (loading) return <p className="text-gray-500">Đang tải...</p>;
  if (items.length === 0) return <p className="text-gray-500">Không tìm thấy bài viết nào.</p>;

  return (
    <ul className="space-y-4">
      {items.map((a) => (
        <li key={a._id}>
          <Link href={`/tin-tuc/${a.slug}`} className="flex gap-4 group">
            <div className="relative w-24 h-16 flex-shrink-0 bg-gray-900 rounded overflow-hidden">
              {a.thumbnail ? (
                <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">No img</div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-white group-hover:text-red-500">{a.title}</h2>
              {a.excerpt && <p className="text-gray-400 text-sm line-clamp-1">{a.excerpt}</p>}
              {a.publishedAt && (
                <p className="text-gray-500 text-xs mt-1">{new Date(a.publishedAt).toLocaleDateString('vi-VN')}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
