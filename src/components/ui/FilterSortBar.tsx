import React from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';

export type SortOption = 'latest' | 'score' | 'title';
export type FormatFilter = 'all' | 'series' | 'donghua';

interface FilterSortBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  formatFilter?: FormatFilter;
  onFormatChange?: (format: FormatFilter) => void;
  totalCount?: number;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  sortBy,
  onSortChange,
  formatFilter = 'all',
  onFormatChange,
  totalCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-850">
      {/* Left: Total counts & formats */}
      <div className="flex items-center gap-3">
        {totalCount !== undefined && (
          <span className="text-xs font-mono text-zinc-400">
            Showing <strong className="text-white">{totalCount}</strong> titles
          </span>
        )}

        {onFormatChange && (
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => onFormatChange('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                formatFilter === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFormatChange('series')}
              className={`px-2.5 py-1 rounded transition-colors ${
                formatFilter === 'series'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Anime
            </button>
            <button
              onClick={() => onFormatChange('donghua')}
              className={`px-2.5 py-1 rounded transition-colors ${
                formatFilter === 'donghua'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Donghua
            </button>
          </div>
        )}
      </div>

      {/* Right: Sorting Select */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs font-mono text-zinc-500 hidden sm:inline">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-600"
        >
          <option value="latest">Latest Release</option>
          <option value="score">Highest Rating</option>
          <option value="title">Alphabetical (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
