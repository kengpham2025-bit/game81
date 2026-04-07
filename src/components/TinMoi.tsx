import Link from 'next/link';
import Image from 'next/image';

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  categorySlug?: string;
};

function catVi(slug?: string) {
  if (!slug) return 'Tin tức';
  const m: Record<string, string> = {
    'game-mobile': 'Game mobile',
    'game-online': 'Game online',
    esports: 'Esports',
    'pc-console': 'PC/Console',
    'cong-nghe': 'Công nghệ',
    'phim-anh': 'Phim ảnh',
    'game-nft': 'Game NFT',
    'thu-vien-game': 'Thư viện game',
    cosplay: 'Cosplay',
    video: 'Video',
  };
  return m[slug] || slug;
}

export default function TinMoi({
  featured,
  list,
  categoryName,
}: {
  featured: ArticleItem | null;
  list: ArticleItem[];
  categoryName?: string;
}) {
  return (
    <section>
      <h2 className="font-nav text-red-500 font-bold text-base sm:text-lg uppercase tracking-[0.12em] mb-5 pl-4 py-2 border-l-4 border-red-500 rounded-r-sm bg-gradient-to-r from-red-500/5 to-transparent">
        Tin mới{categoryName ? ` · ${categoryName}` : ''}
      </h2>

      {featured && (
        <Link href={`/tin-tuc/${featured.slug}`} className="block mb-6 group">
          <div className="relative w-full aspect-[21/9] min-h-[200px] sm:min-h-[240px] max-h-[320px] bg-neutral-900 overflow-hidden rounded-xl">
            {featured.thumbnail ? (
              <Image src={featured.thumbnail} alt={featured.title} fill className="object-cover group-hover:scale-[1.01] transition duration-500" sizes="100vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-600">Không có ảnh</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <span className="font-nav inline-block px-2.5 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
                {catVi(featured.categorySlug)}
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white line-clamp-2 leading-tight">{featured.title}</h3>
              <p className="text-neutral-300 text-sm sm:text-base mt-3">
                {featured.author && <span>{featured.author}</span>}
                {featured.publishedAt && (
                  <span>
                    {featured.author ? ' · ' : ''}
                    {new Date(featured.publishedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Link>
      )}

      <div className="divide-y divide-neutral-800/80">
        {list.map((a) => (
          <Link key={a._id} href={`/tin-tuc/${a.slug}`} className="flex gap-3 sm:gap-4 py-4 group">
            <div className="relative w-[120px] sm:w-[160px] h-[80px] sm:h-[100px] shrink-0 rounded-lg overflow-hidden bg-neutral-900">
              {a.thumbnail ? (
                <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">—</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 group-hover:text-red-500 leading-snug">{a.title}</h3>
              <p className="text-sm sm:text-base mt-2 text-neutral-400">
                {a.author && <span>{a.author}</span>}
                <span className="text-red-500 font-medium"> · {catVi(a.categorySlug)}</span>
                {a.publishedAt && (
                  <span className="text-neutral-500"> · {new Date(a.publishedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </p>
              {a.excerpt && <p className="text-neutral-400 text-sm sm:text-base mt-2 line-clamp-2 hidden sm:block leading-relaxed">{a.excerpt}</p>}
              <span className="inline-block mt-2 px-2 py-1 bg-blue-900/80 text-sky-300 text-xs font-bold rounded-sm">{catVi(a.categorySlug)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
