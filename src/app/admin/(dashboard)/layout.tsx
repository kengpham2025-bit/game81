import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import Link from 'next/link';
import AdminLogout from '@/components/AdminLogout';
import AdminToastWrapper from './AdminToastWrapper';
import {
  IconBolt,
  IconChart,
  IconArticle,
  IconFolder,
  IconGamepad,
  IconGift,
  IconMegaphone,
  IconSettings,
  IconEye,
  IconKey,
  IconMail,
  IconChevronDown,
} from '@/components/icons';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const navClass =
    'flex items-center gap-2.5 px-3 py-2.5 rounded hover:bg-[#1a1a1a] text-gray-300 hover:text-[#e11d48] transition-colors';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 flex admin-panel text-[0.95rem] sm:text-base leading-relaxed">
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#222] p-4 flex flex-col">
        <Link href="/admin" className="text-2xl font-bold text-[#e11d48] mb-6 flex items-center gap-2">
          <IconBolt className="w-7 h-7 shrink-0 text-[#e11d48]" aria-hidden />
          GAMEVIET Admin
        </Link>
        <nav className="space-y-1 flex-1">
          <Link href="/admin" className={navClass}>
            <IconChart className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Dashboard
          </Link>
          <Link href="/admin/articles" className={navClass}>
            <IconArticle className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Bài viết
          </Link>
          <Link href="/admin/categories" className={navClass}>
            <IconFolder className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Chuyên mục
          </Link>
          <Link href="/admin/games" className={navClass}>
            <IconGamepad className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Game
          </Link>
          <Link href="/admin/giftcodes" className={navClass}>
            <IconGift className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Giftcode
          </Link>
          <Link href="/admin/ads" className={navClass}>
            <IconMegaphone className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Quảng cáo
          </Link>
          <details className="group rounded-lg">
            <summary
              className={`${navClass} cursor-pointer list-none flex items-center gap-2.5 [&::-webkit-details-marker]:hidden`}
            >
              <IconMail className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
              Thư
              <IconChevronDown className="w-4 h-4 shrink-0 text-gray-600 ml-auto transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-0.5 ml-2 pl-3 border-l border-[#333] space-y-0.5 py-1">
              <Link
                href="/admin/mail/compose"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-[#e11d48]"
              >
                Tạo email
              </Link>
              <Link
                href="/admin/mail/inbox"
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-400 hover:bg-[#1a1a1a] hover:text-[#e11d48]"
              >
                Hộp thư / Spam
              </Link>
            </div>
          </details>
          <Link href="/admin/settings" className={navClass}>
            <IconSettings className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Cấu hình SEO
          </Link>
          <Link href="/admin/password" className={navClass}>
            <IconKey className="w-5 h-5 shrink-0 text-gray-500" aria-hidden />
            Đổi mật khẩu
          </Link>
        </nav>
        <div className="pt-4 border-t border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[0.9rem] text-gray-500 truncate">{user.email}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#1a1a1a] text-gray-400 rounded hover:bg-[#222]">
              <IconEye className="w-4 h-4 shrink-0" aria-hidden />
              Xem site
            </Link>
            <AdminLogout />
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-8 overflow-auto bg-[#0f0f0f] [&_table]:text-[0.95rem] [&_input]:text-base [&_textarea]:text-base [&_select]:text-base [&_label]:text-[0.95rem]">
        <AdminToastWrapper>{children}</AdminToastWrapper>
      </main>
    </div>
  );
}
