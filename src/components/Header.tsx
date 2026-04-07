import { categoryDB } from '@/lib/db';
import HeaderClient, { type NavItem } from './HeaderClient';

/** Thêm vào menu chính nếu DB chưa có (LMHT, Truy Kích). */
const EXTRA_MAIN_NAV: NavItem[] = [
  { label: 'LIÊN MINH HUYỀN THOẠI', href: '/category/lien-minh-huyen-thoai' },
  { label: 'TRUY KÍCH PC', href: '/category/truy-kich-pc' },
];

function mergeMainNav(items: NavItem[]): NavItem[] {
  const hrefs = new Set(items.map((i) => i.href));
  const missing = EXTRA_MAIN_NAV.filter((e) => !hrefs.has(e.href));
  if (missing.length === 0) return items;
  const idx = items.findIndex((i) => i.href === '/category/game-online');
  const at = idx >= 0 ? idx + 1 : Math.min(3, items.length);
  return [...items.slice(0, at), ...missing, ...items.slice(at)];
}

/** Menu mặc định khi chưa có chuyên mục trong DB */
const FALLBACK_NAV: NavItem[] = [
  { label: 'TRANG CHỦ', href: '/' },
  { label: 'GAME MOBILE', href: '/category/game-mobile' },
  { label: 'GAME ONLINE', href: '/category/game-online' },
  { label: 'LIÊN MINH HUYỀN THOẠI', href: '/category/lien-minh-huyen-thoai' },
  { label: 'TRUY KÍCH PC', href: '/category/truy-kich-pc' },
  { label: 'ESPORTS', href: '/category/esports' },
  { label: 'PC/CONSOLE', href: '/category/pc-console' },
  { label: 'CÔNG NGHỆ', href: '/category/cong-nghe' },
  { label: 'GIFTCODE', href: '/giftcode' },
  { label: 'PHIM ẢNH', href: '/category/phim-anh' },
  { label: 'GAME NFT', href: '/category/game-nft' },
  { label: 'THƯ VIỆN GAME', href: '/category/thu-vien-game' },
  { label: 'COSPLAY', href: '/category/cosplay' },
  { label: 'VIDEO', href: '/category/video' },
];

export default async function Header() {
  let navItems: NavItem[] = FALLBACK_NAV;
  try {
    const cats = await categoryDB.findMany();
    if (cats.length > 0) {
      const forMenu = cats.filter((c) => c.slug !== 'trang-chu' && c.showInNav);
      if (forMenu.length > 0) {
        navItems = [
          { label: 'TRANG CHỦ', href: '/' },
          ...forMenu.map((c) => {
            const path = (c.customPath || '').trim();
            const href = path || `/category/${c.slug}`;
            const label = (c.navLabel || c.name).toUpperCase();
            return { label, href };
          }),
        ];
        navItems = mergeMainNav(navItems);
      }
    }
  } catch {
    /* giữ FALLBACK_NAV */
  }
  return <HeaderClient navItems={navItems} />;
}
