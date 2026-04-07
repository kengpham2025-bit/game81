import { articleDB, categoryDB, gameDB, giftCodeDB, adDB } from '@/lib/db';
import {
  IconArticle,
  IconFolder,
  IconGamepad,
  IconGift,
  IconMegaphone,
  IconBolt,
  IconLink,
  IconGlobe,
  IconSettings,
  IconFileText,
  IconRobot,
  IconPlus,
} from '@/components/icons';

export default async function AdminDashboard() {
  const [articleCount, categoryCount, gameCount, giftcodeCount, adCount] = await Promise.all([
    articleDB.count(),
    categoryDB.count(),
    gameDB.count(),
    giftCodeDB.count(),
    adDB.count(),
  ]);

  const cardIcon = 'w-10 h-10 mb-2 text-[#e11d48]';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Chào mừng đến với trang quản trị GAMEVIET.IO.VN</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <a href="/admin/articles" className="block p-5 bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl hover:from-[#222] hover:to-[#2a2a2a] transition-all border border-[#333]">
          <IconArticle className={cardIcon} aria-hidden />
          <p className="text-3xl font-bold text-[#e11d48]">{articleCount}</p>
          <p className="text-gray-400 text-sm">Bài viết</p>
        </a>
        <a href="/admin/categories" className="block p-5 bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl hover:from-[#222] hover:to-[#2a2a2a] transition-all border border-[#333]">
          <IconFolder className={cardIcon} aria-hidden />
          <p className="text-3xl font-bold text-[#e11d48]">{categoryCount}</p>
          <p className="text-gray-400 text-sm">Chuyên mục</p>
        </a>
        <a href="/admin/games" className="block p-5 bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl hover:from-[#222] hover:to-[#2a2a2a] transition-all border border-[#333]">
          <IconGamepad className={cardIcon} aria-hidden />
          <p className="text-3xl font-bold text-[#e11d48]">{gameCount}</p>
          <p className="text-gray-400 text-sm">Game</p>
        </a>
        <a href="/admin/giftcodes" className="block p-5 bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl hover:from-[#222] hover:to-[#2a2a2a] transition-all border border-[#333]">
          <IconGift className={cardIcon} aria-hidden />
          <p className="text-3xl font-bold text-[#e11d48]">{giftcodeCount}</p>
          <p className="text-gray-400 text-sm">Giftcode</p>
        </a>
        <a href="/admin/ads" className="block p-5 bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-xl hover:from-[#222] hover:to-[#2a2a2a] transition-all border border-[#333]">
          <IconMegaphone className={cardIcon} aria-hidden />
          <p className="text-3xl font-bold text-[#e11d48]">{adCount}</p>
          <p className="text-gray-400 text-sm">Quang cao</p>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconBolt className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Thao tac nhanh
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/articles/new" className="flex items-center justify-center gap-2 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] text-gray-300 text-sm transition-colors">
              <IconPlus className="w-4 h-4 shrink-0 text-[#e11d48]" aria-hidden />
              Bài viết mới
            </a>
            <a href="/admin/games/new" className="flex items-center justify-center gap-2 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] text-gray-300 text-sm transition-colors">
              <IconPlus className="w-4 h-4 shrink-0 text-[#e11d48]" aria-hidden />
              Them Game
            </a>
            <a href="/admin/giftcodes" className="flex items-center justify-center gap-2 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] text-gray-300 text-sm transition-colors">
              <IconPlus className="w-4 h-4 shrink-0 text-[#e11d48]" aria-hidden />
              Them Giftcode
            </a>
            <a href="/admin/ads/new" className="flex items-center justify-center gap-2 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] text-gray-300 text-sm transition-colors">
              <IconPlus className="w-4 h-4 shrink-0 text-[#e11d48]" aria-hidden />
              Them Quang cao
            </a>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <IconLink className="w-5 h-5 text-[#e11d48] shrink-0" aria-hidden />
            Link nhanh
          </h2>
          <div className="space-y-2">
            <a href="/" className="flex items-center gap-2 p-2 text-gray-400 hover:text-[#e11d48] rounded hover:bg-[#222] transition-colors">
              <IconGlobe className="w-5 h-5 shrink-0" aria-hidden />
              Xem website
            </a>
            <a href="/admin/settings" className="flex items-center gap-2 p-2 text-gray-400 hover:text-[#e11d48] rounded hover:bg-[#222] transition-colors">
              <IconSettings className="w-5 h-5 shrink-0" aria-hidden />
              Cau hinh SEO
            </a>
            <a href="/sitemap.xml" className="flex items-center gap-2 p-2 text-gray-400 hover:text-[#e11d48] rounded hover:bg-[#222] transition-colors">
              <IconFileText className="w-5 h-5 shrink-0" aria-hidden />
              Sitemap
            </a>
            <a href="/robots.txt" className="flex items-center gap-2 p-2 text-gray-400 hover:text-[#e11d48] rounded hover:bg-[#222] transition-colors">
              <IconRobot className="w-5 h-5 shrink-0" aria-hidden />
              Robots.txt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
