import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { onRateLimitExceeded } from '../../api/axiosClient';

export interface ToastMessage {
  id: string;
  type: 'rate-limit' | 'info' | 'error' | 'success';
  title: string;
  message: string;
}

// Global toast trigger
type ToastListener = (toast: Omit<ToastMessage, 'id'>) => void;
const toastListeners: Set<ToastListener> = new Set();

export const showToast = (toast: Omit<ToastMessage, 'id'>) => {
  toastListeners.forEach((fn) => fn(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Listen to 429 rate limit errors from axios
    const unsubscribe429 = onRateLimitExceeded((msg) => {
      setToasts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'rate-limit',
          title: 'Rate Limit Warning [HTTP 429]',
          message: msg,
        },
      ]);
    });

    const handleCustomToast: ToastListener = (toast) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    toastListeners.add(handleCustomToast);

    return () => {
      unsubscribe429();
      toastListeners.delete(handleCustomToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isRateLimit = toast.type === 'rate-limit';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              isRateLimit
                ? 'bg-zinc-950/95 border-red-600/60 shadow-[0_0_25px_rgba(220,38,38,0.25)]'
                : toast.type === 'error'
                ? 'bg-zinc-950/95 border-red-500/50'
                : toast.type === 'success'
                ? 'bg-zinc-950/95 border-cyan-500/50'
                : 'bg-zinc-950/95 border-zinc-800'
            }`}
            role="alert"
          >
            <div className="mt-0.5 flex-shrink-0">
              {isRateLimit ? (
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <Info className="w-5 h-5 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                {toast.title}
                {isRateLimit && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                    45 req/min
                  </span>
                )}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
