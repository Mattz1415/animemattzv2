import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, ExternalLink, HardDrive } from 'lucide-react';
import { DownloadQualityGroup } from '../../types/anime';

interface DownloadAccordionProps {
  downloadQualities?: DownloadQualityGroup[];
}

export const DownloadAccordion: React.FC<DownloadAccordionProps> = ({
  downloadQualities = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!downloadQualities || downloadQualities.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Direct Episode Downloads & Mirrors
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({downloadQualities.length} Resolutions)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="text-xs font-mono">{isOpen ? 'Hide Mirrors' : 'Show Mirrors'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-zinc-800/60 space-y-3 mt-2">
          {downloadQualities.map((group, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-mono font-semibold text-cyan-300">
                  {group.title}
                </span>
                {group.size && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    [{group.size}]
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {group.urls?.map((mirror, mIdx) => (
                  <a
                    key={mIdx}
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                  >
                    <span>{mirror.title}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
