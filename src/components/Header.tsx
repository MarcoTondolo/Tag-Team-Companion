import React from 'react';
import { Swords, PlusCircle, Users, BarChart3, History, Globe } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  hasActiveMatch: boolean;
}

const AppLogo: React.FC = () => {
  const [srcIndex, setSrcIndex] = React.useState(0);
  const base = import.meta.env.BASE_URL;
  const sources = [`${base}icon.jpg`, `${base}icon.png`, `${base}favicon.ico`];

  if (srcIndex >= sources.length) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-indigo-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          <Swords className="w-5 h-5 text-amber-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg group-hover:scale-105 transition-transform bg-slate-950">
      <img
        src={sources[srcIndex]}
        alt="App Logo"
        onError={() => setSrcIndex((prev) => prev + 1)}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  hasActiveMatch,
}) => {
  const t = getTranslation(language);

  const navItems = [
    ...(hasActiveMatch
      ? [{ id: 'match', label: t.nav.activeMatch, icon: Swords, badge: true }]
      : []),
    { id: 'draft', label: t.nav.newMatch, icon: PlusCircle },
    { id: 'stats', label: t.nav.stats, icon: BarChart3 },
    { id: 'players', label: t.nav.players, icon: Users },
    { id: 'history', label: t.nav.history, icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div
            onClick={() => onTabChange(hasActiveMatch ? 'match' : 'draft')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Logo Image or Fallback */}
            <AppLogo />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Tag Team <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">Companion</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
                  )}
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => onLanguageChange('it')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                  language === 'it'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                IT
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
