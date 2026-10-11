'use client';

import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-zinc-400 tracking-wider">INITIALIZING SANKAVERSE...</span>
    </div>
  ),
});

export default function Page() {
  return <ClientApp />;
}
