import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  History,
  BookOpen,
  Trash2,
  Play,
  Clock,
  HardDrive,
  Download,
  Filter,
  Heart,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { useAnimeUserTracker, WatchStatus } from '../hooks/useAnimeUserTracker';
import { Tabs } from '../components/ui/Tabs';
import { AnimeCard } from '../components/cards/AnimeCard';
import { ComicCard } from '../components/cards/ComicCard';
import { LibraryBackupModal } from '../components/modals/LibraryBackupModal';
import { useCyberSound } from '../hooks/useCyberSound';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'tracker' | 'watch' | 'reading'>('bookmarks');
  const [bookmarkFilter, setBookmarkFilter] = useState<'all' | 'anime' | 'comic' | 'donghua'>('all');
  const [trackerStatusFilter, setTrackerStatusFilter] = useState<WatchStatus | 'all'>('all');
  const [backupOpen, setBackupOpen] = useState(false);

  const { bookmarks } = useBookmarks();
  const { history: watchHistory, removeItem: removeWatch, clearHistory: clearWatch } = useWatchHistory();
  const { readingHistory, removeItem: removeReading, clearReadingHistory: clearReading } = useReadingHistory();
  const { entries: trackerEntries, removeEntry: removeTrackerEntry } = useAnimeUserTracker();
  const { playBlip } = useCyberSound();

  const trackerList = Object.values(trackerEntries);
  const filteredTrackerList = trackerList.filter((item) => {
    if (trackerStatusFilter === 'all') return true;
    return item.status === trackerStatusFilter;
  });

  const tabs = [
    { id: 'bookmarks', label: 'Bookmarks', count: bookmarks.length, icon: <BookmarkCheck className="w-3.5 h-3.5" /> },
    { id: 'tracker', label: 'Anime Tracker', count: trackerList.length, icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'watch', label: 'Watch History', count: watchHistory.length, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'reading', label: 'Reading Progress', count: readingHistory.length, icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const filteredBookmarks = bookmarks.filter((b) => {
    if (bookmarkFilter === 'all') return true;
    return b.type === bookmarkFilter;
  });

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
              <BookmarkCheck className="w-4 h-4" />
              <span>Local Storage Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              User Library & Vault
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Offline-persisted bookmarks, watch logs, user status tracker, and comic reading progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playBlip('click');
                setBackupOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition-colors"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Backup & Restore</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            playBlip('switch');
            setActiveTab(tab as 'bookmarks' | 'tracker' | 'watch' | 'reading');
          }}
        />

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Saved Titles ({filteredBookmarks.length})
              </span>

              {/* Category filter */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
                {(['all', 'anime', 'comic', 'donghua'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playBlip('click');
                      setBookmarkFilter(cat);
                    }}
                    className={`px-2.5 py-1 rounded transition-colors uppercase ${
                      bookmarkFilter === cat
                        ? 'bg-red-600 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="p-16 text-center text-xs font-mono text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
                No bookmarked titles in this category. Click the bookmark icon on any anime or comic card to save it here.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBookmarks.map((b) =>
                  b.type === 'comic' ? (
                    <ComicCard
                      key={b.id}
                      slug={b.slug}
                      title={b.title}
                      image={b.poster}
                      rating={b.score}
                    />
                  ) : (
                    <AnimeCard
                      key={b.id}
                      id={b.id}
                      title={b.title}
                      poster={b.poster}
                      score={b.score}
                      status={b.status}
                      type={b.type === 'donghua' ? 'donghua' : 'anime'}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Anime Tracker Tab (Feature 7) */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Tracked Anime List ({filteredTrackerList.length})
              </span>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'watching', label: 'Watching' },
                    { id: 'plan_to_watch', label: 'Plan' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'on_hold', label: 'On Hold' },
                    { id: 'dropped', label: 'Dropped' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      playBlip('click');
                      setTrackerStatusFilter(st.id);
                    }}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      trackerStatusFilter === st.id
                        ? 'bg-red-600 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTrackerList.length === 0 ? (
              <div className="p-16 text-center text-xs font-mono text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
                No tracked anime in this status. Select your watch status (Watching, Completed, Plan) on any anime page to organize your watch list!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrackerList.map((entry) => (
                  <div
                    key={entry.animeId}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex gap-3"
                  >
                    <div className="w-16 h-22 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-800">
                      <img
                        src={entry.poster}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          to={`/anime/${entry.animeId}`}
                          className="text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors line-clamp-1"
                        >
                          {entry.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-cyan-400 font-semibold">
                            {entry.status.replace(/_/g, ' ')}
                          </span>
                          {entry.userRating && (
                            <span className="flex items-center gap-0.5 text-amber-400 text-xs font-mono font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {entry.userRating}/10
                            </span>
                          )}
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-[11px] text-zinc-400 italic line-clamp-1 mt-1">
                          &quot;{entry.notes}&quot;
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
                        <span>Updated {formatDate(entry.updatedAt)}</span>
                        <Link
                          to={`/anime/${entry.animeId}`}
                          className="text-red-400 hover:text-red-300 font-semibold"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watch History Tab */}
        {activeTab === 'watch' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Stream History ({watchHistory.length})
              </span>
              {watchHistory.length > 0 && (
                <button
                  onClick={() => {
                    playBlip('alert');
                    clearWatch();
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Watch History</span>
                </button>
              )}
            </div>

            {watchHistory.length === 0 ? (
              <div className="p-16 text-center text-xs font-mono text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
                No video watch history recorded yet. Streams you play will automatically appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {watchHistory.map((item) => (
                  <div
                    key={item.episodeId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-red-500 flex-shrink-0">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">
                          {item.episodeTitle || item.animeTitle}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                          <span>{item.animeTitle}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/watch/${item.episodeId}`}
                        onClick={() => playBlip('click')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono transition-colors"
                      >
                        Resume
                      </Link>
                      <button
                        onClick={() => {
                          playBlip('click');
                          removeWatch(item.episodeId);
                        }}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reading Progress Tab */}
        {activeTab === 'reading' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Reading Logs ({readingHistory.length})
              </span>
              {readingHistory.length > 0 && (
                <button
                  onClick={() => {
                    playBlip('alert');
                    clearReading();
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Reading Logs</span>
                </button>
              )}
            </div>

            {readingHistory.length === 0 ? (
              <div className="p-16 text-center text-xs font-mono text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
                No comic reading logs recorded yet. Chapters you read will automatically appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {readingHistory.map((item) => (
                  <div
                    key={item.chapterSlug}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">
                          {item.comicTitle}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                          <span className="text-cyan-400">{item.chapterTitle}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/read/${item.chapterSlug}`}
                        onClick={() => playBlip('click')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono transition-colors"
                      >
                        Read
                      </Link>
                      <button
                        onClick={() => {
                          playBlip('click');
                          removeReading(item.chapterSlug);
                        }}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Library Backup Modal */}
      <LibraryBackupModal
        isOpen={backupOpen}
        onClose={() => setBackupOpen(false)}
      />
    </>
  );
};

export default LibraryPage;
