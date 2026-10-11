import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { comicApi } from '../api/comicApi';
import { ComicCard } from '../components/cards/ComicCard';
import { SkeletonGrid } from '../components/cards/SkeletonCard';
import { useDebounce } from '../hooks/useDebounce';

export const ComicHomePage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 700);

  // Fetch Latest Comics
  const { data: latestData, isLoading: isLatestLoading } = useQuery({
    queryKey: ['comic', 'latest', page],
    queryFn: () => comicApi.getLatest(page),
    enabled: debouncedSearch.trim().length < 3,
  });

  // Fetch Search Results if debounced query is >= 3 chars
  const isSearchActive = debouncedSearch.trim().length >= 3;
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['comic', 'search', debouncedSearch, page],
    queryFn: () => comicApi.searchComic(debouncedSearch, page),
    enabled: isSearchActive,
  });

  // Fetch Genres
  const { data: genresData } = useQuery({
    queryKey: ['comic', 'genres'],
    queryFn: comicApi.getGenres,
  });

  const comicList = isSearchActive
    ? searchData?.komikList || []
    : latestData?.komikList || [];

  const pagination = isSearchActive
    ? searchData?.pagination
    : latestData?.pagination;

  const isLoading = isSearchActive ? isSearchLoading : isLatestLoading;
  const hasNextPage = pagination?.hasNextPage !== false && comicList.length > 0;

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Manga & Manhwa Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Komikindo Comics Archive
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Read high-quality Japanese Manga, Korean Manhwa, and Chinese Manhua translated into Indonesian.
          </p>
        </div>

        {/* Comic Search with 700ms debounce */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search comics (min 3 chars)..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/40"
          />
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <span className="text-[10px] font-mono text-amber-500 absolute right-3 top-1/2 -translate-y-1/2">
              Type {3 - searchTerm.length} more chars
            </span>
          )}
        </div>
      </div>

      {/* Comic Genres Strip */}
      {genresData && genresData.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800/80 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2 flex-shrink-0" />
          {genresData.slice(0, 15).map((genre, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchTerm(genre.name);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white whitespace-nowrap border border-zinc-850 transition-colors"
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}

      {/* Comics Grid */}
      {isLoading ? (
        <SkeletonGrid count={12} />
      ) : comicList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {comicList.map((comic) => (
            <ComicCard
              key={comic.slug}
              slug={comic.slug}
              title={comic.title}
              image={comic.image}
              type={comic.type}
              rating={comic.rating}
              latestChapter={comic.latestChapter}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-xs font-mono text-zinc-500">
          No comics found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-900">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isLoading}
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
          disabled={!hasNextPage || isLoading}
          className="flex items-center gap-1 px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 border border-zinc-800"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ComicHomePage;

