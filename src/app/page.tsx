import { articleDB, categoryDB, gameDB, giftCodeDB } from '@/lib/db';
import Hero from '@/components/Hero';

/** Luôn lấy dữ liệu mới từ DB mỗi request — không cache tĩnh khi build */
export const dynamic = 'force-dynamic';

import TopGames from '@/components/TopGames';
import TinHot from '@/components/TinHot';
import TinMoi from '@/components/TinMoi';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeaderBanner } from '@/components/BannerAd';
import { getBannersByPositions } from '@/lib/ads';
import { getSeoSettings } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

type ArticleItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  categorySlug?: string;
  tags?: string[];
};

type Game = { _id: string; name: string; slug: string; avatar?: string };

type AdBanner = { _id: string; imageUrl: string; linkUrl?: string; alt?: string };

type GiftCodeItem = {
  _id: string;
  gameId: { name: string; slug: string; avatar?: string | null };
  count: number;
};

async function getData() {
  let featured: ArticleItem | null = null;
  let featuredSide: ArticleItem[] = [];
  let hot: ArticleItem | null = null;
  let latest: ArticleItem[] = [];
  let topWeek: Game[] = [];
  let topMonth: Game[] = [];
  let giftcodes: GiftCodeItem[] = [];
  let ads: { header_banner: AdBanner[]; sidebar: AdBanner[]; footer_banner: AdBanner[]; footer_block: AdBanner[] } = { header_banner: [], sidebar: [], footer_banner: [], footer_block: [] };
  let hotGridExtra: ArticleItem[] = [];
  let seoSettings: unknown = null;

  try {
    const [feat, featSide, hotArt, latestArt, week, month, codes, adsResult, extra, seo] = await Promise.all([
      articleDB.findFirst({ where: { status: 'published', isFeatured: true } }),
      articleDB.findMany({ where: { status: 'published' }, take: 8 }),
      articleDB.findFirst({ where: { status: 'published', isHot: true } }),
      articleDB.findMany({ where: { status: 'published' }, take: 12 }),
      gameDB.findMany({ where: { isTopWeek: true }, take: 12 }),
      gameDB.findMany({ where: { isTopMonth: true }, take: 12 }),
      giftCodeDB.findMany({ include: { game: true }, take: 10 }),
      getBannersByPositions(['header_banner', 'sidebar', 'footer_banner', 'footer_block']),
      articleDB.findMany({ where: { status: 'published' }, take: 20 }),
      getSeoSettings(),
    ]);

    featured = feat
      ? {
          _id: feat.id,
          title: feat.title,
          slug: feat.slug,
          thumbnail: feat.thumbnail ?? undefined,
          excerpt: feat.excerpt ?? undefined,
          author: feat.author ?? undefined,
          publishedAt: feat.publishedAt ?? '',
          categorySlug: feat.categorySlug ?? undefined,
          tags: feat.tags ?? undefined,
        }
      : null;

    featuredSide = featSide.map((a) => ({
      _id: a.id,
      title: a.title,
      slug: a.slug,
      thumbnail: a.thumbnail ?? undefined,
      excerpt: a.excerpt ?? undefined,
      author: a.author ?? undefined,
      publishedAt: a.publishedAt ?? '',
      categorySlug: a.categorySlug ?? undefined,
      tags: a.tags ?? undefined,
    }));

    hot = hotArt
      ? {
          _id: hotArt.id,
          title: hotArt.title,
          slug: hotArt.slug,
          thumbnail: hotArt.thumbnail ?? undefined,
          excerpt: hotArt.excerpt ?? undefined,
          author: hotArt.author ?? undefined,
          publishedAt: hotArt.publishedAt ?? '',
          categorySlug: hotArt.categorySlug ?? undefined,
          tags: hotArt.tags ?? undefined,
        }
      : null;

    latest = latestArt.map((a) => ({
      _id: a.id,
      title: a.title,
      slug: a.slug,
      thumbnail: a.thumbnail ?? undefined,
      excerpt: a.excerpt ?? undefined,
      author: a.author ?? undefined,
      publishedAt: a.publishedAt ?? '',
      categorySlug: a.categorySlug ?? undefined,
      tags: a.tags ?? undefined,
    }));

    topWeek = week.map((g) => ({ _id: g.id, name: g.name, slug: g.slug, avatar: g.avatar ?? undefined }));
    topMonth = month.map((g) => ({ _id: g.id, name: g.name, slug: g.slug, avatar: g.avatar ?? undefined }));

    giftcodes = codes.map((c) => ({ _id: c.id, gameId: c.game as { name: string; slug: string; avatar?: string | null }, count: c.count, updatedAt: c.updatedAt ?? undefined }));

    ads = adsResult;
    hotGridExtra = extra.map((a) => ({
      _id: a.id,
      title: a.title,
      slug: a.slug,
      thumbnail: a.thumbnail ?? undefined,
      excerpt: a.excerpt ?? undefined,
      author: a.author ?? undefined,
      publishedAt: a.publishedAt ?? '',
      categorySlug: a.categorySlug ?? undefined,
      tags: a.tags ?? undefined,
    }));
    seoSettings = seo;
  } catch (e) {
    console.error('getData error', e);
  }

  const allTags = (hot?.tags || []).slice(0, 8);
  const mainHero = featured || featuredSide[0] || null;
  const mainSlug = (mainHero as ArticleItem | null)?.slug || '';
  const heroSide = featuredSide.filter((a) => a.slug !== mainSlug).slice(0, 3);

  const hotSlug = hot?.slug ? [hot.slug] : [];
  const hotGridArticles = hotGridExtra
    .filter((a) => !hotSlug.includes(a.slug))
    .filter((a) => a.slug !== mainSlug)
    .slice(0, 3);

  const tinMoiFeatured = latest[0] || null;
  const tinMoiList = latest.slice(1, 9);
  const sidebarSlots = ads.sidebar.slice(1, 4);

  return {
    mainHero,
    heroSide,
    hot,
    hotGridArticles,
    tinMoiFeatured,
    tinMoiList,
    allTags,
    topWeek,
    topMonth,
    giftcodes,
    ads,
    sidebarSlots,
    seoSettings,
  };
}

