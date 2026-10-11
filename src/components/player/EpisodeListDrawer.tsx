import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListFilter, Search, Play, CheckCircle2, X } from 'lucide-react';
import { EpisodeListItem } from '../../types/anime';
import { formatWatchHref } from '../../utils/urlHelpers';

interface EpisodeListDrawerProps {
  episodes: EpisodeListItem[];
  currentEpisodeId: string;
  animeTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const EpisodeListDrawer: React.FC<EpisodeListDrawerProps> = ({
  episodes = [],
  currentEpisodeId,
  animeTitle,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEpisodes = episodes.filter((ep) => {
    const q = searchQuery.toLowerCase();
    return (
      ep.title.toLowerCase().includes(q) ||
      ep.eps?.toString().includes(q) ||
      ep.episodeId.toLowerCase().includes(q)
    );
  });

  const content = (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Episode Selector ({episodes.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {animeTitle && (
              <span className="text-xs text-zinc-400 font-mono line-clamp-1 max-w-[150px]">
                {animeTitle}
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find episode (e.g. 12)..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      {/* Episode List Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[500px]">
        {filteredEpisodes.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            No matching episodes found.
          </div>
        ) : (
          filteredEpisodes.map((ep) => {
            const isCurrent = ep.episodeId === currentEpisodeId;

            return (
              <Link
                key={ep.episodeId || ep.href}
                to={formatWatchHref(ep.href || ep.episodeId)}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? 'bg-red-600/15 border border-red-600/50 text-red-400 font-bold shadow-sm'
                    : 'bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold ${
                      isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    {isCurrent ? (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    ) : (
                      ep.eps || '•'
                    )}
                  </div>
                  <span className="truncate">{ep.title}</span>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-mono uppercase bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                    Playing
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );

  if (isOpen === undefined) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg max-h-[85vh]">{content}</div>
    </div>
  );
};

export default EpisodeListDrawer;
