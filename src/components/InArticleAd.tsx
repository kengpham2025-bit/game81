import Link from 'next/link';
import Image from 'next/image';
import { AdItem } from '@/lib/ads';

type Props = {
  ad: AdItem | null;
};

function formatAdDate(iso?: string | Date) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** Quảng cáo chữ: badge Ads + dòng text, click mở link */
function TextAdBlock({ ad }: { ad: AdItem }) {
  const href = ad.linkUrl || '#';
  const dateStr = formatAdDate(ad.createdAt);

  const inner = (
    <div className="my-8 w-full max-w-3xl mx-auto rounded-lg border border-neutral-800 bg-neutral-950/90 px-4 py-3.5 hover:border-neutral-600 transition-colors">
      <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
        <span className="shrink-0 rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
          Ads
        </span>
        <span className="text-yellow-400 font-bold uppercase tracking-wide text-sm sm:text-[15px] leading-snug">
          {ad.adText}
        </span>
      </div>
      {(ad.sponsorLabel || dateStr) && (
        <p className="mt-2 text-xs">
          {ad.sponsorLabel ? (
            <span className="text-red-700 dark:text-red-600 font-semibold">{ad.sponsorLabel}</span>
          ) : null}
          {ad.sponsorLabel && dateStr ? <span className="text-neutral-500 mx-1.5">·</span> : null}
          {dateStr ? <span className="text-neutral-400">{dateStr}</span> : null}
        </p>
      )}
    </div>
  );

  if (!ad.linkUrl) return inner;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/60 rounded-lg"
    >
      {inner}
    </Link>
  );
}

export function InArticleAd({ ad }: Props) {
  if (!ad) return null;

  const text = (ad.adText || '').trim();
  const hasImage = !!(ad.imageUrl || '').trim();

  if (text && ad.linkUrl) {
    return <TextAdBlock ad={{ ...ad, adText: text }} />;
  }

  if (!hasImage) return null;

  const content = (
    <div className="my-8 w-full max-w-3xl mx-auto">
      <div className="relative w-full aspect-[650/150] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
        <Image
          src={ad.imageUrl}
          alt={ad.alt || 'Quảng cáo'}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      {ad.linkUrl && (
        <p className="text-center text-xs text-neutral-500 mt-2">Quảng cáo</p>
      )}
    </div>
  );

  if (ad.linkUrl) {
    return (
      <Link
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
