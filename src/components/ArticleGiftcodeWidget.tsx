'use client';

import { useEffect, useState, useCallback } from 'react';

type WidgetState = {
  enabled: boolean;
  gameName?: string;
  remaining: number;
  total: number;
  hasCodes: boolean;
  alreadyClaimed?: boolean;
  codeIfClaimed?: string | null;
  message?: string;
};

const SHARE_KEY = (slug: string) => `gift_fb_share_${slug}`;

export default function ArticleGiftcodeWidget({ articleSlug, shareUrl }: { articleSlug: string; shareUrl: string }) {
  const [data, setData] = useState<WidgetState | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpened, setShareOpened] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/giftcode/article-widget?slug=${encodeURIComponent(articleSlug)}`)
      .then((r) => r.json())
      .then((j) => {
        setData(j);
        if (j.codeIfClaimed) setCode(j.codeIfClaimed);
        if (typeof window !== 'undefined' && sessionStorage.getItem(SHARE_KEY(articleSlug)) === '1') {
          setShareOpened(true);
        }
      })
      .finally(() => setLoading(false));
  }, [articleSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const openShare = () => {
    const u = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'width=600,height=400,noopener,noreferrer');
    setShareOpened(true);
    try {
      sessionStorage.setItem(SHARE_KEY(articleSlug), '1');
    } catch {
      /* ignore */
    }
  };

  const claim = async () => {
    if (!shareOpened) {
      setErr('Vui lòng bấm Share và chia sẻ bài lên Facebook trước.');
      return;
    }
    setErr(null);
    setClaiming(true);
    try {
      const res = await fetch('/api/giftcode/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleSlug, sharedConfirmed: true }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || 'Không lấy được mã.');
        return;
      }
      setCode(j.code);
      load();
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !data?.enabled) return null;

  const remaining = data.remaining;
  const total = Math.max(data.total || 0, remaining);
  const showCount = total > 0;

  return (
    <div className="my-8 rounded-lg border border-white/25 bg-[#141414] px-5 py-5 sm:px-6 shadow-lg">
      <p className="text-center text-white text-[15px] sm:text-base font-medium mb-1">
        {showCount ? (
          <>
            Chỉ còn <span className="text-[#e62117] font-bold">{remaining}</span>
            <span className="text-gray-400">/{total}</span> phần quà
          </>
        ) : (
          <span className="text-gray-300">Kho mã giftcode — {data.gameName}</span>
        )}
      </p>
      {!data.hasCodes && !code && (
        <p className="text-center text-amber-500/90 text-sm mt-2">{data.message || 'Hiện không còn mã hoặc chưa nhập danh sách mã trong admin.'}</p>
      )}
      <p className="text-center text-gray-400 text-sm mt-3 mb-5 leading-relaxed px-1">
        Nhanh tay share bài viết ngay để nhận những phần quà hấp dẫn từ nhà phát hành
      </p>

      {code ? (
        <div className="text-center space-y-2">
          <p className="text-green-400 text-sm font-medium">Mã giftcode của bạn:</p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wide break-all px-2">{code}</p>
          <p className="text-gray-500 text-xs">Hãy nhập mã trong game sớm nhất — mỗi IP chỉ nhận 1 mã/bài.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={openShare}
            className="w-full sm:w-auto min-w-[200px] px-6 py-2.5 rounded bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-sm transition-colors"
          >
            Chia sẻ Facebook
          </button>
          <button
            type="button"
            onClick={claim}
            disabled={!shareOpened || !data.hasCodes || claiming}
            className="w-full sm:w-auto min-w-[200px] px-6 py-2.5 rounded bg-[#e62117] hover:bg-[#c41a12] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {claiming ? 'Đang lấy mã…' : 'Nhận mã giftcode'}
          </button>
        </div>
      )}

      {err && <p className="text-center text-red-400 text-sm mt-4">{err}</p>}
      {!shareOpened && !code && data.hasCodes && (
        <p className="text-center text-gray-600 text-xs mt-3">Bấm Share trước, sau đó bấm &quot;Nhận mã giftcode&quot;.</p>
      )}
    </div>
  );
}
