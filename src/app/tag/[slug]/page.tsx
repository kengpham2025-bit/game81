import Link from 'next/link';
import Image from 'next/image';
import { IconGift } from '@/components/icons';
import { articleDB, giftCodeDB } from '@/lib/db';
import Header from '@/components/Header';
import TinMoi from '@/components/TinMoi';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { getBannersByPositions } from '@/lib/ads';

/** Luôn lấy danh sách bài theo tag mới nhất mỗi request */
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';
const EXPLORE_LINKS = [
  { label: 'Màn hình gaming', href: '/tag/man-hinh-gaming' },
  { label: 'Game trực tuyến', href: '/category/game-online' },
  { label: 'Tai nghe gaming', href: '/tag/tai-nghe-gaming' },
];

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

type GiftCodeItem = {
  _id: string;
  gameId: { name: string; slug: string; avatar?: string | null };
  count: number;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  return {
    title: `Tag: ${decoded} - Tin tức Game`,
    description: `Tin tức game theo tag "${decoded}" mới nhất tại GAMEVIET.IO.VN`,
    openGraph: { url: `${SITE_URL}/tag/${slug}` },
    alternates: { canonical: `${SITE_URL}/tag/${slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  const [articles, codes, ads] = await Promise.all([
    articleDB.findMany({
      where: { status: 'published' },
      take: 15,
    }),
    giftCodeDB.findMany({
      include: { game: true },
      take: 10,
    }),
    getBannersByPositions(['sidebar', 'footer_banner']),
  ]);

  const filtered = articles.filter((a) => a.tags?.includes(tag));
  const rawFeatured = filtered[0];
  const rawList = filtered.slice(1, 12);
  const featured: ArticleItem | null = rawFeatured
    ? { _id: rawFeatured.id, title: rawFeatured.title, slug: rawFeatured.slug, thumbnail: rawFeatured.thumbnail ?? undefined, excerpt: rawFeatured.excerpt ?? undefined, author: rawFeatured.author ?? undefined, publishedAt: rawFeatured.publishedAt ?? undefined, categorySlug: rawFeatured.categorySlug ?? undefined }
    : null;
  const list: ArticleItem[] = rawList.map((a) => ({ _id: a.id, title: a.title, slug: a.slug, thumbnail: a.thumbnail ?? undefined, excerpt: a.excerpt ?? undefined, author: a.author ?? undefined, publishedAt: a.publishedAt ?? undefined, categorySlug: a.categorySlug ?? undefined }));
  const giftcodes: GiftCodeItem[] = codes.map((c) => ({ _id: c.id, gameId: c.game as { name: string; slug: string; avatar?: string | null }, count: c.count }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          <div className="lg:col-span-2">
            <TinMoi featured={featured} list={list} categoryName={`Tag: ${tag}`} />
          </div>
          <div className="lg:col-span-1">
            <Sidebar
              exploreLinks={EXPLORE_LINKS}
              giftcodes={giftcodes}
              sidebarBanner={ads.sidebar[0]}
              footerBanners={ads.footer_banner}
            />
          </div>
        </div>
      </main>
      <Footer ads={ads.footer_banner} />
    </>
  );
}
