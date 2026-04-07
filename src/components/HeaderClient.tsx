'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IconSearch, IconMenu, IconX, IconChevronDown } from '@/components/icons';
import { SITE_CONTENT_MAX } from '@/lib/siteLayout';

/** Số mục hiển thị trực tiếp trên thanh menu (số còn lại vào dropdown "Thêm") */
const VISIBLE_NAV_COUNT = 7;

const TOP_LEFT = [
  { label: 'Liên Minh Huyền Thoại', href: '/category/lien-minh-huyen-thoai' },
  { label: 'Truy Kích PC', href: '/category/truy-kich-pc' },
  { label: 'Giftcode', href: '/giftcode' },
];

const TOP_CENTER = [
  { label: 'COSPLAY', href: '/category/cosplay' },
  { label: 'VIDEO', href: '/category/video' },
];

/** Đã có ở thanh đỏ phía trên — không lặp ở menu ngang dưới */
const HREF_SKIP_MAIN_NAV = new Set([
  '/category/thu-vien-game',
  '/category/cosplay',
  '/category/video',
]);

export type NavItem = { label: string; href: string };

function LogoMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" className="font-nav flex items-baseline shrink-0 gap-0.5" onClick={onNavigate}>
      <span className="text-[1.45rem] sm:text-[1.85rem] lg:text-[2rem] font-extrabold text-white tracking-[0.04em] leading-none">GAME</span>
      <span className="text-[1.2rem] sm:text-[1.5rem] lg:text-[1.65rem] font-extrabold text-white bg-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 leading-none tracking-[0.06em]">
        VIỆT
      </span>
      <span className="text-sm sm:text-base lg:text-lg text-neutral-400 font-semibold tracking-[0.02em] ml-0.5 hidden sm:inline">.io.vn</span>
    </Link>
  );
}

const SCROLL_COMPACT_PX = 72;

