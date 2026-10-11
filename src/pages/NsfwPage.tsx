import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  ShieldAlert,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import { nsfwApi } from '../api/nsfwApi';
import { useNsfwSafeGate } from '../hooks/useNsfwSafeGate';
import { Tabs } from '../components/ui/Tabs';
import { SkeletonGrid } from '../components/cards/SkeletonCard';
import { NsfwDetail, NsfwItem } from '../types/nsfw';

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

export const NsfwPage: React.FC = () => {
  const { isNsfwUnlocked, openModal } = useNsfwSafeGate();
  const [activeTab, setActiveTab] = useState<'hentai' | 'jav' | 'releases'>('hentai');
  const [page, setPage] = useState<number>(1);

  // Active modal video streamer for Neko items
  const [selectedNekoUrl, setSelectedNekoUrl] = useState<string | null>(null);

  // Queries for Hentai, JAV, and Releases
  const { data: hentaiData, isLoading: isHentaiLoading } = useQuery({
    queryKey: ['nsfw', 'hentai', page],
    queryFn: () => nsfwApi.getLatestHentai(page),
    enabled: isNsfwUnlocked && activeTab === 'hentai',
  });

  const { data: javData, isLoading: isJavLoading } = useQuery({
    queryKey: ['nsfw', 'jav', page],
    queryFn: () => nsfwApi.getLatestJav(page),
    enabled: isNsfwUnlocked && activeTab === 'jav',
  });

  const { data: releaseData, isLoading: isReleaseLoading } = useQuery({
    queryKey: ['nsfw', 'releases', page],
    queryFn: () => nsfwApi.getNekoReleases(page),
    enabled: isNsfwUnlocked && activeTab === 'releases',
  });

  // Query for stream details if an item is clicked
  const { data: streamDetail, isLoading: isStreamLoading } = useQuery({
    queryKey: ['nsfw', 'detail', selectedNekoUrl],
    queryFn: () => (selectedNekoUrl ? nsfwApi.getNekoDetail(selectedNekoUrl) : null),
    enabled: Boolean(selectedNekoUrl),
  });

  // If NSFW gate is locked, display gated screen
  if (!isNsfwUnlocked) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Restricted 18+ Adult Zone
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
          This section contains adult material (Hentai, JAV 3D, and uncensored animations).
          You must verify that you are at least 18 years old to access this module.
        </p>
        <button
          onClick={openModal}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105"
        >
          <Unlock className="w-4 h-4" />
          <span>VERIFY AGE & UNLOCK (18+)</span>
        </button>
      </div>
    );
  }

  const currentItems =
    activeTab === 'hentai'
      ? hentaiData?.items || []
      : activeTab === 'jav'
      ? javData?.items || []
      : releaseData?.items || [];

  const isLoading =
    activeTab === 'hentai'
      ? isHentaiLoading
      : activeTab === 'jav'
      ? isJavLoading
      : isReleaseLoading;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'hentai' | 'jav' | 'releases');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
            <Flame className="w-4 h-4" />
            <span>Adult Content Realm (Nekopoi)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            NSFW Theater (18+)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Uncensored Japanese Hentai animation, JAV Cosplay/3D, and daily Nekopoi releases.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'hentai', label: 'Latest Hentai', icon: <Flame className="w-3.5 h-3.5" /> },
            { id: 'jav', label: 'JAV & 3D', icon: <Film className="w-3.5 h-3.5" /> },
            { id: 'releases', label: 'Neko Releases', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <SkeletonGrid count={12} aspect="video" />
      ) : currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentItems.map((item, idx) => {
            const thumb = 'thumbnail' in item ? item.thumbnail : 'thumb' in item ? item.thumb : '';
            return (
              <div
                key={idx}
                className="group relative flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-red-600/60 transition-all duration-300 overflow-hidden shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={thumb || 'https://picsum.photos/seed/' + encodeURIComponent(item.title) + '/480/270'}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  {/* Play trigger overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedNekoUrl(item.url)}
                      className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.8)] transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-950/90 text-red-300 border border-red-800/60">
                    18+
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedNekoUrl(item.url)}
                      className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-red-400 transition-colors line-clamp-2 cursor-pointer"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {'description' in item && Boolean(formatText(item.description)) && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {formatText(item.description)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs font-mono text-zinc-400">
                    {'date' in item && item.date && <span>{item.date}</span>}
                    {'upload_date' in item && item.upload_date && <span>{item.upload_date}</span>}

                    <button
                      onClick={() => setSelectedNekoUrl(item.url)}
                      className="text-xs font-mono text-red-400 hover:text-red-300 ml-auto flex items-center gap-1"
                    >
                      <span>Stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-xs font-mono text-zinc-500">
          No adult content found for this category.
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
          disabled={isLoading || currentItems.length === 0}
          className="flex items-center gap-1 px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40 border border-zinc-800"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stream / Detail Modal */}
      {selectedNekoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-red-600/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedNekoUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {isStreamLoading ? (
              <div className="py-20 text-center text-xs font-mono text-zinc-400 animate-pulse">
                DECRYPTING STREAM SERVERS...
              </div>
            ) : streamDetail ? (
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-white pr-8">
                  {streamDetail.title}
                </h2>

                {streamDetail.streamUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
                    <iframe
                      src={streamDetail.streamUrl}
                      title={streamDetail.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  </div>
                )}

                {Boolean(formatText(streamDetail.synopsis)) && (
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {formatText(streamDetail.synopsis)}
                  </p>
                )}

                {streamDetail.downloadLinks && streamDetail.downloadLinks.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      Download Mirrors:
                    </h4>
                    <div className="space-y-2">
                      {streamDetail.downloadLinks.map((dl, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="text-zinc-400">{dl.quality}:</span>
                          {dl.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                            >
                              {link.name}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-zinc-400">
                Direct stream player could not be loaded. Please try viewing via external provider.
                <div className="mt-4">
                  <a
                    href={selectedNekoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-mono"
                  >
                    <span>Open Provider Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NsfwPage;

