import Link from 'next/link';
import Image from 'next/image';

type AdItem = { _id: string; imageUrl: string; linkUrl?: string; alt?: string };

export function HeaderBanner({ ad }: { ad: AdItem | null }) {
  if (!ad?.imageUrl) return null;
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-3">
      <div className="relative w-full aspect-[6/1] max-h-28 rounded-lg overflow-hidden bg-[#1a1a1a]">
        {ad.linkUrl ? (
          <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block relative w-full h-full">
            <Image src={ad.imageUrl} alt={ad.alt || 'Banner quảng cáo'} fill className="object-contain" sizes="100vw" />
          </Link>
        ) : (
          <Image src={ad.imageUrl} alt={ad.alt || 'Banner quảng cáo'} fill className="object-contain" sizes="100vw" />
        )}
      </div>
    </div>
  );
}
