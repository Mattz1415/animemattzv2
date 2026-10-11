import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  BookOpen,
  Bookmark,
  ChevronRight,
  ListFilter,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { comicApi } from '../api/comicApi';
import { useBookmarks } from '../hooks/useBookmarks';

function formatText(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.filter(Boolean).map(String).join('\n\n');
  if (typeof val === 'object') {
    if (Array.isArray(val.paragraphs) && val.paragraphs.length > 0) {
      return val.paragraphs.filter(Boolean).map(String).join('\n\n');
    }
    if (typeof val.text === 'string') return val.text;
    if (typeof val.description === 'string') return val.description;
  }
  return '';
}

export const ComicDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [chapterSearch, setChapterSearch] = useState('');
  const [imageError, setImageError] = useState(false);

  const { data: comic, isLoading, error } = useQuery({
    queryKey: ['comic', 'detail', slug],
    queryFn: () => comicApi.getDetail(slug || ''),
    enabled: Boolean(slug),
  });

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = slug ? isBookmarked(slug) : false;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-400">LOADING COMIC DOSSIER...</span>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-zinc-200">Comic Not Found</h2>
        <p className="text-xs text-zinc-500 font-mono">
          Unable to locate comic archive for &quot;{slug}&quot;.
        </p>
        <Link
          to="/comics"
          className="inline-block px-4 py-2 text-xs font-mono bg-red-600 text-white rounded-lg"
        >
          Return to Comics
        </Link>
      </div>
    );
  }

  const cleanTitle = comic.title.replace(/^Komik\s*/i, '').trim();
  const chapters = comic.chapters || [];
  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const firstChapterSlug =
    comic.firstChapter?.slug ||
    chapters[chapters.length - 1]?.slug ||
    chapters[0]?.slug;

  const latestChapterSlug =
    comic.latestChapter?.slug ||
    chapters[0]?.slug;

  const handleBookmark = () => {
    if (!slug) return;
    toggleBookmark({
      id: slug,
      title: cleanTitle,
      poster: comic.image,
      slug,
      score: comic.rating,
      type: 'comic',
    });
  };

  return (
    <div className="space-y-10">
      {/* Detail Hero Header */}
      <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl p-6 sm:p-10">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Cover Art */}
          <div className="w-full sm:w-56 md:w-64 aspect-[3/4.2] rounded-2xl overflow-hidden bg-zinc-900 border-2 border-red-600/40 shadow-[0_0_35px_rgba(220,38,38,0.3)] flex-shrink-0">
            <img
              src={
                imageError || !comic.image
                  ? 'https://picsum.photos/seed/' + encodeURIComponent(cleanTitle) + '/400/600'
                  : comic.image
              }
              alt={cleanTitle}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {comic.detail?.type && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-red-950 text-red-400 border border-red-800/60">
                  {comic.detail.type}
                </span>
              )}
              {comic.detail?.status && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {comic.detail.status}
                </span>
              )}
              {comic.rating && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/40">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{comic.rating}</span>
                  {comic.votes && <span className="text-zinc-500">({comic.votes})</span>}
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {cleanTitle}
            </h1>

            {comic.detail?.alternativeTitle && (
              <p className="text-xs sm:text-sm font-mono text-zinc-400">
                Alt: {comic.detail.alternativeTitle}
              </p>
            )}

            {/* Author / Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-zinc-900 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block">AUTHOR</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {comic.detail?.author || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">ILLUSTRATOR</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {comic.detail?.illustrator || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">TOTAL CHAPTERS</span>
                <span className="text-zinc-200 font-semibold">{chapters.length}</span>
              </div>
            </div>

            {/* Genres */}
            {comic.genres && comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {comic.genres.map((g, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-mono rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Chapter CTAs & Bookmark */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {firstChapterSlug && (
                <Link
                  to={`/read/${firstChapterSlug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>READ FIRST CH</span>
                </Link>
              )}

              {latestChapterSlug && latestChapterSlug !== firstChapterSlug && (
                <Link
                  to={`/read/${latestChapterSlug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 text-xs font-mono font-semibold transition-colors"
                >
                  <span>READ LATEST CH</span>
                </Link>
              )}

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-colors border ${
                  bookmarked
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
                <span>{bookmarked ? 'BOOKMARKED' : 'BOOKMARK'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Synopsis */}
      {Boolean(formatText(comic.description)) && (
        <section className="space-y-3 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80">
          <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Synopsis
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {formatText(comic.description)}
          </p>
        </section>
      )}

      {/* Chapter List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-zinc-100 font-mono uppercase tracking-wider">
              Chapter Index ({chapters.length})
            </h2>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder="Find chapter (e.g. 50)..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {filteredChapters.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
            No chapters match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto p-1">
            {filteredChapters.map((ch, idx) => (
              <Link
                key={idx}
                to={`/read/${ch.slug}`}
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-zinc-900 group-hover:bg-red-600 text-zinc-400 group-hover:text-white flex items-center justify-center font-mono text-[11px] font-bold transition-colors">
                    #
                  </div>
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                    {ch.title}
                  </span>
                </div>
                {ch.releaseTime && (
                  <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0 ml-1">
                    {ch.releaseTime}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Similar Manga suggestions */}
      {comic.similarManga && comic.similarManga.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Similar Manga / Manhwa
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {comic.similarManga.slice(0, 6).map((sim, idx) => (
              <Link
                key={idx}
                to={`/comic/${sim.slug}`}
                className="group flex flex-col gap-2"
              >
                <div className="aspect-[3/4.2] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600 transition-colors">
                  <img
                    src={sim.image}
                    alt={sim.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-red-400 transition-colors truncate">
                  {sim.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ComicDetailPage;