export default function HeaderClient({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledCompact, setScrolledCompact] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const mainNavItems = useMemo(
    () => navItems.filter((m) => !HREF_SKIP_MAIN_NAV.has(m.href)),
    [navItems]
  );

  const visibleNavItems = useMemo(() => mainNavItems.slice(0, VISIBLE_NAV_COUNT), [mainNavItems]);
  const moreNavItems = useMemo(() => mainNavItems.slice(VISIBLE_NAV_COUNT), [mainNavItems]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
    setMoreMenuOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setMoreMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [moreMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolledCompact(window.scrollY >= SCROLL_COMPACT_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, closeMenu]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      closeMenu();
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const linkActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const mobileLinkClass = (href: string) =>
    `block py-3 px-4 text-[15px] font-nav font-bold uppercase tracking-wide border-b border-neutral-800 ${
      linkActive(href) ? 'text-red-500 bg-red-500/5' : 'text-white hover:bg-neutral-900'
    }`;

  const navLinkCompact = (href: string, label: string) => {
    const active = linkActive(href);
    return (
      <Link
        key={href + label}
        href={href}
        className={`font-nav shrink-0 px-2.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-colors ${
          active ? 'text-[#e62117]' : 'text-white hover:text-[#e62117]'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-black border-b border-neutral-800/80 relative">
      {/* Thanh menu cố định khi cuộn (desktop) — không scroll, dùng dropdown Thêm */}
      <div
        className={`hidden lg:block fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-sm border-b border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-[transform,opacity] duration-200 ease-out ${
          scrolledCompact ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        aria-hidden={!scrolledCompact}
      >
        <div className={`${SITE_CONTENT_MAX} mx-auto flex items-stretch min-h-[48px]`}>
          <Link
            href="/"
            className="font-nav flex items-center justify-center shrink-0 bg-[#e62117] px-4 sm:px-5 text-white font-bold uppercase tracking-[0.06em] text-[14px] sm:text-[15px] hover:bg-[#c41a1a] transition-colors leading-none"
          >
            GAME<span className="opacity-95">VIỆT</span>
          </Link>
          <nav className="flex-1 flex items-center gap-0 min-w-0 px-2" aria-label="Menu chính (cố định khi cuộn)">
            {visibleNavItems.map((m) => navLinkCompact(m.href, m.label))}
            {moreNavItems.length > 0 && (
              <div className="relative shrink-0" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMoreMenuOpen((o) => !o); }}
                  className={`font-nav flex items-center gap-1 px-2.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-colors ${
                    moreMenuOpen ? 'text-[#e62117]' : 'text-white hover:text-[#e62117]'
                  }`}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                >
                  Thêm <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreMenuOpen && (
                  <div className="absolute top-full left-0 mt-0.5 py-1.5 min-w-[200px] bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50">
                    {moreNavItems.map((m) => (
                      <Link
                        key={m.href + m.label}
                        href={m.href}
                        className={`block px-4 py-2.5 text-[13px] font-medium transition-colors ${
                          linkActive(m.href) ? 'text-[#e62117] bg-red-500/10' : 'text-white hover:bg-neutral-800'
                        }`}
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        {m.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
          <form onSubmit={onSearch} className="shrink-0 flex items-center gap-1.5 px-3 border-l border-neutral-800 bg-black max-w-[200px]">
            <IconSearch className="w-4 h-4 text-neutral-500 shrink-0" aria-hidden />
            <input type="search" placeholder="Tìm…" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full min-w-0 py-2 bg-transparent border-0 text-[13px] text-white placeholder:text-neutral-600 focus:outline-none font-sans" />
          </form>
        </div>
      </div>

      <div className="hidden lg:block bg-neutral-950/90 border-b border-neutral-800/60">
        <div
          className={`${SITE_CONTENT_MAX} mx-auto px-4 lg:px-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-2 min-h-[36px]`}
        >
          <div className="flex flex-wrap items-center gap-x-1 text-neutral-500 text-[12px]">
            {TOP_LEFT.map((l, i) => (
              <span key={l.href} className="inline-flex items-center gap-x-1">
                {i > 0 ? <span className="text-neutral-700 select-none">|</span> : null}
                <Link href={l.href} className="hover:text-red-500 whitespace-nowrap transition-colors">
                  {l.label}
                </Link>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-x-5 shrink-0">
            {TOP_CENTER.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-nav text-red-500 font-bold text-[12px] uppercase tracking-[0.12em] hover:text-red-400 whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={`${SITE_CONTENT_MAX} mx-auto px-3 sm:px-4 lg:px-5`}>
        {/* Mobile: fixed + z cao để không bị layer nội dung đè, nút menu luôn bấm được */}
        <div className="lg:hidden">
          <div
            className="fixed top-0 left-0 right-0 z-[120] border-b border-neutral-800 bg-black pt-[env(safe-area-inset-top,0px)]"
          >
            <div className={`${SITE_CONTENT_MAX} mx-auto flex items-center gap-2 px-3 py-3 sm:px-4`}>
              <LogoMark onNavigate={closeMenu} />
              <form onSubmit={onSearch} className="flex-1 min-w-0 flex items-center">
                <input
                  type="search"
                  placeholder="Tìm kiếm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full min-w-0 px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-md text-[15px] text-white placeholder:text-neutral-500 focus:border-red-600 focus:outline-none"
                />
              </form>
              <button
                type="button"
                className="relative z-[121] shrink-0 touch-manipulation p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md border border-neutral-700 text-white hover:bg-neutral-900 active:bg-neutral-800"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div
            className="w-full shrink-0 pointer-events-none"
            aria-hidden
            style={{ height: 'calc(env(safe-area-inset-top, 0px) + 4.25rem)' }}
          />
        </div>

        <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8 xl:gap-10 py-4 items-start">
          <div className="shrink-0 pt-1">
            <LogoMark />
          </div>

          <div className="min-w-0 flex flex-col gap-3">
            <form onSubmit={onSearch} className="w-full max-w-[400px] ml-auto flex items-center gap-2 px-2.5 py-2 bg-neutral-900/80 border border-neutral-700/80 rounded-xl focus-within:border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/30 transition-all">
              <IconSearch className="w-5 h-5 text-neutral-500 shrink-0" aria-hidden />
              <input
                type="search"
                placeholder="Nhập từ khóa tìm kiếm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-[15px] text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </form>

            <nav className="flex items-center gap-0 flex-wrap pb-1 -mx-1 px-1" aria-label="Menu chính">
              {visibleNavItems.map((m) => {
                const active = linkActive(m.href);
                return (
                  <Link
                    key={m.href + m.label}
                    href={m.href}
                    className={`font-nav shrink-0 px-3 py-2 text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.1em] whitespace-nowrap border-b-2 transition-colors duration-150 ${
                      active ? 'text-red-500 border-red-500' : 'text-white border-transparent hover:text-red-400 hover:border-neutral-600'
                    }`}
                  >
                    {m.label}
                  </Link>
                );
              })}
              {moreNavItems.length > 0 && (
                <div className="relative shrink-0" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMoreMenuOpen((o) => !o); }}
                    className={`font-nav flex items-center gap-1 px-3 py-2 text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.1em] whitespace-nowrap border-b-2 transition-colors duration-150 ${
                      moreMenuOpen ? 'text-red-500 border-red-500' : 'text-white border-transparent hover:text-red-400 hover:border-neutral-600'
                    }`}
                    aria-expanded={moreMenuOpen}
                    aria-haspopup="true"
                  >
                    Thêm <IconChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreMenuOpen && (
                    <div className="absolute top-full left-0 mt-0.5 py-1.5 min-w-[220px] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50">
                      {moreNavItems.map((m) => (
                        <Link
                          key={m.href + m.label}
                          href={m.href}
                          className={`block px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            linkActive(m.href) ? 'text-[#e62117] bg-red-500/10' : 'text-white hover:bg-neutral-800'
                          }`}
                          onClick={() => setMoreMenuOpen(false)}
                        >
                          {m.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Đóng menu" onClick={closeMenu} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,340px)] max-w-[92vw] bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
              <span className="font-nav font-extrabold text-red-500 uppercase tracking-widest text-sm">Danh mục</span>
              <button
                type="button"
                className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
                aria-label="Đóng"
                onClick={closeMenu}
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto overscroll-contain py-2">
              {mainNavItems.map((m) => (
                <Link key={m.href + m.label} href={m.href} className={mobileLinkClass(m.href)} onClick={closeMenu}>
                  {m.label}
                </Link>
              ))}
              <p className="px-4 pt-4 pb-1 text-[10px] font-nav font-bold uppercase tracking-[0.2em] text-neutral-500">Liên kết nhanh</p>
              {[...TOP_LEFT, ...TOP_CENTER].map((l) => (
                <Link key={l.href + 'm'} href={l.href} className={mobileLinkClass(l.href)} onClick={closeMenu}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
