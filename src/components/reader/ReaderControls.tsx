import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Columns,
  Rows,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Eye,
  Keyboard,
  BookOpen,
} from 'lucide-react';

export type ReaderFilter = 'normal' | 'invert' | 'sepia';

interface ReaderControlsProps {
  currentChapterTitle: string;
  comicTitle?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  readingMode: 'cascade' | 'paged';
  onToggleMode: (mode: 'cascade' | 'paged') => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  filterMode: ReaderFilter;
  onFilterChange: (newFilter: ReaderFilter) => void;
  onOpenShortcuts?: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  currentChapterTitle,
  comicTitle,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  readingMode,
  onToggleMode,
  currentPage = 1,
  totalPages = 1,
  onToggleFullscreen,
  isFullscreen = false,
  zoom,
  onZoomChange,
  filterMode,
  onFilterChange,
  onOpenShortcuts,
}) => {
  return (
    <div className="sticky top-16 z-30 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title and breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="flex items-baseline gap-2 truncate">
            {comicTitle && (
              <span className="text-xs text-zinc-400 font-mono hidden md:inline truncate max-w-[200px]">
                {comicTitle}
              </span>
            )}
            {comicTitle && <span className="text-zinc-600 hidden md:inline">/</span>}
            <span className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
              {currentChapterTitle}
            </span>
          </div>
        </div>

        {/* Center / Chapter Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              hasPrev
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60'
                : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Ch</span>
          </button>

          {readingMode === 'paged' && totalPages > 1 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span>{currentPage}</span>
              <span className="text-zinc-500">/</span>
              <span>{totalPages}</span>
            </div>
          )}

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
              hasNext
                ? 'bg-red-600 hover:bg-red-500 text-white font-semibold shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Next Ch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolset (Zoom, Eye-care filter, Mode, Fullscreen) */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onZoomChange(Math.max(70, zoom - 15))}
              title="Zoom Out"
              className="p-1 text-zinc-400 hover:text-white"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-zinc-300 px-1.5">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(150, zoom + 15))}
              title="Zoom In"
              className="p-1 text-zinc-400 hover:text-white"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Eye-care Filter Cycle (Normal -> Invert -> Sepia) */}
          <button
            onClick={() => {
              const next =
                filterMode === 'normal'
                  ? 'invert'
                  : filterMode === 'invert'
                  ? 'sepia'
                  : 'normal';
              onFilterChange(next);
            }}
            title={`Eye-Care Filter: ${filterMode.toUpperCase()} (Click to cycle)`}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
              filterMode !== 'normal'
                ? 'bg-amber-950 text-amber-300 border-amber-700/60 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Mode Switch (Cascade vs Paged) */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => onToggleMode('cascade')}
              title="Continuous Webtoon Cascade"
              className={`p-1.5 rounded-md transition-colors ${
                readingMode === 'cascade' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleMode('paged')}
              title="Single Paged Mode"
              className={`p-1.5 rounded-md transition-colors ${
                readingMode === 'paged' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Shortcuts button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:block"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
