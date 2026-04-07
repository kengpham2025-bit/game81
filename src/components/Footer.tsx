import Link from 'next/link';
import Image from 'next/image';

type AdItem = { _id: string; imageUrl: string; linkUrl?: string; alt?: string };

const FOOTER_CATEGORIES = [
  { name: 'Tin tức', slug: 'tin-tuc' },
  { name: 'Game Mobile', slug: 'game-mobile' },
  { name: 'Game Online', slug: 'game-online' },
  { name: 'Esports', slug: 'esports' },
  { name: 'PC/Console', slug: 'pc-console' },
  { name: 'Công nghệ', slug: 'cong-nghe' },
  { name: 'Giftcode', slug: 'giftcode' },
  { name: 'Phim ảnh', slug: 'phim-anh' },
  { name: 'Game NFT', slug: 'game-nft' },
  { name: 'Thư viện game', slug: 'thu-vien-game' },
  { name: 'Cosplay', slug: 'cosplay' },
  { name: 'Video', slug: 'video' },
];

export default function Footer({ ads = [] }: { ads?: AdItem[] }) {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#222] mt-auto">
      {/* Banner quảng cáo footer */}
      {ads.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ads.slice(0, 4).map((ad, index) => (
              <div key={ad._id || index} className="relative w-full aspect-[3/1] max-h-28 rounded-lg overflow-hidden bg-[#1a1a1a]">
                {ad.linkUrl ? (
                  <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block relative w-full h-full">
                    <Image src={ad.imageUrl} alt={ad.alt || 'Banner quảng cáo'} fill className="object-contain" sizes="(max-width:768px) 100vw, 25vw" />
                  </Link>
                ) : (
                  <Image src={ad.imageUrl} alt={ad.alt || 'Banner quảng cáo'} fill className="object-contain" sizes="(max-width:768px) 100vw, 25vw" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-nav text-sm font-bold text-[#e11d48] uppercase tracking-[0.12em] mb-4">Chuyên mục</h3>
            <ul className="space-y-2">
              {FOOTER_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-gray-400 hover:text-[#e11d48] text-sm transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-nav text-sm font-bold text-[#e11d48] uppercase tracking-[0.12em] mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#e11d48] transition-colors">Trang chủ</Link></li>
              <li><Link href="/giftcode" className="hover:text-[#e11d48] transition-colors">Giftcode</Link></li>
              <li><Link href="/search" className="hover:text-[#e11d48] transition-colors">Tìm kiếm</Link></li>
              <li><Link href="/lien-he" className="hover:text-[#e11d48] transition-colors">Liên hệ</Link></li>
              <li><Link href="/tin-tuc" className="hover:text-[#e11d48] transition-colors">Tin tức</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-nav text-sm font-bold text-[#e11d48] uppercase tracking-[0.12em] mb-4">Liên kết SEO</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/sitemap.xml" className="hover:text-[#e11d48] transition-colors">Sơ đồ trang</Link></li>
              <li><Link href="/category/game-mobile" className="hover:text-[#e11d48] transition-colors">Tin Game Mobile</Link></li>
              <li><Link href="/category/game-online" className="hover:text-[#e11d48] transition-colors">Tin Game Online</Link></li>
              <li><Link href="/category/esports" className="hover:text-[#e11d48] transition-colors">Tin Esports</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-nav text-sm font-bold text-[#e11d48] uppercase tracking-[0.12em] mb-4">Về GameViet</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-[#e11d48]">GAMEVIET.IO.VN</strong> — Cập nhật tin tức game, esports, công nghệ, giftcode mới nhất. Đọc tin hot và bài viết chuyên sâu.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#222] text-center text-sm text-gray-500">
          © {new Date().getFullYear()} GAMEVIET.IO.VN. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
