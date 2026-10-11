import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  onConfirm,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="relative w-full max-w-md p-6 bg-zinc-950 border border-red-600/70 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.35)] overflow-hidden">
        {/* Cyberpunk top glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-500 font-semibold">
              Restricted Area
            </span>
            <h2 id="age-gate-title" className="text-lg font-bold text-zinc-100">
              Adult Content Confirmation (18+)
            </h2>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-zinc-300 leading-relaxed border-t border-b border-zinc-900 py-4">
          <p>
            You are about to enable <strong className="text-red-400">NSFW Mode</strong>.
            This module grants access to uncensored Hentai, JAV/3D, and adult anime content from Nekopoi.
          </p>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/80 border border-amber-900/40 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              By proceeding, you certify that you are at least 18 years of age or the age of majority in your jurisdiction.
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onDecline}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel / Exit</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 border border-red-500 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Am 18+ (Unlock)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
