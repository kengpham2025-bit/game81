import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập GAMEVIET.IO.VN',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-[#0a0a0a] text-gray-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#141414] border border-neutral-800 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Đăng nhập</h1>
          <p className="text-neutral-400 text-sm mb-8">
            Đăng nhập quản trị nội dung (admin) hoặc quay về trang chủ để đọc tin.
          </p>
          <Link
            href="/admin/login"
            className="inline-block w-full py-3 bg-[#e11d48] text-white font-semibold rounded-lg hover:bg-[#be123c] transition-colors mb-4"
          >
            Vào trang đăng nhập Admin
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-[#e11d48]">
            ← Về trang chủ
          </Link>
        </div>
      </main>
      <Footer ads={[]} />
    </>
  );
}
