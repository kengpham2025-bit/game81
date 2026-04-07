import Link from 'next/link';
import Image from 'next/image';

export type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  categorySlug?: string;
  publishedAt?: string;
};

function catLabel(slug?: string) {
  if (!slug) return 'Tin tức';
  const m: Record<string, string> = {
    'game-mobile': 'Game Mobile',
    'game-online': 'Game Online',
    esports: 'Esports',
    'pc-console': 'PC/Console',
    'cong-nghe': 'Công nghệ',
    'phim-anh': 'Phim ảnh',
    'game-nft': 'Game NFT',
    'thu-vien-game': 'Thư viện game',
    cosplay: 'Cosplay',
    video: 'Video',
  };
  return m[slug] || slug.replace(/-/g, ' ');
}

export default function Hero({ main, side }: { main: ArticleItem | null; side: ArticleItem[] }) {
  const topRight = side[0];
  const sq1 = side[1];
  const sq2 = side[2];

  return (
    <section className="max-w-[min(100%,1420px)] mx-auto px-3 sm:px-4 lg:px-5 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch">
        <div className="lg:col-span-2">
          {main && (
            <Link href={`/tin-tuc/${main.slug}`} className="block group h-full">
              <div className="relative h-[220px] sm:h-[280px] lg:h-full lg:min-h-[320px] bg-neutral-900 overflow-hidden rounded-xl">
                {main.thumbnail ? (
                  <Image
                    src={main.thumbnail}
                    alt={main.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition duration-500"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-600">Không có ảnh</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <span className="font-nav inline-block px-2.5 py-1 bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-[0.12em] mb-2">
                    {catLabel(main.categorySlug)}
                  </span>
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white line-clamp-2 leading-[1.15] drop-shadow-lg">
                    {main.title}
                  </h2>
                  {main.publishedAt && (
                    <p className="text-neutral-300 text-sm sm:text-base mt-2 font-medium">{new Date(main.publishedAt).toLocaleDateString('vi-VN')}</p>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:min-h-[320px]">
          {topRight && (
            <Link href={`/tin-tuc/${topRight.slug}`} className="block group shrink-0">
              <div className="relative h-[140px] sm:h-[150px] lg:flex-1 lg:min-h-[140px] lg:max-h-[48%] bg-neutral-900 overflow-hidden rounded-xl">
                {topRight.thumbnail ? (
                  <Image
                    src={topRight.thumbnail}
                    alt={topRight.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition duration-500"
                    sizes="33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">Không ảnh</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <span className="font-nav text-xs text-red-500 font-bold uppercase tracking-wider">
                    {catLabel(topRight.categorySlug)}
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 group-hover:text-red-500 leading-snug">{topRight.title}</h3>
                </div>
              </div>
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-[120px] lg:min-h-0">
            {[sq1, sq2].map(
              (a) =>
                a && (
                  <Link key={a._id} href={`/tin-tuc/${a.slug}`} className="block group relative min-h-[120px] lg:min-h-0 bg-neutral-900 overflow-hidden rounded-xl">
                    {a.thumbnail ? (
                      <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition duration-500" sizes="20vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-[10px]">—</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-red-500 leading-snug">{a.title}</h3>
                    </div>
                  </Link>
                )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
