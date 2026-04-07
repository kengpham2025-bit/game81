import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { seoSettingsDB } from '@/lib/db';
import { clearSeoSettingsCache } from '@/lib/seo';
import { resolveJsonLdExtra } from '@/lib/defaultJsonLdExtra';

export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const doc = await seoSettingsDB.findFirst();
    return NextResponse.json({
      ...doc,
      jsonLdExtra: resolveJsonLdExtra(doc?.jsonLdExtra),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: 'Không được phép' }, { status: 401 });

    const body = await request.json();

    const doc = await seoSettingsDB.upsert({
      where: {},
      create: {
        siteName: body.siteName ?? 'GAMEVIET.IO.VN',
        siteTitle: body.siteTitle ?? '',
        siteDescription: body.siteDescription ?? '',
        siteKeywords: body.siteKeywords ?? '',
        ogImage: body.ogImage ?? '',
        ogType: body.ogType ?? 'website',
        twitterCard: body.twitterCard ?? 'summary_large_image',
        twitterSite: body.twitterSite ?? '',
        canonicalBase: body.canonicalBase ?? '',
        robotsIndex: body.robotsIndex !== false,
        robotsFollow: body.robotsFollow !== false,
        locale: body.locale ?? 'vi_VN',
        jsonLdExtra: body.jsonLdExtra ?? '',
        googleAnalyticsId: body.googleAnalyticsId ?? '',
        facebookUrl: body.facebookUrl ?? '',
        supportEmail: body.supportEmail ?? '',
        spamEmail: body.spamEmail ?? '',
      },
      update: {
        siteName: body.siteName ?? 'GAMEVIET.IO.VN',
        siteTitle: body.siteTitle ?? '',
        siteDescription: body.siteDescription ?? '',
        siteKeywords: body.siteKeywords ?? '',
        ogImage: body.ogImage ?? '',
        ogType: body.ogType ?? 'website',
        twitterCard: body.twitterCard ?? 'summary_large_image',
        twitterSite: body.twitterSite ?? '',
        canonicalBase: body.canonicalBase ?? '',
        robotsIndex: body.robotsIndex !== false,
        robotsFollow: body.robotsFollow !== false,
        locale: body.locale ?? 'vi_VN',
        jsonLdExtra: body.jsonLdExtra ?? '',
        googleAnalyticsId: body.googleAnalyticsId ?? '',
        facebookUrl: body.facebookUrl ?? '',
        supportEmail: body.supportEmail ?? '',
        spamEmail: body.spamEmail ?? '',
      },
    });
    clearSeoSettingsCache();
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
  }
}
