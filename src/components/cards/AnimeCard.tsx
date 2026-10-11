import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Play, Zap } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useCyberSound } from '../../hooks/useCyberSound';
import { CountdownTimer } from '../ui/CountdownTimer';
import { QuickStreamModal } from '../modals/QuickStreamModal';
import { formatWatchHref } from '../../utils/urlHelpers';

interface AnimeCardProps {
  id: string; // animeId or slug
  title: string;
  poster: string;
  episodes?: string | number;
  score?: string;
  releaseDay?: string;
  status?: string;
  href?: string;
  latestReleaseDate?: string;
  type?: 'anime' | 'donghua';
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  id,
  title,
  poster,
  episodes,
  score,
  releaseDay,
  status,
  href,
  latestReleaseDate,
  type = 'anime',
}) => {
  const [imageError, setImageError] = useState(false);
  const [quickStreamOpen, setQuickStreamOpen] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playBlip } = useCyberSound();
  const bookmarked = isBookmarked(id);

  // Determine target link
  const targetLink =
    type === 'donghua'
      ? `/donghua/${id}`
      : href?.includes('/episode/')
      ? formatWatchHref(href)
      : `/anime/${id}`;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playBlip('switch');
    toggleBookmark({
      id,
      title,
      poster,
      slug: id,
      score,
      status,
      type,
    });
  };

  const handleQuickStream = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playBlip('click');
    setQuickStreamOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col transition-all duration-300">
        {/* Poster Image Container */}
        <Link
          to={targetLink}
          onClick={() => playBlip('click')}
          className="relative block aspect-[3/4.2] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80 group-hover:border-red-600/60 group-hover:shadow-[0_0_25px_rgba(220,38,38,0.3)] transition-all duration-300"
        >
          <img
            src={
              imageError || !poster
                ? 'https://picsum.photos/seed/' + encodeURIComponent(id) + '/400/600'
                : poster
            }
            alt={title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Ambient overlay vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Cyberpunk Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>

          {/* Top Indicators & Quick Actions */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto gap-1">
            {score ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950/85 border border-zinc-800 text-[11px] font-mono text-amber-300 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{score}</span>
              </div>
            ) : type === 'donghua' ? (
              <div className="px-2 py-0.5 rounded bg-cyan-950/85 border border-cyan-800/70 text-[10px] font-mono uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
                Donghua
              </div>
            ) : null}

            <div className="flex items-center gap-1 ml-auto">
              {/* Quick Stream Preview Button */}
              <button
                onClick={handleQuickStream}
                title="Quick Stream Preview"
                aria-label="Quick Stream"
                className="p-1.5 rounded-lg bg-zinc-950/85 hover:bg-amber-950 text-amber-400 border border-zinc-800 hover:border-amber-700/60 transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400/40" />
              </button>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmarkClick}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark anime'}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                  bookmarked
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)]'
                    : 'bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Metadata on poster */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-zinc-300 gap-2">
            {episodes && (
              <span className="font-mono bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800/60 backdrop-blur-sm text-cyan-400">
                {typeof episodes === 'number' ? `Ep ${episodes}` : episodes}
              </span>
            )}
            {releaseDay && <CountdownTimer releaseDay={releaseDay} />}
          </div>
        </Link>

        {/* Info beneath poster */}
        <div className="mt-2.5 flex flex-col gap-1">
          <Link
            to={targetLink}
            onClick={() => playBlip('click')}
            className="text-sm font-medium text-zinc-100 hover:text-red-400 transition-colors line-clamp-1"
            title={title}
          >
            {title}
          </Link>

          {/* Clean unboxed metadata with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            {status && <span>{status}</span>}
            {status && (latestReleaseDate || releaseDay) && <span aria-hidden="true">·</span>}
            {latestReleaseDate && <span>{latestReleaseDate}</span>}
          </div>
        </div>
      </div>

      {/* Quick Stream Floating Modal */}
      {quickStreamOpen && (
        <QuickStreamModal
          animeId={id}
          animeTitle={title}
          onClose={() => setQuickStreamOpen(false)}
        />
      )}
    </>
  );
};
