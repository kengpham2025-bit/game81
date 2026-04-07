import Link from 'next/link';
import Image from 'next/image';

type SeoSettings = {
  facebookUrl?: string;
  supportEmail?: string;
};

type ExploreLink = { label: string; href: string };
type GiftCodeItem = {
  _id: string;
  gameId: { name: string; slug: string; avatar?: string | null };
  count: number;
  updatedAt?: Date | string;
};
type AdItem = { _id: string; imageUrl: string; linkUrl?: string; alt?: string };

export default function Sidebar({
  exploreLinks = [],
  giftcodes,
  bannerUrl,
  bannerAlt,
  sidebarBanner,
  homeLayout = false,
  extraSidebarAds = [],
  seoSettings,
}: {
  exploreLinks?: ExploreLink[];
  giftcodes: GiftCodeItem[];
  bannerUrl?: string;
  bannerAlt?: string;
  sidebarBanner?: AdItem | null;
  footerBanners?: AdItem[];
  /** Layout sidebar trang chủ: GIFTCODE, XEM TIẾP, banner */
  homeLayout?: boolean;
  extraSidebarAds?: AdItem[];
  seoSettings?: SeoSettings;
}) {
  const showBanner = sidebarBanner?.imageUrl ?? bannerUrl;

  if (homeLayout) {
    return (
      <aside className="space-y-5">
        <div className="border border-neutral-800/80 bg-neutral-950/80 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="font-nav bg-red-600 text-white font-bold text-base uppercase tracking-[0.12em] px-4 py-3.5">Giftcode</div>
          <ul className="divide-y divide-neutral-800">
            {giftcodes.map((g) => {
              const game = typeof g.gameId === 'object' ? g.gameId : null;
              const dateStr = g.updatedAt
                ? new Date(g.updatedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <li key={g._id}>
                  <Link href={`/giftcode/${game?.slug || ''}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-900 transition">
                    <span className="w-10 h-10 rounded overflow-hidden bg-neutral-800 shrink-0 ring-1 ring-neutral-700">
                      {game?.avatar ? (
                        <Image src={game.avatar} alt={game.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">?</div>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-base font-semibold block truncate">{game?.name || 'Game'}</span>
                      {dateStr && <span className="text-neutral-500 text-sm">{dateStr}</span>}
                    </div>
                    <span className="text-red-500 font-black text-lg shrink-0 tabular-nums">{g.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/giftcode"
            className="font-nav block w-full text-center py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-base uppercase tracking-[0.12em] transition"
          >
            Xem tiếp
          </Link>
        </div>

        {/* Facebook Support & Email */}
        {(seoSettings?.facebookUrl || seoSettings?.supportEmail) && (
          <div className="border border-neutral-800/80 bg-neutral-950/80 rounded-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="font-nav bg-blue-600 text-white font-bold text-base uppercase tracking-[0.12em] px-4 py-3.5">
              Hỗ trợ
            </div>
            <div className="p-3 space-y-3">
              {seoSettings?.facebookUrl && (
                <a
                  href={seoSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-3 p-3 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                  </svg>
                  <span className="text-white text-base font-semibold">Hỗ trợ qua Facebook</span>
                </a>
              )}
              {seoSettings?.supportEmail && (
                <a
                  href={`mailto:${seoSettings.supportEmail}`}
                  className="flex items-center gap-3 p-3 bg-green-600/10 hover:bg-green-600/20 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-white text-base font-semibold break-all">{seoSettings.supportEmail}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Ô quảng cáo placeholder + banner */}
        {[0, 1, 2].map((i) => {
          const ad = extraSidebarAds[i];
          if (ad?.imageUrl) {
            return (
              <div key={ad._id || i} className="relative w-full aspect-[4/3] max-h-48 bg-neutral-900 border border-neutral-800 overflow-hidden">
                {ad.linkUrl ? (
                  <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block relative w-full h-full">
                    <Image src={ad.imageUrl} alt={ad.alt || 'Quảng cáo'} fill className="object-contain" sizes="300px" />
                  </Link>
                ) : (
                  <Image src={ad.imageUrl} alt={ad.alt || 'Quảng cáo'} fill className="object-contain" sizes="300px" />
                )}
              </div>
            );
          }
          return (
            <div
              key={`ph-${i}`}
              className="font-nav w-full min-h-[100px] aspect-[3/1] sm:aspect-[4/3] bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-700 text-xs uppercase tracking-[0.2em]"
            >
              Quảng cáo
            </div>
          );
        })}

        {showBanner && (
          <div className="relative w-full aspect-[3/5] max-h-[420px] bg-neutral-900 border border-neutral-800 overflow-hidden">
            {sidebarBanner?.linkUrl ? (
              <Link href={sidebarBanner.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block relative w-full h-full min-h-[280px]">
                <Image src={sidebarBanner.imageUrl} alt={sidebarBanner.alt || 'Banner'} fill className="object-cover" sizes="300px" />
              </Link>
            ) : (
              <Image src={sidebarBanner?.imageUrl || bannerUrl!} alt={sidebarBanner?.alt || bannerAlt || 'Banner'} fill className="object-cover" sizes="300px" />
            )}
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      {exploreLinks.length > 0 && (
        <div className="bg-neutral-950 border border-neutral-800 p-4">
          <h3 className="font-nav text-sm font-bold text-red-600 mb-3 uppercase tracking-[0.1em]">Khám phá thêm</h3>
          <ul className="space-y-2">
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-2 text-neutral-300 hover:text-red-500 text-sm">
                  <span className="text-red-600">›</span> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="bg-neutral-950 border border-neutral-800 overflow-hidden">
        <div className="font-nav bg-red-600 text-white font-bold text-sm uppercase tracking-[0.12em] px-3 py-2">Giftcode</div>
        <ul className="p-2 space-y-1">
          {giftcodes.map((g) => (
            <li key={g._id}>
              <Link href={`/giftcode/${typeof g.gameId === 'object' ? g.gameId.slug : ''}`} className="flex items-center gap-2 text-neutral-300 hover:text-red-500 p-1 rounded">
                <span className="w-8 h-8 rounded overflow-hidden bg-neutral-800 shrink-0">
                  {typeof g.gameId === 'object' && g.gameId.avatar ? (
                    <Image src={g.gameId.avatar} alt={g.gameId.name} width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">?</div>
                  )}
                </span>
                <span className="flex-1 truncate text-sm">{typeof g.gameId === 'object' ? g.gameId.name : ''}</span>
                <span className="text-red-500 font-bold text-sm">{g.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {showBanner && (
        <div className="rounded overflow-hidden relative w-full aspect-[3/4] max-h-96 bg-neutral-900 border border-neutral-800">
          {sidebarBanner?.linkUrl ? (
            <Link href={sidebarBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full">
              <Image src={sidebarBanner.imageUrl} alt={sidebarBanner.alt || 'Banner'} fill className="object-cover" />
            </Link>
          ) : (
            <Image src={sidebarBanner?.imageUrl || bannerUrl!} alt={sidebarBanner?.alt || bannerAlt || 'Banner'} fill className="object-cover" />
          )}
        </div>
      )}
    </aside>
  );
}
