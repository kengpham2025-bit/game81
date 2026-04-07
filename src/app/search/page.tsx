import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from './SearchResults';

export const metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm kiếm tin tức game tại GAMEVIET.IO.VN',
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-gray-100 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Tìm kiếm</h1>
        {q && <p className="text-gray-400 mb-6">Kết quả tìm kiếm cho: <span className="text-[#e11d48]">"{q}"</span></p>}
        <Suspense fallback={<p className="text-gray-500">Đang tải...</p>}>
          <SearchResults query={q || ''} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
