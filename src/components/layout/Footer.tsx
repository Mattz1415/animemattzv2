import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Radio, Terminal, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-zinc-900 bg-zinc-950 text-zinc-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center font-black text-xs text-white">
              SV
            </div>
            <span className="font-bold text-zinc-100 tracking-wider">SANKAVERSE</span>
            <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
              v2.0-CYBER
            </span>
          </div>
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
            High-performance streaming & comic reading client for Sanka Vollerei REST API.
            Rate limit guarded at 45 requests/minute with persistent offline caching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Desustream Player</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span>Age-Gate Guarded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>TanStack v5 Cache</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 font-mono">
        <p>© {new Date().getFullYear()} SankaVerse. Powered by Sanka Vollerei REST API.</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-zinc-400 transition-colors">Anime</Link>
          <Link to="/donghua" className="hover:text-zinc-400 transition-colors">Donghua</Link>
          <Link to="/comics" className="hover:text-zinc-400 transition-colors">Comics</Link>
          <Link to="/schedule" className="hover:text-zinc-400 transition-colors">Schedule</Link>
        </div>
      </div>
    </footer>
  );
};
