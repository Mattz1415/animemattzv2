import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Play,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Tv,
  Download,
  Share2,
  AlertTriangle,
  Search,
  Sparkles,
  Users,
  Film,
  Calendar,
  Layers,
  Heart,
  CheckCircle2,
  Clock,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { AnimeCard } from '../components/cards/AnimeCard';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCyberSound } from '../hooks/useCyberSound';
import { ShareModal } from '../components/modals/ShareModal';
import { useAnimeUserTracker, WatchStatus } from '../hooks/useAnimeUserTracker';
import { formatWatchHref } from '../utils/urlHelpers';

function formatSynopsis(syn: any): string {
  if (!syn) return '';
  if (typeof syn === 'string') return syn;
  if (Array.isArray(syn)) return syn.filter(Boolean).map(String).join('\n\n');
  if (typeof syn === 'object') {
    if (Array.isArray(syn.paragraphs) && syn.paragraphs.length > 0) {
      return syn.paragraphs.filter(Boolean).map(String).join('\n\n');
    }
    if (typeof syn.text === 'string') return syn.text;
    if (typeof syn.description === 'string') return syn.description;
  }
  return '';
}

export const AnimeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const isDonghuaRoute = location.pathname.startsWith('/donghua');

  const [imageError, setImageError] = useState(false);
  const [episodeFilter, setEpisodeFilter] = useState('');
  const [episodeRange, setEpisodeRange] = useState<number>(0); // 0 = 1-25, 1 = 26-50, etc.
  const [shareOpen, setShareOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime', 'detail', slug, isDonghuaRoute],
    queryFn: () => animeApi.getAnimeDetail(slug || '', isDonghuaRoute),
    enabled: Boolean(slug),
  });

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playBlip } = useCyberSound();
  const bookmarked = slug ? isBookmarked(slug) : false;

  const { currentEntry, updateStatus, updateRating, updateNotes } = useAnimeUserTracker(slug);

  const episodes = anime?.episodeList || [];
  const episodesPerRange = 25;
  const totalRanges = Math.ceil(episodes.length / episodesPerRange) || 1;

  // Filter episodes
  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(episodeFilter.toLowerCase()) ||
      ep.eps?.toString().includes(episodeFilter)
  );

  // Range sliced episodes if no active search filter
  const displayedEpisodes = episodeFilter.trim()
    ? filteredEpisodes
    : episodes.slice(episodeRange * episodesPerRange, (episodeRange + 1) * episodesPerRange);

  const firstEpisode = episodes[episodes.length - 1] || episodes[0];

  const handleBookmark = () => {
    if (!slug || !anime) return;
    playBlip('switch');
    toggleBookmark({
      id: slug,
      title: anime.title,
      poster: anime.poster,
      slug,
      score: anime.score,
      status: anime.status,
      type: anime.isDonghua ? 'donghua' : 'anime',
    });
  };

  const handleStatusChange = (status: WatchStatus) => {
    if (!anime) return;
    playBlip('click');
    updateStatus(status, { title: anime.title, poster: anime.poster });
  };

  const handleRatingChange = (rating: number) => {
    if (!anime) return;
    playBlip('success');
    updateRating(rating, { title: anime.title, poster: anime.poster });
  };

  const handleSaveNote = () => {
    if (!anime) return;
    playBlip('success');
    updateNotes(noteText, { title: anime.title, poster: anime.poster });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-400 tracking-wider">
          RESOLVING CYBER DOSSIER & STREAM MIRRORS...
        </span>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-100">Broadcast Archive Searching...</h2>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
          The upstream fansub server is syncing broadcast records for &quot;{slug}&quot;.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            to={`/search?q=${encodeURIComponent(slug?.replace(/-/g, ' ') || '')}`}
            className="px-4 py-2 text-xs font-mono bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            Search Related Releases
          </Link>
          <Link
            to="/"
            className="px-4 py-2 text-xs font-mono bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Anime Hero Header Banner */}
      <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl">
        {/* Blurred background aura */}
        <div className="absolute inset-0 z-0">
          {anime.poster && (
            <img
              src={anime.poster}
              alt=""
              className="w-full h-full object-cover filter blur-2xl opacity-20 scale-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        {/* Content Details */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start gap-8">
          {/* Poster Card */}
          <div className="w-full sm:w-56 md:w-64 aspect-[3/4.2] rounded-2xl overflow-hidden bg-zinc-900 border-2 border-red-600/40 shadow-[0_0_35px_rgba(220,38,38,0.3)] flex-shrink-0">
            <img
              src={
                imageError || !anime.poster
                  ? 'https://picsum.photos/seed/' + encodeURIComponent(anime.title) + '/400/600'
                  : anime.poster
              }
              alt={anime.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata Section */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {anime.isDonghua && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Donghua 3D/2D
                </span>
              )}
              {anime.isFallback && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Live Sync Feed Ready
                </span>
              )}
              {anime.status && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-red-950 text-red-400 border border-red-800/60">
                  {anime.status}
                </span>
              )}
              {anime.type && (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {anime.type}
                </span>
              )}
              {anime.score && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/40">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{anime.score}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {anime.title}
            </h1>

            {anime.japanese && (
              <p className="text-sm font-mono text-zinc-400">
                Alternative: {anime.japanese}
              </p>
            )}

            {/* Quick Spec Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-zinc-900 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block">EPISODES</span>
                <span className="text-zinc-200 font-semibold">{episodes.length || anime.episodes || '12'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">SEASON</span>
                <span className="text-zinc-200 font-semibold">{anime.season || 'Winter 2026'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">STUDIO</span>
                <span className="text-zinc-200 font-semibold truncate block">{anime.studios || 'Toei / Aniplex'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">RATING</span>
                <span className="text-zinc-200 font-semibold">{anime.rating || 'PG-13'}</span>
              </div>
            </div>

            {/* Genre tags */}
            {anime.genreList && anime.genreList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {anime.genreList.map((g, i) => (
                  <Link
                    key={i}
                    to={`/genres?slug=${g.genreId || g.title.toLowerCase()}`}
                    className="px-2.5 py-1 text-xs font-mono rounded-md bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  >
                    {g.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {firstEpisode ? (
                <Link
                  to={formatWatchHref(firstEpisode.href || firstEpisode.episodeId)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START WATCHING</span>
                </Link>
              ) : (
                <Link
                  to={formatWatchHref(`${slug}-episode-1`)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>STREAM EPISODE 1</span>
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
                <span>{bookmarked ? 'BOOKMARKED' : 'ADD TO BOOKMARKS'}</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE & QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 7: Personal Watch Status & 10-Star Rating Tracker Bar */}
      <section className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
              My Watch Tracker & Personal Rating
            </h2>
          </div>

          {/* Status selector buttons */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'watching', label: 'Watching', color: 'bg-emerald-600 text-white border-emerald-500' },
                { id: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-cyan-600 text-white border-cyan-500' },
                { id: 'completed', label: 'Completed', color: 'bg-purple-600 text-white border-purple-500' },
                { id: 'on_hold', label: 'On Hold', color: 'bg-amber-600 text-white border-amber-500' },
                { id: 'dropped', label: 'Dropped', color: 'bg-zinc-700 text-white border-zinc-600' },
              ] as const
            ).map((st) => {
              const active = currentEntry?.status === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleStatusChange(st.id)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                    active
                      ? `${st.color} shadow-[0_0_12px_rgba(255,255,255,0.2)] font-semibold`
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10-Star Rating & Notes Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 10 Star Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Score Rating:</span>
              <span className="text-amber-400 font-bold">
                {currentEntry?.userRating ? `${currentEntry.userRating} / 10 Stars` : 'Unrated'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                const filled = (currentEntry?.userRating || 0) >= star;
                return (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      filled
                        ? 'bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {star}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Personal Log & Notes:</span>
              {noteSaved && <span className="text-emerald-400 font-bold">Saved!</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue={currentEntry?.notes || ''}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="E.g. Watched up to arc 2, best fight in ep 8..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      {Boolean(formatSynopsis(anime.synopsis)) && (
        <section className="space-y-3 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80">
          <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Synopsis / Overview
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {formatSynopsis(anime.synopsis)}
          </p>
        </section>
      )}

      {/* Feature 5: Episode Range & Available Episodes Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-zinc-100 font-mono uppercase tracking-wider">
              Available Episodes ({episodes.length})
            </h2>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={episodeFilter}
              onChange={(e) => setEpisodeFilter(e.target.value)}
              placeholder="Filter episode..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Episode Batch Navigator Tabs (if more than 25 episodes) */}
        {totalRanges > 1 && !episodeFilter.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {Array.from({ length: totalRanges }, (_, idx) => {
              const start = idx * episodesPerRange + 1;
              const end = Math.min((idx + 1) * episodesPerRange, episodes.length);
              const active = episodeRange === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    playBlip('switch');
                    setEpisodeRange(idx);
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors whitespace-nowrap border ${
                    active
                      ? 'bg-red-600 text-white border-red-500 font-bold shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  Episodes {start}–{end}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedEpisodes.map((ep) => (
            <Link
              key={ep.episodeId || ep.href}
              to={formatWatchHref(ep.href || ep.episodeId)}
              className="group flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 group-hover:bg-red-600 text-zinc-400 group-hover:text-white flex items-center justify-center font-mono text-xs font-bold transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {ep.title}
                  </span>
                  {ep.date && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      {ep.date}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 flex-shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Feature 9: Voice Actors (Seiyuu) & Characters Dossier */}
      {anime.voiceActors && anime.voiceActors.length > 0 && (
        <section className="space-y-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-xl">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
              Character Dossier & Voice Actors (Seiyuu)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {anime.voiceActors.map((va, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600/40 to-cyan-500/40 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white font-mono flex-shrink-0">
                  {va.character.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-zinc-200 truncate">
                    {va.character}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono truncate">
                    VA: {va.seiyuu}
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">
                    {va.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Disambiguation & Related Series Section */}
      {anime.relatedMatches && anime.relatedMatches.length > 0 && (
        <section className="space-y-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-850">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-wider">
                Related Series & Disambiguation Matches
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              ({anime.relatedMatches.length} Matches Found)
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-mono">
            Click any entry below to stream or view other seasons and franchise releases:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
            {anime.relatedMatches.map((m) => (
              <AnimeCard
                key={m.animeId}
                id={m.animeId}
                title={m.title}
                poster={m.poster}
                score={m.score}
                href={m.href}
              />
            ))}
          </div>
        </section>
      )}

      {/* Batch Downloads Section */}
      {anime.batch && (
        <section className="p-6 rounded-2xl bg-zinc-950 border border-cyan-900/40 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-wider">
              Batch Download Pack
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Download all episodes in a single archive pack with subtitles included.
          </p>
          <a
            href={anime.batch.href || anime.batch.otakudesuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-mono transition-colors"
          >
            <span>{anime.batch.title || 'Download Complete Batch'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>
      )}

      {/* Recommended Anime Section */}
      {anime.recommendedAnimeList && anime.recommendedAnimeList.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 font-mono uppercase tracking-wider">
            Recommended Series
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.recommendedAnimeList.slice(0, 6).map((rec) => (
              <AnimeCard
                key={rec.animeId}
                id={rec.animeId}
                title={rec.title}
                poster={rec.poster}
                href={rec.href}
              />
            ))}
          </div>
        </section>
      )}

      {/* Share Transmission Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={anime.title}
      />
    </div>
  );
};

export default AnimeDetailPage;
