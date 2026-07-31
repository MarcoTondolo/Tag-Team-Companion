import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  Heart,
  Zap,
  RotateCcw,
  Flag,
  Award,
  Sparkles,
  X,
  Plus,
  Minus,
  Check,
  Skull,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerTeam, MatchHeroState, Match, Language, AiDifficulty, GameMode } from '../types';
import { HEROES, getHeroById } from '../data/heroes';
import { getTranslation } from '../data/translations';
import { FighterAvatar } from './FighterAvatar';
import { BotAiAssistantCard } from './BotAiAssistantCard';

interface ActiveMatchProps {
  team1: PlayerTeam;
  team2: PlayerTeam;
  isVsAi?: boolean;
  aiDifficulty?: AiDifficulty;
  gameMode?: GameMode;
  onSaveMatch: (match: Match) => void;
  language: Language;
  onCancelMatch: () => void;
}

export const ActiveMatch: React.FC<ActiveMatchProps> = ({
  team1: initialTeam1,
  team2: initialTeam2,
  isVsAi = false,
  aiDifficulty = 'normal',
  gameMode,
  onSaveMatch,
  language,
  onCancelMatch,
}) => {
  const t = getTranslation(language);
  const activeAiDifficulty: AiDifficulty = aiDifficulty as AiDifficulty;

  // Live state for team 1 and team 2
  const [team1, setTeam1] = useState<PlayerTeam>(initialTeam1);
  const [team2, setTeam2] = useState<PlayerTeam>(initialTeam2);

  // 3-dots top right menu state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<'cancel' | 'reset' | 'draw' | null>(null);

  // End match modal state
  const [winnerModal, setWinnerModal] = useState<{
    isOpen: boolean;
    winnerPlayerId: string | null;
    isDraw: boolean;
  }>({
    isOpen: false,
    winnerPlayerId: null,
    isDraw: false,
  });

  // Track match start time
  const [startTime] = useState<string>(new Date().toISOString());

  // Check if both heroes in a team are KO
  const isTeam1AllKo = team1.heroes.every((h) => h.isKo);
  const isTeam2AllKo = team2.heroes.every((h) => h.isKo);

  useEffect(() => {
    if (isTeam1AllKo && isTeam2AllKo) {
      triggerWinnerModal(null, true);
    } else if (isTeam1AllKo) {
      triggerWinnerModal(team2.playerId, false);
    } else if (isTeam2AllKo) {
      triggerWinnerModal(team1.playerId, false);
    }
  }, [isTeam1AllKo, isTeam2AllKo]);

  const triggerWinnerModal = (winnerPlayerId: string | null, isDraw: boolean) => {
    setWinnerModal({ isOpen: true, winnerPlayerId, isDraw });
    if (!isDraw) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log('Confetti effect', e);
      }
    }
  };

  // Helper to update hero state
  const updateHero = (
    teamNumber: 1 | 2,
    heroIndex: number,
    updater: (hero: MatchHeroState) => MatchHeroState
  ) => {
    const setTeam = teamNumber === 1 ? setTeam1 : setTeam2;
    setTeam((prevTeam) => {
      const newHeroes = [...prevTeam.heroes];
      const updated = updater(newHeroes[heroIndex]);

      // Check Fey Folk KO logic
      if (updated.heroId === 'fey_folk' && updated.feyFolkHp) {
        const totalFeyHp =
          updated.feyFolkHp.elf + updated.feyFolkHp.gnome + updated.feyFolkHp.fairy;
        updated.isKo = totalFeyHp <= 0;
        updated.currentHp = totalFeyHp;
      } else if (updated.heroId !== 'fey_folk') {
        updated.isKo = updated.currentHp <= 0;
      }

      newHeroes[heroIndex] = updated;
      return { ...prevTeam, heroes: newHeroes };
    });
  };

  // HP Change helper
  const changeHp = (teamNumber: 1 | 2, heroIndex: number, delta: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const heroData = getHeroById(hero.heroId);
      const maxHpCap = heroData?.maxHp || 99;

      if (hero.heroId === 'fey_folk' && hero.feyFolkHp) {
        // Distribute delta across fey folk parts (elf first, gnome second, fairy last)
        let { elf, gnome, fairy } = hero.feyFolkHp;
        if (delta > 0) {
          // Heal
          if (fairy < 3) fairy = Math.min(3, fairy + delta);
          else if (gnome < 4) gnome = Math.min(4, gnome + delta);
          else if (elf < 5) elf = Math.min(5, elf + delta);
        } else {
          // Damage
          let remainingDamage = Math.abs(delta);
          if (fairy > 0) {
            const dmg = Math.min(fairy, remainingDamage);
            fairy -= dmg;
            remainingDamage -= dmg;
          }
          if (remainingDamage > 0 && gnome > 0) {
            const dmg = Math.min(gnome, remainingDamage);
            gnome -= dmg;
            remainingDamage -= dmg;
          }
          if (remainingDamage > 0 && elf > 0) {
            const dmg = Math.min(elf, remainingDamage);
            elf -= dmg;
          }
        }
        return {
          ...hero,
          feyFolkHp: { elf, gnome, fairy },
        };
      }

      const newHp = Math.max(0, hero.currentHp + delta);
      // Bodvar max HP cap is 15 in bear form or 11 base
      const maxLimit = hero.heroId === 'bodvar' && hero.isBearForm ? 15 : maxHpCap;
      const cappedHp = Math.min(maxLimit, newHp);

      return { ...hero, currentHp: cappedHp };
    });
  };

  // Fey Folk individual sub-tracker HP change
  const changeFeySubHp = (
    teamNumber: 1 | 2,
    heroIndex: number,
    part: 'elf' | 'gnome' | 'fairy',
    delta: number
  ) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      if (!hero.feyFolkHp) return hero;
      const limits = { elf: 5, gnome: 4, fairy: 3 };
      const current = hero.feyFolkHp[part];
      const next = Math.max(0, Math.min(limits[part], current + delta));

      return {
        ...hero,
        feyFolkHp: {
          ...hero.feyFolkHp,
          [part]: next,
        },
      };
    });
  };

  // Power Change helper (0 to N, no cap!)
  const changePower = (teamNumber: 1 | 2, heroIndex: number, delta: number) => {
    updateHero(teamNumber, heroIndex, (hero) => ({
      ...hero,
      currentPower: Math.max(0, hero.currentPower + delta),
    }));
  };

  // Bodvar Bear Transformation Mechanic:
  // "when becomes bear gains HP equal to his power and has a maximum of 15 HP"
  const handleBodvarTransform = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const addedHp = hero.currentPower;
      const newHp = Math.min(15, hero.currentHp + addedHp);
      return {
        ...hero,
        currentHp: newHp,
        isBearForm: true,
      };
    });
  };

  // Reset match to initial draft stats
  const executeResetMatch = () => {
    setTeam1(initialTeam1);
    setTeam2(initialTeam2);
    setIsMenuOpen(false);
    setActionConfirm(null);
  };

  // Final match save trigger
  const handleConfirmSaveMatch = () => {
    const finalMatch: Match = {
      id: 'm_' + Date.now(),
      date: new Date().toISOString(),
      team1,
      team2,
      winnerPlayerId: winnerModal.winnerPlayerId,
      isDraw: winnerModal.isDraw,
      isVsAi,
      aiDifficulty: activeAiDifficulty,
      gameMode: gameMode || (isVsAi ? 'vs_ai' : team1.player2Id ? '2v2' : '1v1'),
      durationSeconds: Math.round(
        (new Date().getTime() - new Date(startTime).getTime()) / 1000
      ),
    };
    onSaveMatch(finalMatch);
  };

  const renderFighterCard = (
    teamNumber: 1 | 2,
    heroIndex: number,
    heroState: MatchHeroState
  ) => {
    const heroData = getHeroById(heroState.heroId);
    if (!heroData) return null;

    const isBodvar = heroData.id === 'bodvar';
    const isFeyFolk = heroData.id === 'fey_folk';

    return (
      <div
        className={`relative bg-slate-950 border rounded-2xl p-4 transition-all duration-300 border-slate-800 ${
          heroState.isKo ? 'bg-slate-900/60 border-red-900/50 opacity-60' : ''
        }`}
      >
        {/* Header bar of fighter card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <FighterAvatar heroId={heroData.id} size="md" isKo={heroState.isKo} />
            <div>
              <h4 className="font-extrabold text-white text-base">{heroData.name}</h4>
              <p className="text-[11px] text-slate-400">{heroData.title[language]}</p>
            </div>
          </div>
        </div>

        {/* Normal HP Tracker */}
        {!isFeyFolk && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-red-400 flex items-center gap-1">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                {t.common.hp}
              </span>
              <span className="text-xl font-black text-white">
                {heroState.currentHp}
                <span className="text-xs text-slate-500 font-semibold ml-1">
                  / {heroState.isBearForm ? 15 : heroData.maxHp}
                </span>
              </span>
            </div>

            {/* Quick HP Controls */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex gap-1">
                <button
                  onClick={() => changeHp(teamNumber, heroIndex, -5)}
                  className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-lg border border-red-800/60"
                >
                  -5
                </button>
                <button
                  onClick={() => changeHp(teamNumber, heroIndex, -1)}
                  className="p-1 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold rounded-lg border border-red-800/60 w-8 h-8 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => changeHp(teamNumber, heroIndex, 1)}
                  className="p-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/60 w-8 h-8 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => changeHp(teamNumber, heroIndex, 5)}
                  className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-800/60"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEY FOLK SPECIAL 3 HP TRACKERS */}
        {isFeyFolk && heroState.feyFolkHp && (
          <div className="bg-teal-950/30 border border-teal-800/50 rounded-xl p-3 mb-3 space-y-2">
            <span className="text-[11px] font-extrabold text-teal-300 uppercase tracking-wider block">
              {t.activeMatch.feyFolkSubTrack}
            </span>

            {/* Elf (5 HP) */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                🧝‍♀️ {t.activeMatch.elf}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'elf', -1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-teal-300 min-w-[32px] text-center">
                  {heroState.feyFolkHp.elf} / 5
                </span>
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'elf', 1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Gnome (4 HP) */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                🧔 {t.activeMatch.gnome}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'gnome', -1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-teal-300 min-w-[32px] text-center">
                  {heroState.feyFolkHp.gnome} / 4
                </span>
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'gnome', 1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fairy (3 HP) */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                🧚‍♀️ {t.activeMatch.fairy}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'fairy', -1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-teal-300 min-w-[32px] text-center">
                  {heroState.feyFolkHp.fairy} / 3
                </span>
                <button
                  onClick={() => changeFeySubHp(teamNumber, heroIndex, 'fairy', 1)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POWER TRACKER (0 to N, no cap) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              {t.common.power}
            </span>
            <span className="text-xl font-black text-amber-400">
              {heroState.currentPower}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex gap-1">
              <button
                onClick={() => changePower(teamNumber, heroIndex, -1)}
                className="p-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/60 w-8 h-8 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => changePower(teamNumber, heroIndex, 1)}
                className="p-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/60 w-8 h-8 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => changePower(teamNumber, heroIndex, 3)}
                className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold text-xs rounded-lg border border-amber-800/60"
              >
                +3
              </button>
            </div>
          </div>
        </div>

        {/* BODVAR BEAR TRANSFORMATION BUTTON */}
        {isBodvar && (
          <div className="mt-3">
            <button
              onClick={() => handleBodvarTransform(teamNumber, heroIndex)}
              className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-98"
            >
              <span>🐻</span>
              <span>{t.activeMatch.bearTransform}</span>
            </button>
            {heroState.isBearForm && (
              <p className="text-[10px] text-amber-400 text-center font-bold mt-1">
                ✓ Bear Form Active (Max HP: 15)
              </p>
            )}
          </div>
        )}

        {/* MANUAL KO / REVIVE TOGGLE */}
        <div className="mt-3 text-right">
          <button
            onClick={() =>
              updateHero(teamNumber, heroIndex, (h) => ({
                ...h,
                isKo: !h.isKo,
                currentHp: !h.isKo ? 0 : 5,
              }))
            }
            className="text-[11px] font-semibold text-slate-500 hover:text-red-400 underline"
          >
            {heroState.isKo ? t.activeMatch.reviveToggle : t.activeMatch.koToggle}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            {t.activeMatch.title}
          </h2>
        </div>

        {/* Right 3-Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title={t.activeMatch.menuTitle}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 space-y-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActionConfirm('draw');
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Flag className="w-4 h-4 text-amber-400" />
                {t.activeMatch.declareDraw}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  triggerWinnerModal(team1.playerId, false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-blue-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Win for {team1.playerName}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  triggerWinnerModal(team2.playerId, false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Win for {team2.playerName}
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActionConfirm('reset');
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {t.activeMatch.resetMatch}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActionConfirm('cancel');
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel Match
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOT AI SOLO ASSISTANT PANEL */}
      {(isVsAi || team2.playerId === 'bot_ai') && (
        <BotAiAssistantCard
          aiDifficulty={activeAiDifficulty}
          language={language}
        />
      )}

      {/* MATCH BATTLEFIELD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TEAM 1 SIDE (BLUE) */}
        <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Team 1
              </span>
              <h3 className="text-lg font-black text-white">{team1.playerName}</h3>
            </div>
            {isTeam1AllKo && (
              <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800 text-xs font-bold rounded-lg">
                ALL K.O.
              </span>
            )}
          </div>

          <div className="space-y-4">
            {renderFighterCard(1, 0, team1.heroes[0])}
            {renderFighterCard(1, 1, team1.heroes[1])}
          </div>
        </div>

        {/* TEAM 2 SIDE (RED) */}
        <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Team 2
              </span>
              <h3 className="text-lg font-black text-white">{team2.playerName}</h3>
            </div>
            {isTeam2AllKo && (
              <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800 text-xs font-bold rounded-lg">
                ALL K.O.
              </span>
            )}
          </div>

          <div className="space-y-4">
            {renderFighterCard(2, 0, team2.heroes[0])}
            {renderFighterCard(2, 1, team2.heroes[1])}
          </div>
        </div>
      </div>

      {/* END MATCH / WINNER MODAL */}
      {winnerModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                {t.activeMatch.winnerModalTitle}
              </h3>
              {winnerModal.isDraw ? (
                <p className="text-amber-400 font-bold text-lg">
                  {t.activeMatch.drawResultLabel}
                </p>
              ) : (
                <p className="text-slate-300 text-sm">
                  {t.activeMatch.winnerLabel}{' '}
                  <span className="text-amber-400 font-extrabold text-lg block">
                    {winnerModal.winnerPlayerId === team1.playerId
                      ? team1.playerName
                      : team2.playerName}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmSaveMatch}
                className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                {t.activeMatch.saveMatchBtn}
              </button>
              <button
                onClick={() => setWinnerModal({ ...winnerModal, isOpen: false })}
                className="w-full py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t.activeMatch.keepPlaying}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION MODAL (Cancel / Reset / Draw) */}
      {actionConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              {actionConfirm === 'cancel' && <X className="w-6 h-6 text-red-400" />}
              {actionConfirm === 'reset' && <RotateCcw className="w-6 h-6 text-amber-400" />}
              {actionConfirm === 'draw' && <Flag className="w-6 h-6 text-amber-400" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">
                {actionConfirm === 'cancel' && (language === 'it' ? 'Annulla Partita' : 'Cancel Match')}
                {actionConfirm === 'reset' && (language === 'it' ? 'Ripristina Partita' : 'Reset Match')}
                {actionConfirm === 'draw' && (language === 'it' ? 'Dichiara Pareggio' : 'Declare Draw')}
              </h3>
              <p className="text-xs text-slate-400">
                {actionConfirm === 'cancel' && (language === 'it' ? 'Vuoi davvero annullare la partita e tornare al menu?' : 'Cancel active match and return to setup?')}
                {actionConfirm === 'reset' && (language === 'it' ? 'Ripristinare tutti i punti vita e la forza ai valori iniziali?' : 'Reset all HP and Power values to match defaults?')}
                {actionConfirm === 'draw' && (language === 'it' ? 'Confermi di voler concludere la partita in pareggio?' : t.activeMatch.confirmDraw)}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActionConfirm(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  if (actionConfirm === 'cancel') {
                    setActionConfirm(null);
                    onCancelMatch();
                  } else if (actionConfirm === 'reset') {
                    executeResetMatch();
                  } else if (actionConfirm === 'draw') {
                    setActionConfirm(null);
                    triggerWinnerModal(null, true);
                  }
                }}
                className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer ${
                  actionConfirm === 'cancel'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {language === 'it' ? 'Conferma' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
