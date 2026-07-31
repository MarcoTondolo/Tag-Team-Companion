import React, { useState } from 'react';
import {
  Users,
  Shield,
  Layers,
  Trophy,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Medal,
  Swords,
  Flame,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Player, Match, Language } from '../types';
import { getTranslation } from '../data/translations';
import { calculateAllStats } from '../utils/stats';
import { getHeroById } from '../data/heroes';
import { FighterAvatar } from './FighterAvatar';

interface StatsViewProps {
  players: Player[];
  matches: Match[];
  language: Language;
  initialPlayerFilterId?: string;
}

export const StatsView: React.FC<StatsViewProps> = ({
  players,
  matches,
  language,
  initialPlayerFilterId,
}) => {
  const t = getTranslation(language);

  // 3 tabs: 'players' | 'characters' | 'compositions'
  const [activeTab, setActiveTab] = useState<'players' | 'characters' | 'compositions'>('players');

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState<string>(
    initialPlayerFilterId || 'all'
  );
  const [sortBy, setSortBy] = useState<'winrate' | 'matches' | 'wins'>('matches');

  // Expanded player detail card ID
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(
    initialPlayerFilterId || null
  );

  // Overall Global stats (for KPI summary cards)
  const overallStats = calculateAllStats(players, matches);

  // Filtered stats (for Characters & Compositions when filtering by player)
  const filteredStats = calculateAllStats(players, matches, selectedPlayerFilter);

  // Derive Top KPI Champions
  const topPlayer = overallStats.playerStats.length > 0
    ? [...overallStats.playerStats].sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)[0]
    : null;

  const topHero = overallStats.heroStats
      .filter(h => h.matchesPlayed > 0)
      .map(h => ({
        ...h,
        heroScore: (h.wins * 100) + h.winRate
      }))
      .sort((a, b) =>
          b.heroScore - a.heroScore
      )[0] ?? null;

  const topComp = overallStats.compStats.length > 0
    ? [...overallStats.compStats].filter(c => c.matchesPlayed > 0).sort((a, b) => b.winRate - a.winRate || b.matchesPlayed - a.matchesPlayed)[0]
    : null;

  // Sorting function
  const sortStatsList = <T extends { winRate: number; matchesPlayed: number; wins: number }>(list: T[]): T[] => {
    return [...list].sort((a, b) => {
      if (sortBy === 'winrate') {
        return b.winRate - a.winRate || b.matchesPlayed - a.matchesPlayed;
      }
      if (sortBy === 'wins') {
        return b.wins - a.wins || b.winRate - a.winRate;
      }
      return b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            {t.statsView.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'it'
              ? 'Analizza le prestazioni dettagliate per Giocatore, Eroe e Tag Team.'
              : 'Analyze winrates and performance by Player, Hero, and Tag Team.'}
          </p>
        </div>

        {/* 3 Main Tabs Pills */}
        <div className="grid grid-cols-3 w-full md:w-auto bg-slate-950 p-1 rounded-2xl border border-slate-800/80 gap-1">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{t.statsView.tabPlayers}</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{t.statsView.tabCharacters}</span>
          </button>

          <button
            onClick={() => setActiveTab('compositions')}
            className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compositions'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{t.statsView.tabCompositions}</span>
          </button>
        </div>
      </div>

      {/* GLOBAL SUMMARY KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Matches */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.statsView.totalMatches}
            </span>
            <Swords className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {matches.length}
          </div>
        </div>

        {/* Top Player */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.statsView.topPlayer}
            </span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          {topPlayer && topPlayer.matchesPlayed > 0 ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-extrabold text-white text-sm truncate">
                {topPlayer.playerName}
              </span>
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 ml-auto">
                {topPlayer.winRate}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">-</span>
          )}
        </div>

        {/* Top Hero */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.statsView.mostPickedHero}
            </span>
            <Medal className="w-4 h-4 text-amber-400" />
          </div>
          {topHero ? (
            <div className="flex items-center gap-2 truncate">
              <FighterAvatar heroId={topHero.heroId} size="sm" />
              <span className="font-extrabold text-white text-xs truncate">
                {topHero.heroName}
              </span>
              <span className="text-[11px] font-bold text-amber-400 ml-auto">
                {topHero.winRate}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">-</span>
          )}
        </div>

        {/* Best Tag Team Comp */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.statsView.bestComp}
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          {topComp ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-extrabold text-white text-xs truncate">
                {topComp.compName}
              </span>
              <span className="text-[11px] font-bold text-amber-400 ml-auto">
                {topComp.winRate}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">-</span>
          )}
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Filter by Player Dropdown (When in Characters or Compositions Tab) */}
          {activeTab !== 'players' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                {t.statsView.filterByPlayer}
              </span>
              <select
                value={selectedPlayerFilter}
                onChange={(e) => setSelectedPlayerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">{t.common.all}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Control Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
              {t.statsView.sortBy}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="matches">{t.statsView.sortMatches}</option>
              <option value="winrate">{t.statsView.sortWinrate}</option>
              <option value="wins">{t.statsView.sortWins}</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: PLAYERS TAB */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          {sortStatsList(overallStats.playerStats)
            .filter((p) => p.playerName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((pStat) => {
              const isExpanded = expandedPlayerId === pStat.playerId;

              return (
                <div
                  key={pStat.playerId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all hover:border-slate-700"
                >
                  {/* Main Player Row Header */}
                  <div
                    onClick={() =>
                      setExpandedPlayerId(isExpanded ? null : pStat.playerId)
                    }
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 p-0.5 shadow-md flex-shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-lg">
                          {pStat.playerName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {pStat.playerName}
                          {pStat.winRate >= 60 && pStat.matchesPlayed >= 3 && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              🔥 Dominant
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {t.common.matchesPlayed}: {pStat.matchesPlayed}
                        </p>
                      </div>
                    </div>

                    {/* Stats pills & Winrate Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <div className="grid grid-cols-4 gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                              {t.common.wins}
                            </span>
                            <span className="font-extrabold text-emerald-400">
                              {pStat.wins}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                              {t.common.losses}
                            </span>
                            <span className="font-extrabold text-red-400">
                              {pStat.losses}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                              {t.common.draws}
                            </span>
                            <span className="font-extrabold text-slate-400">
                              {pStat.draws}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                              {t.common.winrate}
                            </span>
                            <span className="font-black text-amber-400">
                              {pStat.winRate}%
                            </span>
                          </div>
                        </div>

                        {/* Winrate Bar */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, pStat.winRate))}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-slate-400 p-2">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-amber-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILED BREAKDOWN */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/80 p-6 space-y-6 animate-in slide-in-from-top-2">
                      {/* Breakdown 1: Per Character */}
                      <div>
                        <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          {t.statsView.characterBreakdown}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.values(pStat.byCharacter).map((cDetail) => {
                            const heroObj = getHeroById(cDetail.heroId!);
                            if (!heroObj) return null;

                            return (
                              <div
                                key={cDetail.heroId}
                                className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3 shadow-sm"
                              >
                                <FighterAvatar heroId={heroObj.id} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {heroObj.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <span>
                                      {cDetail.wins}W - {cDetail.losses}L
                                    </span>
                                    <span className="font-bold text-amber-400 ml-auto">
                                      {cDetail.winRate}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {Object.keys(pStat.byCharacter).length === 0 && (
                            <p className="text-xs text-slate-500 italic col-span-full">
                              {t.common.noData}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Breakdown 2: Per Tag Team Composition */}
                      <div>
                        <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          {t.statsView.compositionBreakdown}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.values(pStat.byComposition).map((compDetail) => {
                            const parts = compDetail.compId!.split('_');
                            const h1 = getHeroById(parts[0]);
                            const h2 = getHeroById(parts[1]);

                            return (
                              <div
                                key={compDetail.compId}
                                className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3 shadow-sm"
                              >
                                <div className="flex items-center -space-x-2">
                                  {h1 && <FighterAvatar heroId={h1.id} size="sm" />}
                                  {h2 && <FighterAvatar heroId={h2.id} size="sm" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {h1?.name} & {h2?.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <span>
                                      {compDetail.wins}W - {compDetail.losses}L
                                    </span>
                                    <span className="font-bold text-amber-400 ml-auto">
                                      {compDetail.winRate}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {Object.keys(pStat.byComposition).length === 0 && (
                            <p className="text-xs text-slate-500 italic col-span-full">
                              {t.common.noData}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {overallStats.playerStats.length === 0 && (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              {t.common.noData}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHARACTERS TAB */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortStatsList(filteredStats.heroStats)
            .filter((h) => h.heroName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((hStat) => {
              const heroObj = getHeroById(hStat.heroId);
              if (!heroObj) return null;

              return (
                <div
                  key={hStat.heroId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <FighterAvatar heroId={heroObj.id} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{heroObj.name}</h3>
                      <p className="text-[11px] text-slate-400 mb-1 line-clamp-1">
                        {heroObj.title[language]}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          HP: {heroObj.startingHp}
                        </span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          Power: {heroObj.startingPower}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.matches}
                        </span>
                        <span className="font-extrabold text-white">
                          {hStat.matchesPlayed}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.wins}
                        </span>
                        <span className="font-extrabold text-emerald-400">
                          {hStat.wins}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.losses}
                        </span>
                        <span className="font-extrabold text-red-400">
                          {hStat.losses}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.winrate}
                        </span>
                        <span className="font-black text-amber-400">
                          {hStat.winRate}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, hStat.winRate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 3: COMPOSITIONS TAB */}
      {activeTab === 'compositions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortStatsList(filteredStats.compStats)
            .filter((c) => c.compName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((cStat) => {
              const h1 = getHeroById(cStat.heroIds[0]);
              const h2 = getHeroById(cStat.heroIds[1]);

              return (
                <div
                  key={cStat.compId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-3">
                      {h1 && <FighterAvatar heroId={h1.id} size="md" />}
                      {h2 && <FighterAvatar heroId={h2.id} size="md" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-white text-sm truncate">
                        {cStat.compName}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">Tag Team Duo</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.matches}
                        </span>
                        <span className="font-extrabold text-white">
                          {cStat.matchesPlayed}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.wins}
                        </span>
                        <span className="font-extrabold text-emerald-400">
                          {cStat.wins}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.losses}
                        </span>
                        <span className="font-extrabold text-red-400">
                          {cStat.losses}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                          {t.common.winrate}
                        </span>
                        <span className="font-black text-amber-400">
                          {cStat.winRate}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, cStat.winRate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

          {filteredStats.compStats.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              {t.common.noData}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

