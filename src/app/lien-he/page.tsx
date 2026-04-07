import Link from 'next/link';
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';
import LienHeForm from './LienHeForm';

const Header = dynamic(() => import('@/components/Header'), { ssr: true });

export default function LienHePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-neutral-100">
        <div className="max-w-xl mx-auto px-4 py-10">
          <Link href="/" className="text-red-500 hover:underline text-sm mb-6 inline-block">
            ← Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Liên hệ</h1>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Gửi tin nhắn tới ban biên tập. Nội dung sẽ hiển thị trong admin mục <strong className="text-neutral-300">Thư → Hộp thư / Spam</strong>.
          </p>
          <LienHeForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
