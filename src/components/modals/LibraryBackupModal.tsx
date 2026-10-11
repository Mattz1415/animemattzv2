import React, { useRef, useState } from 'react';
import { Download, Upload, X, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';

interface LibraryBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported?: () => void;
}

export const LibraryBackupModal: React.FC<LibraryBackupModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const backupData = {
        bookmarks: localStorage.getItem('sankaverse_bookmarks') || '[]',
        watchHistory: localStorage.getItem('sankaverse_watch_history') || '[]',
        readingHistory: localStorage.getItem('sankaverse_reading_history') || '[]',
        exportedAt: new Date().toISOString(),
        version: '2.0-CYBER',
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sankaverse-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Library exported successfully!');
    } catch (e) {
      console.error(e);
      setStatusMessage('Export failed.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.bookmarks) localStorage.setItem('sankaverse_bookmarks', parsed.bookmarks);
        if (parsed.watchHistory) localStorage.setItem('sankaverse_watch_history', parsed.watchHistory);
        if (parsed.readingHistory) localStorage.setItem('sankaverse_reading_history', parsed.readingHistory);

        setStatusMessage('Library restored successfully! Refreshing...');
        onDataImported?.();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error(err);
        setStatusMessage('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Library Data Backup
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Export your bookmarks, anime watch history, and comic reading logs into an offline JSON backup file, or restore data from an existing backup.
        </p>

        {statusMessage && (
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors gap-2"
          >
            <Download className="w-6 h-6 text-red-500" />
            <span className="text-xs font-mono font-semibold">Export Backup</span>
            <span className="text-[10px] text-zinc-500 font-mono">Download .json</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors gap-2"
          >
            <Upload className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-mono font-semibold">Import Backup</span>
            <span className="text-[10px] text-zinc-500 font-mono">Upload .json</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
