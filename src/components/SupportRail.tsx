'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SupportState = {
  facebookUrl: string;
  supportEmail: string;
};

export default function SupportRail() {
  const pathname = usePathname();
  const [s, setS] = useState<SupportState | null>(null);

  useEffect(() => {
    fetch('/api/seo-settings')
      .then((r) => r.json())
      .then((data) => {
        setS({
          facebookUrl: typeof data.facebookUrl === 'string' ? data.facebookUrl.trim() : '',
          supportEmail: typeof data.supportEmail === 'string' ? data.supportEmail.trim() : '',
        });
      })
      .catch(() => setS({ facebookUrl: '', supportEmail: '' }));
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const fb = s?.facebookUrl;
  const em = s?.supportEmail;
  const railClass =
    'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-l-xl text-white shadow-lg shadow-black/40 transition border';

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-2 pr-2 sm:pr-3 pointer-events-auto"
      aria-label="Liên hệ hỗ trợ"
    >
      {fb ? (
        <a
          href={fb}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title="Hỗ trợ qua Facebook"
          className={`${railClass} bg-[#1877f2] hover:bg-[#166fe5] border-blue-500/30`}
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
          </svg>
        </a>
      ) : null}
      {em ? (
        <a
          href={`mailto:${em}`}
          title={`Email: ${em}`}
          className={`${railClass} bg-[#16a34a] hover:bg-[#15803d] border-green-500/30`}
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </a>
      ) : null}
      <Link
        href="/lien-he"
        title="Gửi tin nhắn tới ban biên tập"
        className={`${railClass} bg-[#e11d48] hover:bg-[#be123c] border-rose-500/30`}
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Link>
    </div>
  );
}
