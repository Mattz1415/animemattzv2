import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tv, Sparkles, BookOpen, Calendar, BookmarkCheck, Flame } from 'lucide-react';
import { useNsfwSafeGate } from '../../hooks/useNsfwSafeGate';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { isNsfwUnlocked } = useNsfwSafeGate();

  const links = [
    { label: 'Anime', href: '/', icon: Tv },
    { label: 'Donghua', href: '/donghua', icon: Sparkles },
    { label: 'Comics', href: '/comics', icon: BookOpen },
    { label: 'Schedule', href: '/schedule', icon: Calendar },
    { label: 'Library', href: '/library', icon: BookmarkCheck },
  ];

  if (isNsfwUnlocked) {
    links.push({ label: '18+', href: '/nsfw', icon: Flame });
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around safe-bottom">
      {links.map((link) => {
        const isActive = location.pathname === link.href;
        const Icon = link.icon;
        const is18Plus = link.label === '18+';

        return (
          <Link
            key={link.href}
            to={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              isActive
                ? is18Plus
                  ? 'text-red-400 font-semibold'
                  : 'text-red-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] font-medium leading-none">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
