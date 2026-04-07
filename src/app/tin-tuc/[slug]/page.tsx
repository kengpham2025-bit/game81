import { notFound } from 'next/navigation';
import { articleDB, categoryDB } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { IconCalendar, IconUser } from '@/components/icons';
import Image from 'next/image';
import ArticleShareBar from '@/components/ArticleShareBar';
import ArticleGiftcodeWidget from '@/components/ArticleGiftcodeWidget';
import ArticlePageSidebar from '@/components/ArticlePageSidebar';
import { getSeoSettings } from '@/lib/seo';
import { toAbsoluteUrl } from '@/lib/absoluteUrl';
import { getArticleAds } from '@/lib/ads';
import { ArticleContentWithAds } from '@/components/ArticleContentWithAds';

/** Luôn render theo request — bài viết mới hiển thị ngay, không cần redeploy */
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await articleDB.findFirst({ where: { slug, status: 'published' } });
  if (!article) return { title: 'Không tìm thấy' };
  const title = article.metaTitle || article.title;
  const rawDesc = article.metaDescription || article.excerpt || article.title || '';
  const desc = rawDesc.slice(0, 160) || title;
  const thumbRaw = article.thumbnail || '';
  const ogImage = thumbRaw ? toAbsoluteUrl(SITE_URL, thumbRaw) : '';
  const pageUrl = `${SITE_URL.replace(/\/$/, '')}/tin-tuc/${slug}`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: pageUrl,
      siteName: 'GAMEVIET.IO.VN',
      locale: 'vi_VN',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
      type: 'article',
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: ogImage ? [ogImage] : [],
    },
    alternates: { canonical: pageUrl },
  };
}

function BreadcrumbHome() {
  return (
    <svg className="w-4 h-4 text-[#888] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, seo] = await Promise.all([
    articleDB.findFirst({ where: { slug, status: 'published' } }),
    getSeoSettings(),
  ]);
  if (!article) notFound();

  const catSlug = article.categorySlug ?? undefined;
  let categoryName = catSlug?.replace(/-/g, ' ') || '';
  if (catSlug) {
    const cat = await categoryDB.findUnique({ where: { slug: catSlug } });
    if (cat?.name) categoryName = cat.name;
  }

  const articleAds = await getArticleAds(catSlug);
  const facebookUrl = seo.facebookUrl?.trim() || '';
  const shareUrl = `${SITE_URL}/tin-tuc/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.thumbnail ? [article.thumbnail] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: { '@type': 'Person', name: article.author || 'GAMEVIET.IO.VN' },
    publisher: { '@type': 'Organization', name: 'GAMEVIET.IO.VN', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
  };

  const isHot = article.isHot === true;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="game8-article-wrap min-h-screen text-neutral-100 pb-14">
        <div className="max-w-[min(100%,1560px)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px] gap-8 xl:gap-10 2xl:gap-12">
            {/* Cột chính */}
            <div className="min-w-0">
              <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#888] mb-5 font-medium">
                <BreadcrumbHome />
                <Link href="/" className="hover:text-[#e62117] transition-colors">
                  Trang chủ
                </Link>
                <span className="text-[#444]">/</span>
                {catSlug ? (
                  <>
                    <Link href={`/category/${catSlug}`} className="hover:text-[#e62117] max-w-[160px] truncate">
                      {categoryName}
                    </Link>
                    <span className="text-[#444]">/</span>
                  </>
                ) : null}
                <span className="text-[#aaa] truncate max-w-[min(100%,280px)]">{article.title}</span>
              </nav>

              <section className="game8-card p-5 sm:p-7 mb-6 shadow-xl shadow-black/40">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    {catSlug && (
                      <p className="text-[12px] text-[#888] mb-2">
                        <span className="text-[#666]">Danh mục:</span>{' '}
                        <Link href={`/category/${catSlug}`} className="text-[#e62117] font-semibold hover:underline">
                          {categoryName}
                        </Link>
                      </p>
                    )}
                    <h1 className="text-[1.5rem] sm:text-[1.85rem] md:text-[2rem] font-bold text-white leading-tight tracking-tight">
                      {article.title}
                    </h1>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[13px] text-[#999]">
                      {article.author && (
                        <span className="inline-flex items-center gap-1.5">
                          <IconUser className="w-4 h-4 text-[#e62117] shrink-0" aria-hidden />
                          <span className="text-white font-medium">{article.author}</span>
                        </span>
                      )}
                      {article.publishedAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <IconCalendar className="w-4 h-4 text-[#666] shrink-0" aria-hidden />
                          {new Date(article.publishedAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  {isHot && (
                    <div className="flex flex-col items-center shrink-0 sm:pr-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Tin nóng</span>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="text-[#e62117] text-lg leading-none">
                            ★
                          </span>
                        ))}
                      </div>
                      <div
                        className="w-12 h-12 flex items-center justify-center text-xl font-black text-white rounded"
                        style={{ backgroundColor: '#e62117' }}
                      >
                        HOT
                      </div>
                    </div>
                  )}
                </div>

                <ArticleShareBar
                  url={shareUrl}
                  fanpageUrl={facebookUrl || undefined}
                  shareTitle={article.title || undefined}
                />
              </section>

              {article.thumbnail && (
                <div className="relative w-full aspect-video max-h-[380px] sm:max-h-[440px] lg:max-h-[500px] xl:max-h-[540px] 2xl:max-h-[580px] rounded-md overflow-hidden mb-7 bg-[#111] border border-[#252525]">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, (max-width: 1560px) calc(100vw - 380px), 1180px"
                  />
                </div>
              )}

              {article.excerpt?.trim() && (
                <div className="mb-8">
                  <h2 className="font-nav text-sm font-extrabold uppercase tracking-[0.12em] text-white mb-3 pb-2 border-b border-[#252525]">
                    Giới thiệu
                  </h2>
                  <p className="text-[1rem] sm:text-[1.0625rem] text-[#ccc] leading-relaxed font-normal border-l-[3px] border-[#e62117] pl-4 py-1">
                    {article.excerpt}
                  </p>
                </div>
              )}

              <ArticleGiftcodeWidget articleSlug={slug} shareUrl={shareUrl} />

              <ArticleContentWithAds content={article.content || ''} ads={articleAds} />

              {article.tags?.length > 0 && (
                <div className="mt-10 pt-8 border-t border-[#252525]">
                  <h2 className="font-nav text-xs font-extrabold uppercase tracking-[0.15em] text-[#e62117] mb-4">
                    Từ khóa
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/tag/${encodeURIComponent(t)}`}
                        className="px-3 py-1.5 bg-[#1a1a1a] text-[#bbb] text-sm rounded border border-[#333] hover:border-[#e62117] hover:text-white transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={catSlug ? `/category/${catSlug}` : '/'}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#e62117' }}
                >
                  ← Chuyên mục
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-[#ccc] rounded border border-[#444] hover:bg-[#1a1a1a]"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>

            <ArticlePageSidebar facebookUrl={facebookUrl} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
