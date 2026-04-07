import Link from 'next/link';
import Image from 'next/image';
import { gameDB } from '@/lib/db';

export default async function ArticlePageSidebar({ facebookUrl }: { facebookUrl: string }) {
  const games = await gameDB.findMany();

  return (
    <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
      <div className="game8-card overflow-hidden shadow-lg shadow-black/30">
        <div
          className="px-3 py-2.5 font-nav text-[13px] font-extrabold uppercase tracking-[0.14em] text-white"
          style={{ backgroundColor: 'var(--g8-red)' }}
        >
          Game mới cho bạn
        </div>
        <ul className="divide-y divide-[#252525]">
          {games.length === 0 ? (
            <li className="p-4 text-sm text-[#888] text-center">Đang cập nhật danh sách game…</li>
          ) : (
            games.map((g) => (
              <li key={g.id.toString()} className="flex gap-3 p-3 hover:bg-[#1a1a1a] transition-colors">
                <Link
                  href={`/giftcode/${g.slug}`}
                  className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-[#222] ring-2 ring-[#333]"
                >
                  {g.avatar ? (
                    <Image src={g.avatar} alt={g.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-600">?</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/giftcode/${g.slug}`} className="font-semibold text-white text-[15px] leading-snug hover:text-[#e62117] block truncate">
                    {g.name}
                  </Link>
                  {g.category && <p className="text-xs text-[#888] mt-0.5 truncate">{g.category}</p>}
                  <Link
                    href={`/giftcode/${g.slug}`}
                    className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white rounded"
                    style={{ backgroundColor: 'var(--g8-red)' }}
                  >
                    Trang chủ
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {facebookUrl ? (
        <div className="game8-card p-4 shadow-lg shadow-black/30">
          <p className="font-nav text-[11px] font-extrabold text-white uppercase tracking-[0.2em] text-center mb-3 pb-3 border-b border-[#252525]">
            Follow us on Facebook
          </p>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm text-white bg-[#1877f2] hover:bg-[#166fe5] transition-colors"
          >
            Theo dõi Fanpage
          </a>
          <p className="text-[11px] text-[#666] text-center mt-3">Cập nhật tin & sự kiện mỗi ngày</p>
        </div>
      ) : null}
    </aside>
  );
}
