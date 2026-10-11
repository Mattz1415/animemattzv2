import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Tv,
  ListFilter,
  ArrowLeft,
  Home,
  Share2,
  Bookmark,
  Keyboard,
  Sparkles,
  MessageSquare,
  Send,
  Flame,
  Heart,
  Smile,
  Skull,
  Eye,
  Play,
  X,
  Volume2,
} from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { DesuStreamPlayer } from '../components/player/DesuStreamPlayer';
import { EpisodeListDrawer } from '../components/player/EpisodeListDrawer';
import { DownloadAccordion } from '../components/player/DownloadAccordion';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCyberSound } from '../hooks/useCyberSound';
import { ShareModal } from '../components/modals/ShareModal';
import { ShortcutsModal } from '../components/modals/ShortcutsModal';
import { useEpisodeInteractions } from '../hooks/useAnimeUserTracker';
import { cleanEpisodeSlug } from '../utils/urlHelpers';

export const WatchPage: React.FC = () => {
  const params = useParams<{ episodeSlug?: string; '*'?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);

  // Extract episode slug accurately from any route variant:
  // /watch/:episodeSlug
  // /watch/* (e.g. /watch/donghua/slug or /watch/slug)
  // /anime/episode/:episodeSlug
  // /episode/:episodeSlug
  const rawParamSlug = params.episodeSlug || params['*'];
  const rawPathSlug = location.pathname
    .replace(/^\/anime\/episode\//, '')
    .replace(/^\/episode\//, '')
    .replace(/^\/donghua\/episode\//, '')
    .replace(/^\/watch\//, '');

  const episodeSlug = cleanEpisodeSlug(rawParamSlug || rawPathSlug || '');

  const [shareOpen, setShareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);

  // New comment input states
  const [commentText, setCommentText] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState('00:00');
  const [authorName, setAuthorName] = useState('CyberViewer');

  const { addWatchItem } = useWatchHistory();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playBlip } = useCyberSound();

  // Episode Interactions (Feature 8)
  const { comments, reactions, addComment, toggleReaction } = useEpisodeInteractions(episodeSlug);

  // Fetch episode details
  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['anime', 'episode', episodeSlug],
    queryFn: () => animeApi.getEpisodeDetail(episodeSlug || ''),
    enabled: Boolean(episodeSlug),
  });

  // Extract or guess parent animeId
  const animeId =
    episode?.animeId ||
    episodeSlug
      ?.replace(/-episode-\d+.*$/, '')
      .replace(/-ep-\d+.*$/, '');

  const { data: animeDetail } = useQuery({
    queryKey: ['anime', 'detail', animeId],
    queryFn: () => animeApi.getAnimeDetail(animeId || ''),
    enabled: Boolean(animeId),
  });

  const prevEpId = episode?.prevEpisode?.episodeId;
  const nextEpId = episode?.nextEpisode?.episodeId;

  // Track scroll position to show Feature 6: Floating Mini-Player
  useEffect(() => {
    const handleScroll = () => {
      if (!playerRef.current) return;
      const rect = playerRef.current.getBoundingClientRect();
      // If player is scrolled completely off the top of the viewport
      if (rect.bottom < 80) {
        setIsMiniPlayerVisible(true);
      } else {
        setIsMiniPlayerVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for episodes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'j' || e.key === 'J') {
        if (nextEpId) {
          playBlip('click');
          navigate(`/watch/${nextEpId}`);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        if (prevEpId) {
          playBlip('click');
          navigate(`/watch/${prevEpId}`);
        }
      } else if (e.key === '?') {
        setShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEpId, prevEpId, navigate, playBlip]);

  // Log to Watch History upon successful load
  useEffect(() => {
    if (episode && episodeSlug) {
      addWatchItem({
        animeId: animeId || episodeSlug,
        animeTitle: animeDetail?.title || episode.title,
        episodeId: episodeSlug,
        episodeTitle: episode.title,
        poster: animeDetail?.poster,
      });
    }
  }, [episode, episodeSlug, animeDetail, animeId, addWatchItem]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    playBlip('success');
    addComment(commentText, commentTimestamp, authorName);
    setCommentText('');
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-400 tracking-wider">
          CONNECTING DESUSTREAM FEED & MIRRORS...
        </span>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-zinc-200">Episode Stream Loading</h2>
        <p className="text-xs text-zinc-500 font-mono">
          Syncing fansub stream for &quot;{episodeSlug}&quot;.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 text-xs font-mono bg-zinc-900 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800 flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-red-500" />
            <span>Menu Utama</span>
          </Link>
          {animeId && (
            <Link
              to={`/anime/${animeId}`}
              className="px-4 py-2 text-xs font-mono bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Open Series Dossier
            </Link>
          )}
        </div>
      </div>
    );
  }

  const allEpisodes = animeDetail?.episodeList || [];
  const bookmarked = animeId ? isBookmarked(animeId) : false;

  const handleBookmarkToggle = () => {
    if (!animeId || !animeDetail) return;
    playBlip('switch');
    toggleBookmark({
      id: animeId,
      title: animeDetail.title,
      poster: animeDetail.poster,
      slug: animeId,
      score: animeDetail.score,
      status: animeDetail.status,
      type: 'anime',
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
              title="Kembali ke Menu Utama"
            >
              <Home className="w-3.5 h-3.5 text-red-500" />
              <span>Menu Utama</span>
            </Link>

            {animeId && (
              <Link
                to={`/anime/${animeId}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                title="Kembali ke Detail Anime"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
                <span>Detail Anime</span>
              </Link>
            )}

            <span>/</span>
            <span className="text-zinc-200 font-bold truncate max-w-xs sm:max-w-md">
              {episode.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Next Switch */}
            <button
              onClick={() => {
                playBlip('switch');
                setAutoNext(!autoNext);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
                autoNext
                  ? 'bg-red-600/20 text-red-400 border-red-600/40'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              <span>Auto Next: {autoNext ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard Shortcuts (?)"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              onClick={handleBookmarkToggle}
              title={bookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
              className={`p-1.5 rounded-lg border transition-colors ${
                bookmarked
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => setShareOpen(true)}
              title="Share Stream"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Section with ref for PiP tracking */}
        <div ref={playerRef} className="w-full">
          <DesuStreamPlayer
            defaultStreamUrl={episode.defaultStreamingUrl}
            title={episode.title}
            serverGroups={episode.server?.qualities}
            episodeSlug={episodeSlug || ''}
            onNextEpisode={nextEpId ? () => navigate(`/watch/${nextEpId}`) : undefined}
          />
        </div>

        {/* Episode Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            {prevEpId ? (
              <Link
                to={`/watch/${prevEpId}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white text-xs font-mono border border-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-red-500" />
                <span>Prev Episode (K)</span>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900/40 text-zinc-600 text-xs font-mono border border-zinc-900 cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>First Episode</span>
              </button>
            )}

            {nextEpId ? (
              <Link
                to={`/watch/${nextEpId}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
              >
                <span>Next Episode (J)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900/40 text-zinc-600 text-xs font-mono border border-zinc-900 cursor-not-allowed"
              >
                <span>Latest Episode</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white text-xs font-mono border border-zinc-800 transition-colors"
          >
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <span>Episode Selector ({allEpisodes.length})</span>
          </button>
        </div>

        {/* Feature 8: Real-Time Emoji Reaction Bar */}
        <section className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-wider">
              Live Reactions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { type: 'hyped' as const, label: '🔥 Hyped', count: reactions.hyped, color: 'text-orange-400 border-orange-900/50 bg-orange-950/40' },
              { type: 'peak' as const, label: '💀 Peak', count: reactions.peak, color: 'text-red-400 border-red-900/50 bg-red-950/40' },
              { type: 'shocked' as const, label: '😱 Twist', count: reactions.shocked, color: 'text-amber-400 border-amber-900/50 bg-amber-950/40' },
              { type: 'funny' as const, label: '🤣 LMAO', count: reactions.funny, color: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/40' },
              { type: 'wholesome' as const, label: '💖 Wholesome', count: reactions.wholesome, color: 'text-pink-400 border-pink-900/50 bg-pink-950/40' },
            ].map((r) => (
              <button
                key={r.type}
                onClick={() => {
                  playBlip('click');
                  toggleReaction(r.type);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all transform active:scale-95 flex items-center gap-1.5 ${r.color}`}
              >
                <span>{r.label}</span>
                <span className="text-[10px] opacity-75 font-normal">({r.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Downloads & Mirrors Section */}
        {episode.downloadUrl && (
          <DownloadAccordion downloadQualities={episode.downloadUrl.qualities} />
        )}

        {/* Feature 8: Timestamped Episode Community Discussion Section */}
        <section className="space-y-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Episode Discussion & Timestamps ({comments.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Otakudesu Fansub Community Channel
            </span>
          </div>

          {/* New comment input form */}
          <form onSubmit={handlePostComment} className="space-y-3 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Name / Handle"
                className="w-32 sm:w-40 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-red-600"
              />
              <input
                type="text"
                value={commentTimestamp}
                onChange={(e) => setCommentTimestamp(e.target.value)}
                placeholder="00:00"
                className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-cyan-400 font-mono text-center focus:outline-none focus:border-red-600"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this episode..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Post</span>
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-3 pt-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-300 flex-shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{c.author}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 text-[10px] font-mono font-bold">
                      {c.timestamp}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature 6: Docked Picture-in-Picture Floating Mini-Player */}
        {isMiniPlayerVisible && (
          <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-72 sm:w-80 aspect-video rounded-xl bg-zinc-950 border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="absolute top-1 left-1 right-1 z-20 flex items-center justify-between px-2 py-1 bg-black/80 rounded backdrop-blur-sm pointer-events-auto">
              <span className="text-[10px] font-mono text-white truncate max-w-[180px]">
                {episode.title}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playBlip('click');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title="Expand to Full Player"
                  className="p-1 hover:text-cyan-400 text-zinc-300 transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMiniPlayerVisible(false)}
                  title="Close Mini-Player"
                  className="p-1 hover:text-red-400 text-zinc-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <iframe
              src={episode.defaultStreamingUrl}
              title={`${episode.title} Mini Feed`}
              className="w-full h-full border-0 pointer-events-none"
              allow="accelerometer; autoplay; encrypted-media"
            />
          </div>
        )}
      </div>

      {/* Episode Drawer */}
      <EpisodeListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        episodes={allEpisodes}
        currentEpisodeId={episodeSlug || ''}
        animeTitle={animeDetail?.title || episode.title}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={episode.title}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
};

export default WatchPage;
