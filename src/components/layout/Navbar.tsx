import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Tv,
  Calendar,
  BookOpen,
  BookmarkCheck,
  Flame,
  Layers,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  Palette,
  Dices,
} from 'lucide-react';
import { useNsfwSafeGate } from '../../hooks/useNsfwSafeGate';
import { useCyberSound } from '../../hooks/useCyberSound';
import { useAccentTheme, AccentColor } from '../../hooks/useAccentTheme';
import { AgeGateModal } from '../modals/AgeGateModal';
import { ShortcutsModal } from '../modals/ShortcutsModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [navSearch, setNavSearch] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const { isNsfwUnlocked, isModalOpen, triggerToggle, confirmAge, declineAge } = useNsfwSafeGate();
  const { isMuted, toggleMute, playBlip } = useCyberSound();
  const { accent, changeAccent } = useAccentTheme();

  // Global keyboard shortcuts (/ -> focus search, ? -> open shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim().length >= 2) {
      playBlip('click');
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const handleSurpriseMe = () => {
    playBlip('success');
    const popularPicks = [
      'one-piece-sub-indo',
      'bleach-thousand-year-blood-war-sub-indo',
      'jujutsu-kaisen-s2-sub-indo',
      'sousou-no-frieren-sub-indo',
      'solo-leveling-sub-indo',
      'kimetsu-no-yaiba-sub-indo',
      'boku-no-hero-academia-sub-indo',
      'shingeki-no-kyojin-sub-indo',
      'naruto-shippuden-sub-indo',
      'hunter-x-hunter-sub-indo',
    ];
    const pick = popularPicks[Math.floor(Math.random() * popularPicks.length)];
    navigate(`/anime/${pick}`);
  };

  const navLinks = [
    { label: 'Anime', href: '/', icon: Tv },
    { label: 'Donghua', href: '/donghua', icon: Sparkles },
    { label: 'Comics', href: '/comics', icon: BookOpen },
    { label: 'Schedule', href: '/schedule', icon: Calendar },
    { label: 'Ongoing', href: '/ongoing', icon: Flame },
    { label: 'Genres', href: '/genres', icon: Layers },
    { label: 'Library', href: '/library', icon: BookmarkCheck },
  ];

  const accents: { id: AccentColor; label: string; colorClass: string }[] = [
    { id: 'red', label: 'Cyber Red', colorClass: 'bg-red-600' },
    { id: 'cyan', label: 'Neon Cyan', colorClass: 'bg-cyan-500' },
    { id: 'emerald', label: 'Matrix Emerald', colorClass: 'bg-emerald-500' },
    { id: 'violet', label: 'Electric Violet', colorClass: 'bg-purple-500' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              onClick={() => playBlip('click')}
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.9)] transition-shadow">
                <span className="text-white font-black text-sm tracking-wider">SV</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-zinc-200 to-red-400 bg-clip-text text-transparent group-hover:to-red-300 transition-colors">
                  SANKAVERSE
                </span>
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase -mt-1">
                  CYBER ANIME & COMIC
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => playBlip('click')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      isActive
                        ? 'text-white bg-zinc-900 border border-zinc-800 shadow-inner'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Dynamic NSFW Link (if unlocked) */}
              {isNsfwUnlocked && (
                <Link
                  to="/nsfw"
                  onClick={() => playBlip('switch')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    location.pathname === '/nsfw'
                      ? 'text-red-300 bg-red-950/80 border border-red-700/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                      : 'text-red-400 hover:text-red-300 hover:bg-red-950/40'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>NSFW (18+)</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Search bar & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-44 md:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search (press /)..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/40 transition-all font-mono"
              />
            </form>

            {/* Mobile Search Button */}
            <Link
              to="/search"
              aria-label="Search"
              onClick={() => playBlip('click')}
              className="sm:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Surprise Me Randomiser */}
            <button
              onClick={handleSurpriseMe}
              title="Surprise Me (Random Series)"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              <Dices className="w-4 h-4 animate-spin-slow" />
              <span className="hidden xl:inline text-[11px] font-bold">Surprise Me</span>
            </button>

            {/* Cyber Sound FX Toggle Button */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Cyber Audio Sound FX' : 'Mute Cyber Audio Sound FX'}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden sm:block"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Theme Color Picker Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemePickerOpen(!themePickerOpen)}
                title="Change Cyber Accent Color"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden sm:block"
              >
                <Palette className="w-4 h-4" />
              </button>

              {themePickerOpen && (
                <div className="absolute right-0 mt-2 p-2 w-40 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 space-y-1 animate-in fade-in">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 block">
                    Cyber Accent
                  </span>
                  {accents.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        changeAccent(acc.id);
                        playBlip('switch');
                        setThemePickerOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        accent === acc.id ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${acc.colorClass}`} />
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Dialog Trigger */}
            <button
              onClick={() => {
                playBlip('click');
                setShortcutsOpen(true);
              }}
              title="Keyboard Shortcuts (?)"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:block"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* NSFW Gate Button */}
            <button
              onClick={() => {
                playBlip('switch');
                triggerToggle();
              }}
              title={isNsfwUnlocked ? 'Disable 18+ NSFW Mode' : 'Enable 18+ NSFW Mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                isNsfwUnlocked
                  ? 'bg-red-950/80 border-red-600/80 text-red-300 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {isNsfwUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden md:inline font-semibold">18+ UNLOCKED</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden md:inline">NSFW LOCKED</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Age Gate Confirmation Modal */}
      <AgeGateModal
        isOpen={isModalOpen}
        onConfirm={confirmAge}
        onDecline={declineAge}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
};

export default Navbar;
