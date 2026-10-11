import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Play, ExternalLink, Zap } from 'lucide-react';
import { animeApi } from '../../api/animeApi';
import { DesuStreamPlayer } from '../player/DesuStreamPlayer';
import { cleanEpisodeSlug } from '../../utils/urlHelpers';

interface QuickStreamModalProps {
  animeId: string | null;
  animeTitle?: string;
  onClose: () => void;
}

export const QuickStreamModal: React.FC<QuickStreamModalProps> = ({
  animeId,
  animeTitle,
  onClose,
}) => {
  // Query anime detail
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['anime', 'quick-detail', animeId],
    queryFn: () => (animeId ? animeApi.getAnimeDetail(animeId) : null),
    enabled: Boolean(animeId),
  });

  const rawFirstEp = detail?.episodeList?.[0]?.episodeId || detail?.episodeList?.[0]?.href;
  const firstEpId = cleanEpisodeSlug(rawFirstEp);

  // Query episode stream
  const { data: episode, isLoading: isEpLoading } = useQuery({
    queryKey: ['anime', 'quick-ep', firstEpId],
    queryFn: () => (firstEpId ? animeApi.getEpisodeDetail(firstEpId) : null),
    enabled: Boolean(firstEpId),
  });

  if (!animeId) return null;

  const isLoading = isDetailLoading || (Boolean(firstEpId) && isEpLoading);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-red-600/70 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.35)] overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider truncate max-w-md">
              Quick Stream: {detail?.title || animeTitle || animeId}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="aspect-video w-full flex flex-col items-center justify-center bg-zinc-900/60 rounded-xl">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="mt-3 text-xs font-mono text-zinc-400">RESOLVING INSTANT STREAM FEED...</span>
          </div>
        ) : episode && episode.defaultStreamingUrl ? (
          <DesuStreamPlayer
            defaultStreamUrl={episode.defaultStreamingUrl}
            title={episode.title}
            serverGroups={episode.server?.qualities}
            episodeSlug={firstEpId || ''}
          />
        ) : (
          <div className="py-16 text-center text-xs font-mono text-zinc-400">
            {detail?.isFallback
              ? 'Upstream fansub is still finalizing stream servers for this series.'
              : 'Direct quick stream unavailable for this title.'}
            <div className="mt-4 flex justify-center gap-3">
              <Link
                to={`/anime/${animeId}`}
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs hover:bg-red-500 transition-colors"
              >
                Open Full Anime Dossier
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
