import React from 'react';
import {
  Scroll,
  ShieldAlert,
  Anchor,
  Sun,
  Sword,
  Mountain,
  Skull,
  Flame,
  Sparkle,
  Zap,
  Users,
  Sparkles,
} from 'lucide-react';
import { HEROES } from '../data/heroes';

interface FighterAvatarProps {
  heroId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  isKo?: boolean;
  className?: string;
}

const colorStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  amber: {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-700',
    border: 'border-amber-400',
    text: 'text-amber-100',
    glow: 'shadow-amber-500/20',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-amber-800',
    border: 'border-orange-400',
    text: 'text-orange-100',
    glow: 'shadow-orange-500/20',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-600 to-blue-800',
    border: 'border-cyan-400',
    text: 'text-cyan-100',
    glow: 'shadow-cyan-500/20',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    border: 'border-yellow-300',
    text: 'text-yellow-100',
    glow: 'shadow-yellow-500/20',
  },
  slate: {
    bg: 'bg-gradient-to-br from-slate-700 to-slate-900',
    border: 'border-slate-500',
    text: 'text-slate-100',
    glow: 'shadow-slate-500/20',
  },
  stone: {
    bg: 'bg-gradient-to-br from-stone-600 to-stone-800',
    border: 'border-stone-400',
    text: 'text-stone-100',
    glow: 'shadow-stone-500/20',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-600 to-indigo-900',
    border: 'border-purple-400',
    text: 'text-purple-100',
    glow: 'shadow-purple-500/20',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-600 to-rose-900',
    border: 'border-red-400',
    text: 'text-red-100',
    glow: 'shadow-red-500/20',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500 to-pink-700',
    border: 'border-rose-300',
    text: 'text-rose-100',
    glow: 'shadow-rose-500/20',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-800',
    border: 'border-blue-400',
    text: 'text-blue-100',
    glow: 'shadow-blue-500/20',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    border: 'border-emerald-400',
    text: 'text-emerald-100',
    glow: 'shadow-emerald-500/20',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-500 to-emerald-700',
    border: 'border-teal-300',
    text: 'text-teal-100',
    glow: 'shadow-teal-500/20',
  },
};

export const FighterAvatar: React.FC<FighterAvatarProps> = ({
  heroId,
  size = 'md',
  showLabel = false,
  isKo = false,
  className = '',
}) => {
  const [extIndex, setExtIndex] = React.useState(0);
  const extensions = ['.jpg', '.png', '.webp'];
  const hero = HEROES.find((h) => h.id === heroId) || HEROES[0];
  const style = colorStyles[hero.avatarColor] || colorStyles.slate;

  // Reset extIndex if heroId changes
  React.useEffect(() => {
    setExtIndex(0);
  }, [heroId]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }[size];

  const renderIcon = () => {
    switch (hero.iconName) {
      case 'scroll':
        return <Scroll className={iconSizes} />;
      case 'shield-alert':
        return <ShieldAlert className={iconSizes} />;
      case 'anchor':
        return <Anchor className={iconSizes} />;
      case 'sun':
        return <Sun className={iconSizes} />;
      case 'sword':
        return <Sword className={iconSizes} />;
      case 'mountain':
        return <Mountain className={iconSizes} />;
      case 'skull':
        return <Skull className={iconSizes} />;
      case 'flame':
        return <Flame className={iconSizes} />;
      case 'sparkle':
        return <Sparkle className={iconSizes} />;
      case 'zap':
        return <Zap className={iconSizes} />;
      case 'users':
        return <Users className={iconSizes} />;
      case 'sparkles':
      default:
        return <Sparkles className={iconSizes} />;
    }
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-2xl border-2 shadow-lg overflow-hidden ${sizeClasses} ${
          isKo
            ? 'bg-slate-800 border-slate-600 text-slate-500 grayscale opacity-60'
            : `${style.bg} ${style.border} ${style.text} ${style.glow}`
        } transition-all duration-300 shrink-0`}
      >
        {extIndex < extensions.length ? (
          <img
              src={`${import.meta.env.BASE_URL}heroes/${hero.id}${extensions[extIndex]}`}
            alt={hero.name}
            onError={() => setExtIndex((prev) => prev + 1)}
            className={`w-full h-full object-cover rounded-xl ${isKo ? 'grayscale' : ''}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          renderIcon()
        )}
        {isKo && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 rounded-2xl">
            <span className="text-red-500 font-extrabold text-[10px] sm:text-xs tracking-widest border border-red-500/50 bg-red-950/80 px-1 py-0.5 rounded">
              K.O.
            </span>
          </div>
        )}
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold tracking-tight text-center truncate max-w-[100px] ${
            isKo ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {hero.name}
        </span>
      )}
    </div>
  );
};
