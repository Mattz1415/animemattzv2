import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Layers, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { AnimeCard } from '../components/cards/AnimeCard';
import { SkeletonGrid } from '../components/cards/SkeletonCard';

export const GenrePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentGenreSlug = searchParams.get('slug') || 'action';
  const [page, setPage] = useState<number>(1);

  // Fetch all genres
  const { data: genresData, isLoading: isGenresLoading } = useQuery({
    queryKey: ['anime', 'genres'],
    queryFn: animeApi.getGenres,
  });

  // Fetch anime by selected genre
  const { data: genreResults, isLoading: isListLoading } = useQuery({
    queryKey: ['anime', 'genre', currentGenreSlug, page],
    queryFn: () => animeApi.getByGenre(currentGenreSlug, page),
  });

  const genres = genresData || [];
  const animeList = genreResults?.animeList || [];
  const pagination = genreResults?.pagination;
  const hasNextPage = pagination?.hasNextPage !== false && animeList.length > 0;

  const handleSelectGenre = (slug: string) => {
    const cleanSlug = slug.replace(/^\/anime\/genre\//, '').replace(/^\/genre\//, '').replace(/^\//, '');
    setSearchParams({ slug: cleanSlug });
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
          <Layers className="w-4 h-4" />
          <span>Category Filter</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Browse Anime by Genre
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Filter through hundreds of genres from Action, Shounen, Fantasy to Romance and Mystery.
        </p>
      </div>

      {/* Genres Buttons Bar */}
      {isGenresLoading ? (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-zinc-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 max-h-48 overflow-y-auto">
          {genres.map((g, idx) => {
            const rawSlug = g.slug || g.href || g.genre;
            const cleanSlug = rawSlug
              .replace(/^\/anime\/genre\//, '')
              .replace(/^\/genre\//, '')
              .replace(/^\//, '')
              .toLowerCase();
            const isSelected = cleanSlug === currentGenreSlug.toLowerCase();

            return (
              <button
                key={idx}
                onClick={() => handleSelectGenre(cleanSlug)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white font-semibold shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                {g.genre}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Results for: <span className="text-red-400">{currentGenreSlug}</span>
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Page {page}
        </span>
      </div>

      {/* Anime List */}
      {isListLoading ? (
        <SkeletonGrid count={12} />
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.animeId}
              id={anime.animeId}
              title={anime.title}
              poster={anime.poster}
              episodes={anime.episodes}
              score={anime.score}
              latestReleaseDate={anime.latestReleaseDate}
              href={anime.href}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-xs font-mono text-zinc-500">
          No anime found for this genre.
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-900">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isListLoading}
          className="flex items-center gap-1 px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 border border-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
          Page {page}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage || isListLoading}
          className="flex items-center gap-1 px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 border border-zinc-800"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GenrePage;

