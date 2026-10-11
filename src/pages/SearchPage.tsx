import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Tv, BookOpen, Flame, Sparkles, AlertCircle, Filter, X, Clock, Star } from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { comicApi } from '../api/comicApi';
import { nsfwApi } from '../api/nsfwApi';
import { AnimeCard } from '../components/cards/AnimeCard';
import { ComicCard } from '../components/cards/ComicCard';
import { SkeletonGrid } from '../components/cards/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { useDebounce } from '../hooks/useDebounce';
import { useNsfwSafeGate } from '../hooks/useNsfwSafeGate';
import { useCyberSound } from '../hooks/useCyberSound';

const TRENDING_TAGS = [
  'One Piece',
  'Solo Leveling',
  'Bleach',
  'Jujutsu Kaisen',
  'Frieren',
  'Demon Slayer',
  'Naruto',
  'Blue Lock',
  'Tower of God',
];

const SEARCH_HISTORY_KEY = 'sankaverse_search_history';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const debouncedQuery = useDebounce(queryInput, 700);
  const [activeTab, setActiveTab] = useState<'all' | 'anime' | 'comic' | 'nsfw'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | '7' | '8'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem(SEARCH_HISTORY_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const { isNsfwUnlocked } = useNsfwSafeGate();
  const { playBlip } = useCyberSound();

  // Sync url param
  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      setSearchParams({ q: debouncedQuery.trim() });
      try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        const prev: string[] = stored ? JSON.parse(stored) : [];
        const filtered = prev.filter((item) => item.toLowerCase() !== debouncedQuery.trim().toLowerCase());
        const updated = [debouncedQuery.trim(), ...filtered].slice(0, 8);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  }, [debouncedQuery, setSearchParams]);

  const canSearch = debouncedQuery.trim().length >= 3;

  // Search Anime
  const { data: animeResults, isLoading: isAnimeLoading } = useQuery({
    queryKey: ['search', 'anime', debouncedQuery],
    queryFn: () => animeApi.searchAnime(debouncedQuery),
    enabled: canSearch && (activeTab === 'all' || activeTab === 'anime'),
  });

  // Search Comic
  const { data: comicResults, isLoading: isComicLoading } = useQuery({
    queryKey: ['search', 'comic', debouncedQuery],
    queryFn: () => comicApi.searchComic(debouncedQuery, 1),
    enabled: canSearch && (activeTab === 'all' || activeTab === 'comic'),
  });

  // Search NSFW (only if unlocked)
  const { data: nsfwResults, isLoading: isNsfwLoading } = useQuery({
    queryKey: ['search', 'nsfw', debouncedQuery],
    queryFn: () => nsfwApi.searchNeko(debouncedQuery),
    enabled: canSearch && isNsfwUnlocked && (activeTab === 'all' || activeTab === 'nsfw'),
  });

  let animes = animeResults || [];
  if (scoreFilter === '8') {
    animes = animes.filter((a) => a.score && parseFloat(a.score) >= 8.0);
  } else if (scoreFilter === '7') {
    animes = animes.filter((a) => a.score && parseFloat(a.score) >= 7.0);
  }

  const comics = comicResults?.komikList || [];
  const nsfws = nsfwResults || [];

  const isLoading =
    (activeTab === 'all' && (isAnimeLoading || isComicLoading)) ||
    (activeTab === 'anime' && isAnimeLoading) ||
    (activeTab === 'comic' && isComicLoading) ||
    (activeTab === 'nsfw' && isNsfwLoading);

  const tabs = [
    { id: 'all', label: 'All Modules' },
    { id: 'anime', label: 'Anime', count: animes.length },
    { id: 'comic', label: 'Comics', count: comics.length },
  ];

  if (isNsfwUnlocked) {
    tabs.push({ id: 'nsfw', label: '18+ Adult', count: nsfws.length });
  }

  const handleClearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };

  return (
    <div className="space-y-8">
      {/* Header & Big Search Bar */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
            <Search className="w-4 h-4" />
            <span>Universal Query Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search SankaVerse
          </h1>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full max-w-3xl">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Type at least 3 characters to search across anime, manga, manhwa..."
            className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-600 focus:shadow-[0_0_25px_rgba(220,38,38,0.3)] transition-all"
            autoFocus
          />
          {queryInput.length > 0 && queryInput.length < 3 && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-500">
              Needs {3 - queryInput.length} more characters
            </span>
          )}
        </div>

        {/* Feature 10: Trending Chips & Recent History */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Trending:</span>
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  playBlip('click');
                  setQueryInput(tag);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {searchHistory.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent:
              </span>
              {searchHistory.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    playBlip('click');
                    setQueryInput(item);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-850 text-[11px] font-mono transition-colors"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={handleClearHistory}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 font-mono ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      {canSearch && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'all' | 'anime' | 'comic' | 'nsfw')}
          />

          {/* Quick Score Rating Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Rating:</span>
            {(
              [
                { id: 'all', label: 'All Scores' },
                { id: '7', label: '★ 7.0+' },
                { id: '8', label: '★ 8.0+' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playBlip('switch');
                  setScoreFilter(f.id);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  scoreFilter === f.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Container */}
      {!canSearch ? (
        <div className="py-20 text-center space-y-2">
          <Search className="w-8 h-8 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-400 font-mono">
            Enter 3 or more characters to query the Sanka Vollerei network.
          </p>
          <p className="text-xs text-zinc-600 font-mono">
            Rate-limit protected at 45 requests/minute with 700ms debounce.
          </p>
        </div>
      ) : isLoading ? (
        <SkeletonGrid count={12} />
      ) : (
        <div className="space-y-10">
          {/* Anime Results */}
          {(activeTab === 'all' || activeTab === 'anime') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Tv className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
                  Anime Matches ({animes.length})
                </h2>
              </div>

              {animes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {animes.map((a) => (
                    <AnimeCard
                      key={a.animeId}
                      id={a.animeId}
                      title={a.title}
                      poster={a.poster}
                      episodes={a.episodes}
                      score={a.score}
                      href={a.href}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-mono py-4">No anime matches found.</p>
              )}
            </section>
          )}

          {/* Comic Results */}
          {(activeTab === 'all' || activeTab === 'comic') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
                  Comic & Manga Matches ({comics.length})
                </h2>
              </div>

              {comics.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {comics.map((c) => (
                    <ComicCard
                      key={c.slug}
                      slug={c.slug}
                      title={c.title}
                      image={c.image}
                      type={c.type}
                      rating={c.rating}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-mono py-4">No comic matches found.</p>
              )}
            </section>
          )}

          {/* NSFW Results (if unlocked) */}
          {isNsfwUnlocked && (activeTab === 'all' || activeTab === 'nsfw') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Flame className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
                  18+ Adult Matches ({nsfws.length})
                </h2>
              </div>

              {nsfws.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {nsfws.map((n, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                    >
                      <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1">
                        {n.title}
                      </h4>
                      {n.url && (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-red-400 hover:underline block"
                        >
                          View Adult Content →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-mono py-4">No 18+ matches found.</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
