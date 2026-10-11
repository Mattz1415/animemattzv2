import React, { useState } from 'react';
import { Share2, Copy, Check, X, QrCode, Smartphone } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
}) => {
  const [copied, setCopied] = useState(false);
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Generate QR code URL using public QR server or SVG
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetUrl)}&bgcolor=09090b&color=dc2626&margin=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Share Transmission
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 font-semibold truncate px-2">
          {title}
        </p>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-850">
          <div className="p-2 bg-zinc-950 rounded-lg border border-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <img
              src={qrUrl}
              alt="Scan QR code to view on mobile"
              className="w-40 h-40 object-contain rounded"
              loading="lazy"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan to continue on smartphone</span>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={targetUrl}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              copied
                ? 'bg-cyan-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
