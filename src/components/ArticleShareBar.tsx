'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArticleShareBar({
  url,
  fanpageUrl,
  shareTitle,
}: {
  url: string;
  fanpageUrl?: string;
  /** Gợi ý nội dung khi chia sẻ (Facebook có thể hiện kèm link). */
  shareTitle?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-[#252525]">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100 border border-neutral-200"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Trang chủ
      </Link>
      {fanpageUrl ? (
        <a
          href={fanpageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold bg-[#1877f2] text-white hover:bg-[#166fe5]"
        >
          Trang Facebook
        </a>
      ) : null}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}${
          shareTitle?.trim()
            ? `&quote=${encodeURIComponent(shareTitle.trim().slice(0, 240))}`
            : ''
        }`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold bg-[#4267B2] text-white hover:bg-[#365899]"
        title="Chia sẻ lên Facebook (trên domain thật mới có ảnh xem trước đầy đủ)"
      >
        Chia sẻ
      </a>
      <button
        type="button"
        onClick={copy}
        className="px-4 py-2 rounded text-sm font-semibold bg-[#1f1f1f] text-[#ccc] hover:bg-[#2a2a2a] border border-[#333]"
      >
        {copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
      </button>
    </div>
  );
}