export const metadata = {
  title: 'GAMEVIET.IO.VN - Tin tức Game, Esports, Công nghệ',
  description: 'Cập nhật tin tức game mobile, game online, esports, công nghệ, giftcode mới nhất.',
  openGraph: {
    title: 'GAMEVIET.IO.VN - Tin tức Game, Esports, Công nghệ',
    description: 'Cập nhật tin tức game, esports, công nghệ, giftcode mới nhất.',
    url: SITE_URL,
    siteName: 'GAMEVIET.IO.VN',
    type: 'website',
  },
  alternates: { canonical: SITE_URL },
};

export default async function Home() {
  const data = await getData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GAMEVIET.IO.VN',
    url: SITE_URL,
    description: 'Tin tức Game, Esports, Công nghệ',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <HeaderBanner ad={data.ads.header_banner[0] ?? null} />
      <main className="home-page-type min-h-screen bg-black text-neutral-100 antialiased">
        <Hero main={data.mainHero} side={data.heroSide} />
        <TopGames topWeek={data.topWeek} topMonth={data.topMonth} />
        <div className="max-w-[min(100%,1420px)] mx-auto px-3 sm:px-4 lg:px-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 py-8">
          <div className="lg:col-span-2 min-w-0">
            <TinHot article={data.hot} tags={data.allTags} gridArticles={data.hotGridArticles} />
            <TinMoi featured={data.tinMoiFeatured} list={data.tinMoiList} />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <Sidebar
              giftcodes={data.giftcodes}
              sidebarBanner={data.ads.sidebar[0]}
              homeLayout
              extraSidebarAds={data.sidebarSlots}
              seoSettings={data.seoSettings ?? undefined}
            />
          </div>
        </div>
      </main>
      <Footer ads={data.ads.footer_banner} />
    </>
  );
}
