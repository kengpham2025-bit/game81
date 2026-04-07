import Link from 'next/link';
import Image from 'next/image';

type Game = { _id: string; name: string; slug: string; avatar?: string };

export default function TopGames({
  topWeek,
  topMonth,
}: {
  topWeek: Game[];
  topMonth: Game[];
}) {
  return (
    <section className="max-w-[min(100%,1420px)] mx-auto px-3 sm:px-4 lg:px-5 space-y-2 pb-2">
      {topWeek.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/50">
          <div className="font-nav bg-amber-400 text-black font-bold text-sm sm:text-base uppercase tracking-[0.1em] px-4 py-2.5 sm:py-0 sm:flex sm:items-center shrink-0 whitespace-nowrap">
            TOP game TUẦN
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-neutral-950 px-3 py-2 flex-1">
            {topWeek.map((g) => (
              <Link
                key={g._id}
                href={`/game/${g.slug}`}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden bg-neutral-800 ring-1 ring-neutral-700 hover:ring-red-600 shrink-0"
                title={g.name}
              >
                {g.avatar ? (
                  <Image src={g.avatar} alt={g.name} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-[10px]">?</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {topMonth.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/50">
          <div className="font-nav bg-red-600 text-white font-bold text-sm sm:text-base uppercase tracking-[0.1em] px-4 py-2.5 sm:py-0 sm:flex sm:items-center shrink-0 whitespace-nowrap">
            TOP GAME THÁNG
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-neutral-950 px-3 py-2 flex-1">
            {topMonth.map((g) => (
              <Link
                key={g._id}
                href={`/game/${g.slug}`}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden bg-neutral-800 ring-1 ring-neutral-700 hover:ring-red-600 shrink-0"
                title={g.name}
              >
                {g.avatar ? (
                  <Image src={g.avatar} alt={g.name} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-[10px]">?</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
