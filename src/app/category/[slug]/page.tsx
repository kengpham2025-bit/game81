import { notFound } from 'next/navigation';
import { articleDB, categoryDB, giftCodeDB } from '@/lib/db';
import Header from '@/components/Header';
import TinMoi from '@/components/TinMoi';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { HeaderBanner } from '@/components/BannerAd';
import { getBannersByPositions } from '@/lib/ads';

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

type GiftCodeItem = {
  _id: string;
  gameId: { name: string; slug: string; avatar?: string | null };
  count: number;
};

/** Luôn lấy danh sách bài theo chuyên mục mới nhất mỗi request */
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';
const EXPLORE_LINKS = [
  { label: 'Màn hình gaming', href: '/tag/man-hinh-gaming' },
  { label: 'Game trực tuyến', href: '/category/game-online' },
  { label: 'Tai nghe gaming', href: '/tag/tai-nghe-gaming' },
];

/** Slug có trong menu — vẫn mở được trang dù chưa seed Category trong DB */
const MENU_CATEGORY_LABELS: Record<string, string> = {
  'game-mobile': 'GAME MOBILE',
  'game-online': 'GAME ONLINE',
  esports: 'ESPORTS',
  'pc-console': 'PC/CONSOLE',
  'cong-nghe': 'CÔNG NGHỆ',
  'phim-anh': 'PHIM ẢNH',
  'game-nft': 'GAME NFT',
  'thu-vien-game': 'THƯ VIỆN GAME',
  cosplay: 'COSPLAY',
  video: 'VIDEO',
  'lien-minh-huyen-thoai': 'Liên Minh Huyền Thoại',
  'truy-kich-pc': 'Truy Kích PC',
};

function displayNameForSlug(slug: string, catName?: string | null) {
  if (catName) return catName;
  if (MENU_CATEGORY_LABELS[slug]) return MENU_CATEGORY_LABELS[slug];
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await categoryDB.findUnique({ where: { slug } });
  const name = displayNameForSlug(slug, cat?.name ?? null);
  if (!cat && !MENU_CATEGORY_LABELS[slug]) {
    const count = await articleDB.count({ where: { status: 'published', categorySlug: slug } });
    if (count === 0) return { title: 'Chuyên mục' };
  }
  return {
    title: `${name} - Tin tức Game`,
    description: `Tin tức ${name} mới nhất, cập nhật liên tục tại GAMEVIET.IO.VN`,
    openGraph: { url: `${SITE_URL}/category/${slug}` },
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cat, articles, codes, ads] = await Promise.all([
    categoryDB.findUnique({ where: { slug } }),
    articleDB.findMany({ where: { status: 'published', categorySlug: slug }, take: 15 }),
    giftCodeDB.findMany({ include: { game: true }, take: 10 }),
    getBannersByPositions(['header_banner', 'sidebar', 'footer_banner']),
  ]);
  const hasMenuSlug = Boolean(MENU_CATEGORY_LABELS[slug]);
  const hasArticles = articles.length > 0;
  if (!cat && !hasMenuSlug && !hasArticles) notFound();

  const categoryName = displayNameForSlug(slug, cat?.name ?? undefined);
  const featured: ArticleItem | null = articles[0] ? {
    _id: articles[0].id,
    title: articles[0].title,
    slug: articles[0].slug,
    thumbnail: articles[0].thumbnail || undefined,
    excerpt: articles[0].excerpt || undefined,
    author: articles[0].author || undefined,
    publishedAt: articles[0].publishedAt || '',
    categorySlug: articles[0].categorySlug || undefined,
    tags: articles[0].tags || undefined,
  } : null;
  const list: ArticleItem[] = articles.slice(1, 12).map((a) => ({
    _id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnail: a.thumbnail || undefined,
    excerpt: a.excerpt || undefined,
    author: a.author || undefined,
    publishedAt: a.publishedAt || '',
    categorySlug: a.categorySlug || undefined,
    tags: a.tags || undefined,
  }));

  const giftcodes: GiftCodeItem[] = codes.map((c) => ({
    _id: c.id,
    gameId: c.game as { name: string; slug: string; avatar?: string | null },
    count: c.count,
  }));

  return (
    <>
      <Header />
      <HeaderBanner ad={ads.header_banner[0] ?? null} />
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          <div className="lg:col-span-2">
            <TinMoi featured={featured} list={list} categoryName={categoryName} />
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
