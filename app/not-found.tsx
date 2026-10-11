import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 font-mono font-bold text-xl mb-4">
        404
      </div>
      <h2 className="text-xl font-bold font-mono text-white mb-2">SIGNAL LOST IN THE CYBERNET</h2>
      <p className="text-xs font-mono text-zinc-400 max-w-sm mb-6">
        The requested coordinates do not correspond to any active anime or comic transmission.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
      >
        Re-engage Nexus Home
      </Link>
    </div>
  );
}
