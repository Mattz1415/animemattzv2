import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'cyan' | 'zinc' | 'amber';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'zinc', className = '' }) => {
  const variantStyles = {
    red: 'bg-red-950/80 text-red-400 border border-red-800/60 shadow-[0_0_12px_rgba(220,38,38,0.25)]',
    cyan: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    zinc: 'bg-zinc-900/90 text-zinc-300 border border-zinc-700/60',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono tracking-wider uppercase rounded ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
