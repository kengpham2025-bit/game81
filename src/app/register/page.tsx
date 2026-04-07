import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Đăng ký',
  description: 'Đăng ký thành viên GAMEVIET.IO.VN',
};

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-[#0a0a0a] text-gray-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#141414] border border-neutral-800 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Đăng ký thành viên</h1>
          <p className="text-neutral-400 text-sm mb-8">
            Tính năng đăng ký đọc giả đang được hoàn thiện. Hiện bạn có thể đọc tin miễn phí toàn bộ nội dung trên site.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-[#e11d48] text-white font-semibold rounded-lg hover:bg-[#be123c] transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
      <Footer ads={[]} />
    </>
  );
}
