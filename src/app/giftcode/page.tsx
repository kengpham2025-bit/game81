import Link from 'next/link';
import Image from 'next/image';
import { IconGift } from '@/components/icons';
import { giftCodeDB } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBannersByPositions } from '@/lib/ads';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

export const metadata = {
  title: 'Giftcode - Mã quà tặng game',
  description: 'Tổng hợp giftcode game mobile, game online mới nhất. Nhận mã quà tặng miễn phí tại GAMEVIET.IO.VN.',
  openGraph: { url: `${SITE_URL}/giftcode` },
  alternates: { canonical: `${SITE_URL}/giftcode` },
};

export default async function GiftcodePage() {
  const [codes, ads] = await Promise.all([
    giftCodeDB.findMany({ include: { game: true } }),
    getBannersByPositions(['footer_banner']),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <IconGift className="w-9 h-9 text-[#e11d48] shrink-0" aria-hidden />
            Giftcode
          </h1>
          <p className="text-gray-400 text-sm mb-8">Mã quà tặng game cập nhật liên tục</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((g) => (
              <Link
                key={g.id}
                href={`/giftcode/${g.game?.slug ?? ''}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[#e11d48]/50 transition-all hover:shadow-lg hover:shadow-[#e11d48]/10"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#222] flex-shrink-0">
                  {g.game?.avatar ? (
                    <Image src={g.game.avatar} alt={g.game.name} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white block truncate">{g.game?.name ?? ''}</span>
                  <span className="text-[#e11d48] font-bold">{JSON.parse(g.codes || '[]').length || g.count} mã</span>
                </div>
              </Link>
            ))}
          </div>
          {codes.length === 0 && (
            <p className="text-gray-500 text-center py-12">Chưa có giftcode nào.</p>
          )}
        </div>
      </main>
      <Footer ads={ads.footer_banner} />
    </>
  );
}
