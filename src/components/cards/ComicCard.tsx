import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Bookmark } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';

interface ComicCardProps {
  slug: string;
  title: string;
  image: string;
  type?: string;
  rating?: string;
  latestChapter?: string;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  slug,
  title,
  image,
  type = 'Manga',
  rating,
  latestChapter,
}) => {
  const [imageError, setImageError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(slug);

  const cleanTitle = title.replace(/^Komik\s*/i, '').trim();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      id: slug,
      title: cleanTitle,
      poster: image,
      slug,
      score: rating,
      type: 'comic',
    });
  };

  const typeColor =
    type?.toLowerCase() === 'manhwa'
      ? 'border-cyan-500/60 text-cyan-400 bg-cyan-950/80'
      : type?.toLowerCase() === 'manhua'
      ? 'border-amber-500/60 text-amber-400 bg-amber-950/80'
      : 'border-red-500/60 text-red-400 bg-red-950/80';

  return (
    <div className="group relative flex flex-col transition-all duration-300">
      <Link
        to={`/comic/${slug}`}
        className="relative block aspect-[3/4.2] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80 group-hover:border-red-600/60 group-hover:shadow-[0_0_25px_rgba(220,38,38,0.25)] transition-all duration-300"
      >
        <img
          src={
            imageError || !image
              ? 'https://picsum.photos/seed/' + encodeURIComponent(slug) + '/400/600'
              : image
          }
          alt={cleanTitle}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Hover Read Indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Top Indicators */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          {type && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border backdrop-blur-sm ${typeColor}`}
            >
              {type}
            </span>
          )}

          <button
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark comic'}
            className={`ml-auto p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${
              bookmarked
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)]'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom latest chapter */}
        {latestChapter && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] text-zinc-300">
            <span className="font-mono bg-zinc-950/85 px-2 py-0.5 rounded border border-zinc-800/60 backdrop-blur-sm text-cyan-300">
              {latestChapter}
            </span>
          </div>
        )}
      </Link>

      <div className="mt-2.5 flex flex-col gap-1">
        <Link
          to={`/comic/${slug}`}
          className="text-sm font-medium text-zinc-100 hover:text-red-400 transition-colors line-clamp-1"
          title={cleanTitle}
        >
          {cleanTitle}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          {rating && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{rating}</span>
            </div>
          )}
          {rating && latestChapter && <span aria-hidden="true">·</span>}
          {latestChapter && <span>Latest {latestChapter}</span>}
        </div>
      </div>
    </div>
  );
};
