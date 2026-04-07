/** Khớp layout thực tế (BannerAd, Sidebar, Footer, In-Article) — dùng cho admin */

export type AdBannerPositionValue =
  | 'header_banner'
  | 'sidebar'
  | 'footer_banner'
  | 'footer_block'
  | 'in_article';

export type AdBannerSpec = {
  value: AdBannerPositionValue;
  label: string;
  /** Kích thước khuyến nghị upload */
  sizeRecommended: string;
  /** Giải thích ngắn */
  hint: string;
  /** Có hỗ trợ chọn chuyên mục */
  supportsCategories?: boolean;
};

export const AD_BANNER_SPECS: AdBannerSpec[] = [
  {
    value: 'header_banner',
    label: 'Banner đầu trang',
    sizeRecommended: '1200 × 200 px',
    hint: 'Tỷ lệ 6:1 (giống khung hiển thị). Ảnh ngang, nền tối phù hợp site. Tối thiểu ~728×120 vẫn dùng được.',
  },
  {
    value: 'sidebar',
    label: 'Sidebar',
    sizeRecommended: '300 × 600 px',
    hint: 'Cột phải ~300px rộng; khung banner tối thiểu cao ~280px. Chuẩn IAB 300×600 hoặc 300×250.',
  },
  {
    value: 'footer_banner',
    label: 'Banner footer',
    sizeRecommended: '320 × 106 px (mỗi ô)',
    hint: 'Lưới tối đa 4 cột, tỷ lệ 3:1, cao tối đa ~112px/ô. Mỗi banner một ảnh; desktop ~1/4 hàng.',
  },
  {
    value: 'footer_block',
    label: 'Khối footer',
    sizeRecommended: '970 × 90 px hoặc 728 × 90 px',
    hint: 'Dải ngang full (leaderboard). Dùng khi gắn khối quảng cáo rộng; giữ tỷ lệ ngang.',
  },
  {
    value: 'in_article',
    label: 'Quảng cáo trong bài viết',
    sizeRecommended: '650 × 150 px hoặc dạng text',
    hint: 'Chèn giữa các đoạn văn. Có thể dùng ảnh banner hoặc quảng cáo chữ (badge Ads + dòng text, click mở link).',
    supportsCategories: true,
  },
];

export function getAdBannerSpec(value: string): AdBannerSpec | undefined {
  return AD_BANNER_SPECS.find((s) => s.value === value);
}
