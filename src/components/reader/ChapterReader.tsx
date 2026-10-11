import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { ChapterImage } from '../../types/comic';
import { ReaderFilter } from './ReaderControls';

interface ChapterReaderProps {
  images: ChapterImage[];
  readingMode: 'cascade' | 'paged';
  zoom?: number;
  filterMode?: ReaderFilter;
  onScrollProgress?: (progress: number) => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  images = [],
  readingMode,
  zoom = 100,
  filterMode = 'normal',
  onScrollProgress,
  onNextChapter,
  onPrevChapter,
  hasNextChapter,
  hasPrevChapter,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress in cascade mode
  useEffect(() => {
    if (readingMode !== 'cascade') return;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight <= 0) return;
      const progress = Math.min(100, Math.max(0, Math.round((el.scrollTop / totalHeight) * 100)));
      onScrollProgress?.(progress);
    };

    const target = containerRef.current;
    target?.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target?.removeEventListener('scroll', handleScroll);
    };
  }, [readingMode, onScrollProgress]);

  const handleImageLoaded = (id: string | number) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageError = (id: string | number) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const retryImage = (id: string | number) => {
    setFailedImages((prev) => ({ ...prev, [id]: false }));
  };

  const filterStyle =
    filterMode === 'invert'
      ? 'filter invert hue-rotate-180 brightness-90 contrast-110'
      : filterMode === 'sepia'
      ? 'filter sepia(0.35) brightness-95'
      : '';

  if (!images || images.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-sm">
        No chapter pages available.
      </div>
    );
  }

  const zoomStyle = {
    maxWidth: `${Math.round((768 * zoom) / 100)}px`,
    width: '100%',
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center select-none overflow-y-auto"
    >
      {readingMode === 'cascade' ? (
        // Webtoon continuous vertical cascade mode with Zoom and Eye-care filter
        <div
          style={zoomStyle}
          className={`flex flex-col items-center bg-black/60 shadow-2xl transition-all duration-200 ${filterStyle}`}
        >
          {images.map((img, index) => {
            const key = img.id || index;
            const isLoaded = loadedImages[key];
            const isFailed = failedImages[key];

            return (
              <div
                key={key}
                id={`page-${index + 1}`}
                className="relative w-full min-h-[300px] flex items-center justify-center bg-zinc-950"
              >
                {!isLoaded && !isFailed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 animate-pulse">
                    <span className="text-xs font-mono text-zinc-500">
                      Loading page {index + 1}...
                    </span>
                  </div>
                )}

                {isFailed ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-zinc-400">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <span className="text-xs font-mono">Failed to load page {index + 1}</span>
                    <button
                      onClick={() => retryImage(key)}
                      className="flex items-center gap-1 px-3 py-1 bg-zinc-800 rounded text-xs text-zinc-200 hover:bg-zinc-700"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt={`Page ${index + 1}`}
                    loading="lazy"
                    onLoad={() => handleImageLoaded(key)}
                    onError={() => handleImageError(key)}
                    className="w-full h-auto block select-none pointer-events-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Single paged viewer mode
        <div style={zoomStyle} className={`flex flex-col items-center py-4 ${filterStyle}`}>
          <div className="relative w-full min-h-[400px] flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
            {images[currentPageIndex] && (
              <img
                src={images[currentPageIndex].url}
                alt={`Page ${currentPageIndex + 1}`}
                className="max-h-[85vh] w-auto object-contain select-none pointer-events-none"
              />
            )}
          </div>

          {/* Paged navigation bar */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40"
            >
              Previous Page
            </button>
            <span className="text-xs font-mono text-zinc-400">
              {currentPageIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1))}
              disabled={currentPageIndex === images.length - 1}
              className="px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        </div>
      )}

      {/* Chapter Transition Footer */}
      <div className="w-full max-w-3xl my-10 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onPrevChapter}
          disabled={!hasPrevChapter}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono transition-colors ${
            hasPrevChapter
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              : 'bg-zinc-950 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Chapter</span>
        </button>

        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          End of Chapter ({images.length} Pages)
        </span>

        <button
          onClick={onNextChapter}
          disabled={!hasNextChapter}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
            hasNextChapter
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-zinc-950 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <span>Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
