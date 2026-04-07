import type { Metadata } from "next";
import { Be_Vietnam_Pro, Roboto_Condensed, Inter } from "next/font/google";
import { getSeoSettings } from "@/lib/seo";
import { resolveJsonLdExtra, applyBaseUrlToJsonLd } from "@/lib/defaultJsonLdExtra";
import SupportRail from "@/components/SupportRail";
import "./globals.css";

/** Đọc nội dung, tiêu đề bài — dấu tiếng Việt chuẩn */
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  adjustFontFallback: true,
});

/** Menu ngang — condensed đậm giống game8 (Roboto Condensed Bold) */
const robotoCondensedNav = Roboto_Condensed({
  variable: "--font-nav",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["700"],
  display: "swap",
  adjustFontFallback: true,
});

/** UI bài viết / trang chi tiết — gần chuẩn site tin game (Inter/Roboto) */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gameviet.io.vn";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSeoSettings();
  const siteName = s.siteName || "GAMEVIET.IO.VN";
  const base = s.canonicalBase || SITE_URL;
  return {
    metadataBase: new URL(base),
    title: {
      default: s?.siteTitle || "GAMEVIET.IO.VN - Tin tức Game, Esports, Công nghệ",
      template: `%s | ${siteName}`,
    },
    description: s?.siteDescription || "Cập nhật tin tức game mobile, game online, esports, công nghệ, giftcode mới nhất. Đọc tin hot và bài viết chuyên sâu tại GAMEVIET.IO.VN",
    keywords: s?.siteKeywords || "game, tin tức game, esports, giftcode, game mobile, game online, liên minh huyền thoại, valorant, pubg, công nghệ",
    authors: [{ name: "GAMEVIET.IO.VN" }],
    creator: "GAMEVIET.IO.VN",
    publisher: "GAMEVIET.IO.VN",
    openGraph: {
      type: (s?.ogType as "website") || "website",
      locale: s?.locale || "vi_VN",
      siteName,
      url: base,
      images: s?.ogImage ? [{ url: s.ogImage, width: 1200, height: 630, alt: siteName }] : [],
    },
    twitter: {
      card: (s?.twitterCard as "summary_large_image") || "summary_large_image",
      site: s?.twitterSite || "@gamevietio",
      creator: s?.twitterSite || "@gamevietio",
    },
    robots: {
      index: s?.robotsIndex !== false,
      follow: s?.robotsFollow !== false,
      googleBot: {
        index: s?.robotsIndex !== false,
        follow: s?.robotsFollow !== false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google-site-verification-code",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = await getSeoSettings();
  const base = s.canonicalBase || SITE_URL;
  const ldRaw = applyBaseUrlToJsonLd(resolveJsonLdExtra(s?.jsonLdExtra), base);
  let ldJson: string | null = null;
  try {
    JSON.parse(ldRaw);
    ldJson = ldRaw;
  } catch {
    /* bỏ qua JSON-LD không hợp lệ */
  }

  // Ưu tiên: DB → env var → ''
  const gaId = s?.googleAnalyticsId || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${robotoCondensedNav.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Analytics — đặt trong head để Google dễ phát hiện thẻ */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="font-sans antialiased bg-[#0a0a0a] text-gray-100 min-h-screen">
        {ldJson && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: ldJson }}
          />
        )}
        {children}
        <SupportRail />
      </body>
    </html>
  );
}
