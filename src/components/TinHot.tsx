import Link from 'next/link';
import Image from 'next/image';

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  categorySlug?: string;
};

function catName(slug?: string) {
  if (!slug) return 'Tin game';
  return slug.replace(/-/g, ' ');
}

export default function TinHot({
  article,
  tags,
  gridArticles,
}: {
  article: ArticleItem | null;
  tags: string[];
  gridArticles: ArticleItem[];
}) {
  if (!article) return null;

  const grid = gridArticles.filter((a) => a._id !== article._id).slice(0, 3);

  return (
    <section className="mb-8">
      <h2 className="font-nav text-red-500 font-bold text-base sm:text-lg uppercase tracking-[0.12em] mb-5 pl-4 py-2 border-l-4 border-red-500 rounded-r-sm bg-gradient-to-r from-red-500/5 to-transparent">
        Tin hot
      </h2>

      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4 sm:p-5 mb-4 shadow-lg shadow-black/20">
        <Link href={`/tin-tuc/${article.slug}`} className="flex flex-col md:flex-row gap-4 group">
          <div className="relative w-full md:w-[45%] shrink-0 aspect-video md:aspect-[16/10] bg-neutral-900 overflow-hidden rounded-lg">
            {article.thumbnail ? (
              <Image src={article.thumbnail} alt={article.title} fill className="object-cover group-hover:scale-[1.02] transition" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-600">Không có ảnh</div>
            )}
            <span className="font-nav absolute top-2 left-2 px-2.5 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
              Tin hot
            </span>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-white group-hover:text-red-500 line-clamp-3 leading-snug">
              {article.title}
            </h3>
            {article.excerpt && <p className="text-neutral-400 text-base sm:text-lg mt-3 line-clamp-3 leading-relaxed">{article.excerpt}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/category/game-online"
                className="inline-flex items-center px-4 py-2.5 bg-sky-700 hover:bg-sky-600 text-white text-sm font-bold rounded-sm transition"
              >
                Trò chơi trên trình duyệt
              </Link>
            </div>
          </div>
        </Link>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => (
            <Link
              key={t}
              href={`/tag/${encodeURIComponent(t)}`}
              className="px-3 py-2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-full hover:bg-red-600 hover:border-red-600 hover:text-white transition"
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {grid.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {grid.map((a) => (
            <Link key={a._id} href={`/tin-tuc/${a.slug}`} className="block group bg-neutral-950/80 border border-neutral-800/80 rounded-xl overflow-hidden hover:border-red-900/50 transition-all duration-200">
              <div className="relative aspect-video bg-neutral-900 overflow-hidden rounded-t-xl">
                {a.thumbnail ? (
                  <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">—</div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-bold text-white text-base sm:text-lg line-clamp-2 group-hover:text-red-500 leading-snug">{a.title}</h4>
                <p className="text-neutral-500 text-sm mt-2">
                  {a.author && <span className="text-red-500">{a.author}</span>}
                  {a.publishedAt && (
                    <span>
                      {a.author ? ' · ' : ''}
                      {new Date(a.publishedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
