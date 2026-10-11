import React from 'react';
import { Command, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Quick Focus Universal Search' },
    { key: 'J', description: 'Next Episode or Comic Page' },
    { key: 'K', description: 'Previous Episode or Comic Page' },
    { key: 'T', description: 'Toggle Cinema Theater Lights Out' },
    { key: 'F', description: 'Toggle Browser Fullscreen Mode' },
    { key: 'B', description: 'Bookmark / Favorite Current Title' },
    { key: 'Esc', description: 'Close Open Modals / Exit Player' },
    { key: '?', description: 'Display Keyboard Shortcuts Dialog' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-900 text-xs font-mono"
            >
              <span className="text-zinc-300">{sc.description}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-850 text-cyan-400 font-bold border border-zinc-700/60">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-zinc-500 font-mono text-center pt-2">
          Tip: Press <kbd className="text-zinc-300 font-bold">?</kbd> at any time to open this cheatsheet.
        </p>
      </div>
    </div>
  );
};
