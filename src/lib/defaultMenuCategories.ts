/**
 * Danh sách chuyên mục = menu ngang trang chủ (TRANG CHỦ + các mục dưới).
 * Dùng cho seed và nút "Đồng bộ menu" trong admin.
 */
export const DEFAULT_MENU_CATEGORIES = [
  { name: 'Trang chủ', slug: 'trang-chu', order: 0, showInNav: false },
  { name: 'GAME MOBILE', slug: 'game-mobile', order: 1, showInNav: true, navLabel: 'GAME MOBILE' },
  { name: 'GAME ONLINE', slug: 'game-online', order: 2, showInNav: true, navLabel: 'GAME ONLINE' },
  {
    name: 'Liên Minh Huyền Thoại',
    slug: 'lien-minh-huyen-thoai',
    order: 3,
    showInNav: true,
    navLabel: 'LIÊN MINH HUYỀN THOẠI',
  },
  { name: 'Truy Kích PC', slug: 'truy-kich-pc', order: 4, showInNav: true, navLabel: 'TRUY KÍCH PC' },
  { name: 'ESPORTS', slug: 'esports', order: 5, showInNav: true, navLabel: 'ESPORTS' },
  { name: 'PC/CONSOLE', slug: 'pc-console', order: 6, showInNav: true, navLabel: 'PC/CONSOLE' },
  { name: 'CÔNG NGHỆ', slug: 'cong-nghe', order: 7, showInNav: true, navLabel: 'CÔNG NGHỆ' },
  { name: 'GIFTCODE', slug: 'giftcode', order: 8, showInNav: true, navLabel: 'GIFTCODE', customPath: '/giftcode' },
  { name: 'PHIM ẢNH', slug: 'phim-anh', order: 9, showInNav: true, navLabel: 'PHIM ẢNH' },
  { name: 'GAME NFT', slug: 'game-nft', order: 10, showInNav: true, navLabel: 'GAME NFT' },
  { name: 'THƯ VIỆN GAME', slug: 'thu-vien-game', order: 11, showInNav: true, navLabel: 'THƯ VIỆN GAME' },
  { name: 'COSPLAY', slug: 'cosplay', order: 12, showInNav: true, navLabel: 'COSPLAY' },
  { name: 'VIDEO', slug: 'video', order: 13, showInNav: true, navLabel: 'VIDEO' },
] as const;
