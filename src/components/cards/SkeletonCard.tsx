import React from 'react';

export const SkeletonCard: React.FC<{ aspect?: 'poster' | 'video' | 'banner' }> = ({
  aspect = 'poster',
}) => {
  const aspectClass =
    aspect === 'poster'
      ? 'aspect-[3/4.2]'
      : aspect === 'video'
      ? 'aspect-video'
      : 'aspect-[16/6]';

  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      <div
        className={`w-full ${aspectClass} rounded-xl bg-zinc-900/80 border border-zinc-800/60 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="h-4 bg-zinc-900 rounded w-4/5" />
      <div className="h-3 bg-zinc-900/60 rounded w-1/2" />
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; aspect?: 'poster' | 'video' }> = ({
  count = 12,
  aspect = 'poster',
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} aspect={aspect} />
      ))}
    </div>
  );
};
