import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Flame, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { AnimeCard } from '../components/cards/AnimeCard';
import { SkeletonGrid } from '../components/cards/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { FilterSortBar, SortOption } from '../components/ui/FilterSortBar';

export const OngoingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType: 'ongoing' | 'completed' =
    searchParams.get('type') === 'completed' ? 'completed' : 'ongoing';
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const handleTypeChange = (newType: string) => {
    const t = newType as 'ongoing' | 'completed';
    setPage(1);
    setSearchParams({ type: t });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['anime', activeType, page],
    queryFn: () =>
      activeType === 'ongoing'
        ? animeApi.getOngoing(page)
        : animeApi.getCompleted(page),
  });

  const animeList = data?.animeList || [];
  const pagination = data?.pagination;
  const hasNextPage = pagination?.hasNextPage !== false && animeList.length > 0;

  // Client-side sort on current active dataset
  const sortedAnimeList = [...animeList].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'score') {
      const scoreA = parseFloat('score' in a && a.score ? a.score : '0') || 0;
      const scoreB = parseFloat('score' in b && b.score ? b.score : '0') || 0;
      return scoreB - scoreA;
    }
    return 0; // default latest order from server
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
            {activeType === 'ongoing' ? <Flame className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-cyan-400" />}
            <span>Anime Catalog Nexus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeType === 'ongoing' ? 'Ongoing Anime Simulcasts' : 'Completed Anime Series'}
          </h1>
        </div>

        {/* Tab switch */}
        <Tabs
          tabs={[
            { id: 'ongoing', label: 'Ongoing', icon: <Flame className="w-3.5 h-3.5" /> },
            { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeType}
          onChange={handleTypeChange}
        />
      </div>

      {/* Filter and Sort Toolbar */}
      <FilterSortBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={animeList.length}
      />

      {/* Grid */}
      {isLoading ? (
        <SkeletonGrid count={12} />
      ) : sortedAnimeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedAnimeList.map((anime) => {
            const score = 'score' in anime ? (anime.score as string) : undefined;
            const releaseDay = 'releaseDay' in anime ? (anime.releaseDay as string) : undefined;
            const latestReleaseDate =
              'latestReleaseDate' in anime
                ? (anime.latestReleaseDate as string)
                : 'lastReleaseDate' in anime
                ? (anime.lastReleaseDate as string)
                : undefined;

            return (
              <AnimeCard
                key={anime.animeId}
                id={anime.animeId}
                title={anime.title}
                poster={anime.poster}
                episodes={anime.episodes}
                score={score}
                status={activeType === 'completed' ? 'Completed' : 'Ongoing'}
                releaseDay={releaseDay}
                latestReleaseDate={latestReleaseDate}
                href={anime.href}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-xs font-mono text-zinc-500">
          No anime found on this page.
        </div>
      )}

      {/* Pagination Bar */}
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

export default OngoingPage;
