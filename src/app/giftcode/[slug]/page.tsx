import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { gameDB, giftCodeDB } from '@/lib/db';
import { IconArrowLeft } from '@/components/icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBannersByPositions } from '@/lib/ads';
import GiftcodeCodeList from '@/components/GiftcodeCodeList';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await gameDB.findUnique({ where: { slug } });
  if (!game) return { title: 'Giftcode' };
  return {
    title: `Giftcode ${game.name}`,
    description: `Mã quà tặng ${game.name} mới nhất tại GAMEVIET.IO.VN.`,
    openGraph: { url: `${SITE_URL}/giftcode/${slug}` },
    alternates: { canonical: `${SITE_URL}/giftcode/${slug}` },
  };
}

export default async function GiftcodeSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await gameDB.findUnique({ where: { slug } });
  if (!game) notFound();

  const [giftcode, ads] = await Promise.all([
    giftCodeDB.findFirst({ where: { gameId: game!.id } }),
    getBannersByPositions(['footer_banner']),
  ]);

  const codes: string[] = JSON.parse(giftcode?.codes || '[]');
  const count = codes.length > 0 ? codes.length : (giftcode?.count ?? 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/giftcode" className="text-gray-400 hover:text-[#e11d48] text-sm mb-4 inline-flex items-center gap-1.5">
            <IconArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Tất cả Giftcode
          </Link>
          <div className="flex items-center gap-4 p-6 rounded-xl bg-[#1a1a1a] border border-[#333]">
            {game.avatar ? (
              <Image src={game.avatar} alt={game.name} width={80} height={80} className="rounded-xl" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-[#222] flex items-center justify-center text-2xl text-gray-500">?</div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{game.name}</h1>
              <p className="text-[#e11d48] font-bold">{count} mã quà tặng</p>
            </div>
          </div>
          <GiftcodeCodeList codes={codes} />
        </div>
      </main>
      <Footer ads={ads.footer_banner} />
    </>
  );
}
