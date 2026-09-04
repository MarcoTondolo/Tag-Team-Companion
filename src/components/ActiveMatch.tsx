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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerTeam, MatchHeroState, Match, Language, AiDifficulty, GameMode } from '../types';
import { HEROES, getHeroById } from '../data/heroes';
import { getTranslation } from '../data/translations';
import { FighterAvatar } from './FighterAvatar';
import { CircuitClandestinoCard } from './CircuitClandestinoCard';

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

  // Fey Folk Selection Modal state
  const [feyModalState, setFeyModalState] = useState<{
    isOpen: boolean;
    teamNumber: 1 | 2;
    heroIndex: number;
  } | null>(null);

  // 3-dots top right menu state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<'cancel' | 'reset' | 'draw' | null>(null);

  // Track current wave in Solo Mode
  const [currentWave, setCurrentWave] = useState<number>(1);

  // End match modal state
  const [winnerModal, setWinnerModal] = useState<{
    isOpen: boolean;
    winnerPlayerId: string | null;
    isDraw: boolean;
    finalWave?: number;
  }>({
    isOpen: false,
    winnerPlayerId: null,
    isDraw: false,
  });

  // Track match start time
  const [startTime] = useState<string>(new Date().toISOString());

  // Auto-check if any Fey Folk needs active member selection on start
  useEffect(() => {
    if (feyModalState) return;

    // Check team 1
    team1.heroes.forEach((h, idx) => {
      if (h.heroId === 'fey_folk' && !h.activeFeyMember && !h.isKo) {
        setFeyModalState({ isOpen: true, teamNumber: 1, heroIndex: idx });
        return;
      }
    });

    // Check team 2 if not vs AI
    if (!isVsAi && team2.playerId !== 'threat_deck') {
      team2.heroes.forEach((h, idx) => {
        if (h.heroId === 'fey_folk' && !h.activeFeyMember && !h.isKo) {
          setFeyModalState({ isOpen: true, teamNumber: 2, heroIndex: idx });
          return;
        }
      });
    }
  }, [team1, team2, feyModalState, isVsAi]);

  // Helper to determine if a hero is defeated for team loss:
  // Mortal heroes are defeated when isKo is true.
  // Excalibur transforms into The Broken Blade when reaching 0 HP and becomes immortal.
  // For team defeat check: when Excalibur is broken, it counts towards team loss if ally is also defeated.
  const isHeroDefeated = (h: MatchHeroState) => {
    if (h.heroId === 'excalibur') {
      return !!h.isBrokenBlade || h.isKo;
    }
    return h.isKo;
  };

  // Check if both heroes in a team are KO
  const isTeam1AllKo = team1.heroes.length > 0 && team1.heroes.every(isHeroDefeated);
  const isTeam2AllKo = team2.heroes.length > 0 && team2.heroes.every(isHeroDefeated);

  useEffect(() => {
    if (isVsAi || team2.playerId === 'threat_deck') {
      if (isTeam1AllKo) {
        // Player defeated in Circuito Clandestino
        triggerWinnerModal(null, false);
      }
      return;
    }

    if (isTeam1AllKo && isTeam2AllKo) {
      triggerWinnerModal(null, true);
    } else if (isTeam1AllKo) {
      triggerWinnerModal(team2.playerId, false);
    } else if (isTeam2AllKo) {
      triggerWinnerModal(team1.playerId, false);
    }
  }, [isTeam1AllKo, isTeam2AllKo, isVsAi, team2.playerId]);

  const triggerWinnerModal = (winnerPlayerId: string | null, isDraw: boolean, finalWave?: number) => {
    setWinnerModal({ isOpen: true, winnerPlayerId, isDraw, finalWave: finalWave || currentWave });
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

      // Check Excalibur broken blade transformation logic
      if (updated.heroId === 'excalibur') {
        if (updated.isBrokenBlade) {
          updated.isKo = false; // Excalibur becomes immortal in Broken Blade form!
          updated.currentHp = 0;
        } else if (updated.currentHp <= 0) {
          // Reached 0 HP: transforms into The Broken Blade and becomes immortal!
          updated.isBrokenBlade = true;
          updated.isKo = false;
          updated.currentHp = 0;
        } else {
          updated.isKo = false;
        }
      } else if (updated.heroId === 'fey_folk' && updated.feyFolkHp) {
        const totalFeyHp =
            updated.feyFolkHp.elf + updated.feyFolkHp.gnome + updated.feyFolkHp.fairy;
        updated.isKo = totalFeyHp <= 0;
      } else {
        updated.isKo = updated.currentHp <= 0;
      }

      newHeroes[heroIndex] = updated;
      return { ...prevTeam, heroes: newHeroes };
    });
  };

  // Fey Folk selection handler:
  // Apply bonus power ONLY ONCE per match when selecting member
  const handleSelectFeyMember = (
      teamNumber: 1 | 2,
      heroIndex: number,
      member: 'elf' | 'gnome' | 'fairy'
  ) => {
    const setTeam = teamNumber === 1 ? setTeam1 : setTeam2;

    setTeam((prevTeam) => {
      const newHeroes = [...prevTeam.heroes];
      const hero = { ...newHeroes[heroIndex] };
      if (!hero.feyFolkHp) return prevTeam;

      const prevMember = hero.activeFeyMember;
      const partnerIndex = heroIndex === 0 ? 1 : 0;
      let bonusesApplied = { ...(hero.feyFolkBonusesApplied || {}) };

      // If switching from a member that is NOT KO, revert its bonus and reset its applied status
      if (prevMember && prevMember !== member) {
        const prevMemberHp = hero.feyFolkHp[prevMember] ?? 0;
        if (prevMemberHp > 0 && bonusesApplied[prevMember]) {
          if (prevMember === 'elf') {
            hero.currentPower = Math.max(0, hero.currentPower - 1);
          } else if (prevMember === 'gnome' || prevMember === 'fairy') {
            if (newHeroes[partnerIndex] && !newHeroes[partnerIndex].isKo) {
              newHeroes[partnerIndex] = {
                ...newHeroes[partnerIndex],
                currentPower: Math.max(0, newHeroes[partnerIndex].currentPower - 1),
              };
            }
          }
          bonusesApplied[prevMember] = false;
        }
      }

      const memberMaxHp = member === 'elf' ? 5 : member === 'gnome' ? 4 : 3;
      const currentMemberHp = hero.feyFolkHp[member] ?? memberMaxHp;

      hero.activeFeyMember = member;
      hero.currentHp = currentMemberHp;

      // Apply bonus power ONLY ONCE per member per match (unless reset by switching while non-KO)
      if (!bonusesApplied[member]) {
        bonusesApplied[member] = true;

        // Elf selection gives +1 Power to Fey Folk itself
        if (member === 'elf') {
          hero.currentPower += 1;
        }

        // Gnome or Fairy selection gives +1 Power to partner hero in same team
        if (member === 'gnome' || member === 'fairy') {
          if (newHeroes[partnerIndex] && !newHeroes[partnerIndex].isKo) {
            newHeroes[partnerIndex] = {
              ...newHeroes[partnerIndex],
              currentPower: newHeroes[partnerIndex].currentPower + 1,
            };
          }
        }
      }

      hero.feyFolkBonusesApplied = bonusesApplied;
      newHeroes[heroIndex] = hero;
      return { ...prevTeam, heroes: newHeroes };
    });

    setFeyModalState(null);
  };

  // Direct HP adjustment inside modal for fixing errors
  const adjustFeySubHpInModal = (
      teamNumber: 1 | 2,
      heroIndex: number,
      member: 'elf' | 'gnome' | 'fairy',
      delta: number
  ) => {
    const setTeam = teamNumber === 1 ? setTeam1 : setTeam2;

    setTeam((prevTeam) => {
      const newHeroes = [...prevTeam.heroes];
      const hero = { ...newHeroes[heroIndex] };
      if (!hero.feyFolkHp) return prevTeam;

      const maxHp = member === 'elf' ? 5 : member === 'gnome' ? 4 : 3;
      const currentSubHp = hero.feyFolkHp[member] ?? maxHp;
      const nextSubHp = Math.max(0, Math.min(maxHp, currentSubHp + delta));

      const updatedFeyHp = {
        ...hero.feyFolkHp,
        [member]: nextSubHp,
      };

      const totalFeyHp = updatedFeyHp.elf + updatedFeyHp.gnome + updatedFeyHp.fairy;

      hero.feyFolkHp = updatedFeyHp;
      hero.isKo = totalFeyHp <= 0;

      // If adjusted member is currently active, sync currentHp
      if (hero.activeFeyMember === member) {
        hero.currentHp = nextSubHp;
        if (nextSubHp === 0) {
          hero.activeFeyMember = null;
        }
      }

      newHeroes[heroIndex] = hero;
      return { ...prevTeam, heroes: newHeroes };
    });
  };

  // HP Change helper
  const changeHp = (teamNumber: 1 | 2, heroIndex: number, delta: number) => {
    const team = teamNumber === 1 ? team1 : team2;
    const hero = team.heroes[heroIndex];

    if (hero.heroId === 'fey_folk' && hero.feyFolkHp) {
      const activeMember = hero.activeFeyMember;
      if (!activeMember) {
        setFeyModalState({ isOpen: true, teamNumber, heroIndex });
        return;
      }

      const memberMaxHp = activeMember === 'elf' ? 5 : activeMember === 'gnome' ? 4 : 3;
      const currentMemberHp = hero.feyFolkHp[activeMember];
      const nextHp = Math.max(0, Math.min(memberMaxHp, currentMemberHp + delta));

      const updatedFeyHp = {
        ...hero.feyFolkHp,
        [activeMember]: nextHp,
      };

      const totalFeyHp = updatedFeyHp.elf + updatedFeyHp.gnome + updatedFeyHp.fairy;
      const isFullyKo = totalFeyHp <= 0;

      updateHero(teamNumber, heroIndex, (h) => ({
        ...h,
        feyFolkHp: updatedFeyHp,
        currentHp: nextHp,
        isKo: isFullyKo,
        activeFeyMember: nextHp === 0 ? null : activeMember,
      }));

      // If active member died but other members still alive, open popup modal to select next member!
      if (nextHp === 0 && !isFullyKo) {
        setTimeout(() => {
          setFeyModalState({ isOpen: true, teamNumber, heroIndex });
        }, 150);
      }
      return;
    }

    // Regular hero HP change
    updateHero(teamNumber, heroIndex, (h) => {
      // Excalibur in Broken Blade form cannot take or change HP
      if (h.heroId === 'excalibur' && h.isBrokenBlade) {
        return h;
      }
      const heroData = getHeroById(h.heroId);
      const maxHpCap = heroData?.maxHp || 99;
      const effectiveMaxHp =
          h.heroId === 'green_knight' && h.customMaxHp !== undefined
              ? h.customMaxHp
              : maxHpCap;
      const newHp = Math.max(0, h.currentHp + delta);
      const maxLimit = h.heroId === 'bodvar' && h.isBearForm ? 15 : effectiveMaxHp;
      const cappedHp = Math.min(maxLimit, newHp);

      return { ...h, currentHp: cappedHp };
    });
  };

  // Power Change helper (0 to N, no cap!)
  const changePower = (teamNumber: 1 | 2, heroIndex: number, delta: number) => {
    updateHero(teamNumber, heroIndex, (hero) => ({
      ...hero,
      currentPower: Math.max(0, hero.currentPower + delta),
    }));
  };

  // Bodvar Bear Transformation
  const handleBodvarTransform = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const addedHp = hero.currentPower;
      const newHp = Math.min(15, addedHp);
      return {
        ...hero,
        currentHp: newHp,
        isBearForm: true,
        image: `${import.meta.env.BASE_URL}heroes/bodvar_bear.png`,
      };
    });
  };

  // Excalibur Broken Blade transformation (Immortal)
  const handleTransformExcalibur = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => ({
      ...hero,
      isBrokenBlade: true,
      isKo: false, // Immortal!
      currentHp: 0,
      image: `${import.meta.env.BASE_URL}heroes/excalibur_broken.png`,
    }));
  };

  const handleRestoreExcalibur = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const heroData = getHeroById('excalibur');
      return {
        ...hero,
        isBrokenBlade: false,
        isKo: false,
        currentHp: heroData?.startingHp ?? 7,
        image: `${import.meta.env.BASE_URL}heroes/excalibur.png`,
      };
    });
  };

  // The Green Knight -1 Max HP button
  const handleReduceGreenKnightMaxHp = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const heroData = getHeroById(hero.heroId);
      const currentMax = hero.customMaxHp ?? heroData?.maxHp ?? 18;
      const newMax = Math.max(1, currentMax - 1);
      const newCurrentHp = Math.min(newMax, hero.currentHp);
      return {
        ...hero,
        customMaxHp: newMax,
        currentHp: newCurrentHp,
      };
    });
  };

  const handleIncreaseGreenKnightMaxHp = (teamNumber: 1 | 2, heroIndex: number) => {
    updateHero(teamNumber, heroIndex, (hero) => {
      const heroData = getHeroById(hero.heroId);
      const baseMax = heroData?.maxHp ?? 18;
      const currentMax = hero.customMaxHp ?? baseMax;
      const newMax = Math.min(baseMax, currentMax + 1);
      return {
        ...hero,
        customMaxHp: newMax,
        currentHp: newMax,
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
    const isSolo = isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai';
    const finalMatch: Match = {
      id: 'm_' + Date.now(),
      date: new Date().toISOString(),
      team1,
      team2,
      winnerPlayerId: isSolo ? team1.playerId : winnerModal.winnerPlayerId,
      isDraw: isSolo ? false : winnerModal.isDraw,
      isVsAi,
      aiDifficulty: activeAiDifficulty,
      gameMode: gameMode || (isVsAi ? 'vs_ai' : team1.player2Id ? '2v2' : '1v1'),
      maxWave: isSolo ? (winnerModal.finalWave || currentWave) : undefined,
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
    const isExcalibur = heroData.id === 'excalibur';
    const isGreenKnight = heroData.id === 'green_knight';

    // Calculate member max HP and badge
    let activeMemberLabel = '';
    let maxHpVal = heroState.isBearForm
        ? 15
        : isGreenKnight
            ? (heroState.customMaxHp ?? heroData.maxHp)
            : isExcalibur && heroState.isBrokenBlade
                ? 0
                : heroData.maxHp;

    if (isFeyFolk) {
      if (heroState.activeFeyMember === 'elf') {
        maxHpVal = 5;
        activeMemberLabel = `🧝 ${t.activeMatch.elf}`;
      } else if (heroState.activeFeyMember === 'gnome') {
        maxHpVal = 4;
        activeMemberLabel = `🧔 ${t.activeMatch.gnome}`;
      } else if (heroState.activeFeyMember === 'fairy') {
        maxHpVal = 3;
        activeMemberLabel = `🧚 ${t.activeMatch.fairy}`;
      } else {
        maxHpVal = 0;
        activeMemberLabel = `❓ ${t.common.select || 'Seleziona'}`;
      }
    }

    return (
        <div
            key={`team-${teamNumber}-hero-${heroState.heroId}-${heroIndex}`}
            className={`relative bg-slate-950 border rounded-xl p-3 transition-all duration-300 border-slate-800 ${
                heroState.isKo ? 'bg-slate-900/60 border-red-900/50 opacity-60' : ''
            }`}
        >
          {/* Header: Avatar, Name & Action Button underneath */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <FighterAvatar
                  heroId={heroData.id}
                  image={heroState.image}
                  size="md"
                  isKo={heroState.isKo}
                  isBrokenBlade={heroState.isBrokenBlade}
              />
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">
                    {isExcalibur && heroState.isBrokenBlade ? 'The Broken Blade' : heroData.name}
                  </h4>
                </div>
                {isBodvar && (
                    <button
                        onClick={() => handleBodvarTransform(teamNumber, heroIndex)}
                        disabled={heroState.isBearForm}
                        className={`mt-1 self-start px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                            heroState.isBearForm
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 opacity-90'
                                : 'bg-orange-950/80 hover:bg-orange-900 text-orange-300 border-orange-800/60'
                        }`}
                        title="Bear Form (+Power HP, max 15)"
                    >
                      <span>🐻</span>
                      <span>{heroState.isBearForm ? 'Bear' : '+Bear'}</span>
                    </button>
                )}
                {isFeyFolk && (
                    <button
                        type="button"
                        onClick={() => setFeyModalState({ isOpen: true, teamNumber, heroIndex })}
                        className="mt-1 self-start px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all text-amber-300 bg-amber-950/80 hover:bg-amber-900 border-amber-800/60"
                        title="Seleziona Membro del Popolo Fatato"
                    >
                      <span>{activeMemberLabel}</span>
                    </button>
                )}
                {isExcalibur && (
                    <div className="flex items-center gap-1 mt-1">
                      {!heroState.isBrokenBlade ? (
                          <button
                              onClick={() => handleTransformExcalibur(teamNumber, heroIndex)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all bg-yellow-950/80 hover:bg-yellow-900 text-yellow-300 border-yellow-700/60 shadow-sm active:scale-95"
                              title={language === 'it' ? 'Spezza Excalibur in The Broken Blade (Immortale)' : 'Break Excalibur into The Broken Blade (Immortal)'}
                          >
                            <span>{language === 'it' ? 'Spezza' : 'Break'}</span>
                          </button>
                      ) : (
                          <button
                              onClick={() => handleRestoreExcalibur(teamNumber, heroIndex)}
                              className="px-1.5 py-0.5 text-[9px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700 active:scale-95"
                              title={language === 'it' ? 'Ripristina Excalibur' : 'Restore Excalibur'}
                          >
                            <span>🔄</span>
                            <span>{language === 'it' ? 'Ripristina' : 'Restore'}</span>
                          </button>
                      )}
                    </div>
                )}
                {isGreenKnight && (
                    <div className="flex items-center gap-1 mt-1">
                      <button
                          onClick={() => handleReduceGreenKnightMaxHp(teamNumber, heroIndex)}
                          className="px-0 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 cursor-pointer transition-all bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border-emerald-700/80 shadow-sm active:scale-95"
                          title={language === 'it' ? 'Riduci Max HP di 1 alla volta' : 'Reduce Max HP by 1 at a time'}
                      >
                        <img
                            src={`${import.meta.env.BASE_URL}misc/green_knight_token.png`}
                            alt="token"
                            className="w-6 h-6 object-contain"
                        />
                      </button>
                      <button
                          onClick={() => handleIncreaseGreenKnightMaxHp(teamNumber, heroIndex)}
                          className="px-0 py-0.5 text-[10px] font-bold rounded-md border flex items-center justify-center cursor-pointer transition-all bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700 active:scale-95"
                          title="+1 Max HP (Annulla riduzione)"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Standard 2-Container Grid (HP + POWER) for ALL fighters */}
          <div className="grid grid-cols-2 gap-2">
            {/* HP TRACKER CONTAINER */}
            <div className={`border rounded-lg p-2 flex flex-col items-center justify-between gap-1.5 ${
                heroState.isBrokenBlade ? 'border-yellow-600/50 bg-yellow-950/25' : 'bg-slate-900/90 border-slate-800'
            }`}>
              {heroState.isBrokenBlade ? (
                  <div className="flex flex-col items-center justify-center text-center py-2 h-full">
                    <span className="text-[10px] font-extrabold text-amber-400 tracking-wider mt-0.5">
                    ♾️
                  </span>
                  </div>
              ) : (
                  <>
                    {/* Heart Icon + HP Counter */}
                    <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-white">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 shrink-0" />
                      <span>{heroState.currentHp}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                      /{maxHpVal}
                    </span>
                    </div>

                    {/* Stacked HP Buttons */}
                    <div className="flex flex-col items-center gap-1 w-full">
                      <button
                          onClick={() => changeHp(teamNumber, heroIndex, 1)}
                          className="w-full py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold rounded border border-emerald-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                          title="+1 HP"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                          onClick={() => changeHp(teamNumber, heroIndex, -1)}
                          className="w-full py-1 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold rounded border border-red-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                          title="-1 HP"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
              )}
            </div>

            {/* POWER TRACKER CONTAINER */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-between gap-1.5">
              <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{heroState.currentPower}</span>
              </div>

              {/* Stacked Power Buttons */}
              <div className="flex flex-col items-center gap-1 w-full">
                <button
                    onClick={() => changePower(teamNumber, heroIndex, 1)}
                    className="w-full py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold rounded border border-amber-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    title="+1 Power"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => changePower(teamNumber, heroIndex, -1)}
                    className="w-full py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold rounded border border-amber-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    title="-1 Power"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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

          {/* Right Controls & 3-Dots Menu */}
          <div className="flex items-center gap-2">
            {(isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai') && (
                <button
                    type="button"
                    onClick={() => triggerWinnerModal(team1.playerId, false, currentWave)}
                    className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/80 rounded-xl text-xs font-black transition-all cursor-pointer shadow flex items-center gap-1.5 active:scale-95"
                >
                  <Flag className="w-4 h-4 text-red-400" />
                  <span>{language === 'it' ? 'Termina Partita' : 'End Match'}</span>
                </button>
            )}

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
                    {isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai' ? (
                        <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              triggerWinnerModal(team1.playerId, false, currentWave);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Flag className="w-4 h-4 text-red-400" />
                          {language === 'it' ? 'Termina Partita' : 'End Match'}
                        </button>
                    ) : (
                        <>
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
                            {t.activeMatch.winForPlayer.replace('{name}', team1.playerName)}
                          </button>

                          <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                triggerWinnerModal(team2.playerId, false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                          >
                            <Award className="w-4 h-4" />
                            {t.activeMatch.winForPlayer.replace('{name}', team2.playerName)}
                          </button>
                        </>
                    )}

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
                      {t.activeMatch.cancelMatchConfirmTitle}
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* CIRCUITO CLANDESTINO SOLO ASSISTANT PANEL */}
        {(isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai') && (
            <CircuitClandestinoCard
                aiDifficulty={activeAiDifficulty}
                language={language}
                team1={team1}
                onUpdateHeroHp={(idx, delta) => changeHp(1, idx, delta)}
                onUpdateHeroPower={(idx, delta) => changePower(1, idx, delta)}
                onWaveChange={(w) => setCurrentWave(w)}
                onEndMatch={(w) => triggerWinnerModal(team1.playerId, false, w)}
            />
        )}

        {/* MATCH BATTLEFIELD GRID */}
        {isVsAi || team2.playerId === 'threat_deck' ? (
            /* SOLO MODE: ONLY RENDER PLAYER TAG TEAM (TEAM 1) */
            <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  {language === 'it' ? 'Il Tuo Tag Team' : 'Your Tag Team'}
                </span>
                  <h3 className="text-base sm:text-lg font-black text-white">{team1.playerName}</h3>
                </div>
                {isTeam1AllKo && (
                    <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold rounded-lg">
                  {t.activeMatch.allKo}
                </span>
                )}
              </div>

              <div className={`grid ${team1.heroes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 sm:gap-2.5`}>
                {team1.heroes.map((hero, idx) => renderFighterCard(1, idx, hero))}
              </div>
            </div>
        ) : (
            /* MULTIPLAYER / 2-TEAM GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* TEAM 1 SIDE (BLUE) */}
              <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                  <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    Team 1
                  </span>
                    <h3 className="text-base sm:text-lg font-black text-white">{team1.playerName}</h3>
                  </div>
                  {isTeam1AllKo && (
                      <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold rounded-lg">
                    {t.activeMatch.allKo}
                  </span>
                  )}
                </div>

                <div className={`grid ${team1.heroes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 sm:gap-2.5`}>
                  {team1.heroes.map((hero, idx) => renderFighterCard(1, idx, hero))}
                </div>
              </div>

              {/* TEAM 2 SIDE (RED) */}
              <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
                  <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                    Team 2
                  </span>
                    <h3 className="text-base sm:text-lg font-black text-white">{team2.playerName}</h3>
                  </div>
                  {isTeam2AllKo && (
                      <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold rounded-lg">
                    {t.activeMatch.allKo}
                  </span>
                  )}
                </div>

                <div className={`grid ${team2.heroes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 sm:gap-2.5`}>
                  {team2.heroes.map((hero, idx) => renderFighterCard(2, idx, hero))}
                </div>
              </div>
            </div>
        )}

        {/* FEY FOLK MEMBER SELECTION POPUP MODAL */}
        {feyModalState?.isOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="relative text-center space-y-1">
                  <button
                      type="button"
                      onClick={() => setFeyModalState(null)}
                      className="absolute -top-1 -right-1 p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                      title={t.common.cancel}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="text-xl font-black text-amber-400 flex items-center justify-center gap-2 pr-6">
                    {t.activeMatch.selectFeyTitle}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {t.activeMatch.selectFeyDesc}
                  </p>
                </div>

                {(() => {
                  const team = feyModalState.teamNumber === 1 ? team1 : team2;
                  const heroState = team.heroes[feyModalState.heroIndex];
                  const feyHp = heroState?.feyFolkHp || { elf: 5, gnome: 4, fairy: 3 };

                  const options = [
                    {
                      key: 'elf' as const,
                      name: t.activeMatch.elf,
                      emoji: '🧝',
                      currentHp: feyHp.elf,
                      maxHp: 5,
                      bonusText: t.activeMatch.elfBonusDesc,
                    },
                    {
                      key: 'gnome' as const,
                      name: t.activeMatch.gnome,
                      emoji: '🧔',
                      currentHp: feyHp.gnome,
                      maxHp: 4,
                      bonusText: t.activeMatch.gnomeBonusDesc,
                    },
                    {
                      key: 'fairy' as const,
                      name: t.activeMatch.fairy,
                      emoji: '🧚',
                      currentHp: feyHp.fairy,
                      maxHp: 3,
                      bonusText: t.activeMatch.fairyBonusDesc,
                    },
                  ];

                  return (
                      <div className="space-y-3">
                        {options.map((opt) => {
                          const isDead = opt.currentHp <= 0;
                          const isActive = heroState?.activeFeyMember === opt.key;

                          return (
                              <div
                                  key={opt.key}
                                  onClick={() => {
                                    if (!isDead) {
                                      handleSelectFeyMember(
                                          feyModalState.teamNumber,
                                          feyModalState.heroIndex,
                                          opt.key
                                      );
                                    }
                                  }}
                                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                                      isDead
                                          ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                                          : isActive
                                              ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30 cursor-pointer'
                                              : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50 cursor-pointer'
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-white text-sm">{opt.name}</span>
                                      {isDead && (
                                          <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold rounded">
                                  {t.activeMatch.koMember}
                                </span>
                                      )}
                                      {isActive && !isDead && (
                                          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded">
                                  {t.activeMatch.activeMember}
                                </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{opt.bonusText}</p>
                                  </div>
                                </div>

                                {/* Right side: HP controls with + and - buttons */}
                                <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                                  <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustFeySubHpInModal(
                                            feyModalState.teamNumber,
                                            feyModalState.heroIndex,
                                            opt.key,
                                            -1
                                        );
                                      }}
                                      className="w-7 h-7 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold rounded-lg border border-red-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                      title="-1 HP"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>

                                  <div className="flex items-center gap-0.5 px-1 min-w-[36px] justify-center text-xs font-black text-white">
                                    <Heart className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />
                                    <span>{opt.currentHp}</span>
                                    <span className="text-[10px] text-slate-500 font-normal">/{opt.maxHp}</span>
                                  </div>

                                  <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        adjustFeySubHpInModal(
                                            feyModalState.teamNumber,
                                            feyModalState.heroIndex,
                                            opt.key,
                                            1
                                        );
                                      }}
                                      className="w-7 h-7 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/60 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                                      title="+1 HP"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                  );
                })()}
              </div>
            </div>
        )}

        {/* END MATCH / WINNER MODAL */}
        {winnerModal.isOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">
                    {isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai'
                        ? (language === 'it' ? '🏁 PARTITA TERMINATA' : '🏁 MATCH CONCLUDED')
                        : t.activeMatch.winnerModalTitle}
                  </h3>
                  {isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai' ? (
                      <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-center">
                      <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                        {language === 'it' ? 'Risultato Circuito Clandestino' : 'Underground Circuit Result'}
                      </span>
                        <span className="text-2xl font-black text-amber-400 block my-1">
                        {language === 'it'
                            ? `Ondata Raggiunta: ${winnerModal.finalWave || currentWave}`
                            : `Wave Reached: ${winnerModal.finalWave || currentWave}`}
                      </span>
                        <span className="text-xs text-slate-300 font-bold block pt-2 border-t border-slate-800">
                        {team1.playerName} ({team1.heroes.map(h => getHeroById(h.heroId)?.name || h.heroId).join(' & ')})
                      </span>
                      </div>
                  ) : winnerModal.isDraw ? (
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
                    {isVsAi || team2.playerId === 'threat_deck' || team2.playerId === 'bot_ai'
                        ? (language === 'it' ? 'Salva e Registra Statistiche' : 'Save & Record Stats')
                        : t.activeMatch.saveMatchBtn}
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
                    {actionConfirm === 'cancel' && t.activeMatch.cancelMatchConfirmTitle}
                    {actionConfirm === 'reset' && t.activeMatch.resetMatchConfirmTitle}
                    {actionConfirm === 'draw' && t.activeMatch.declareDraw}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {actionConfirm === 'cancel' && t.activeMatch.cancelMatchConfirmDesc}
                    {actionConfirm === 'reset' && t.activeMatch.resetMatchConfirmDesc}
                    {actionConfirm === 'draw' && t.activeMatch.confirmDraw}
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
                    {t.activeMatch.confirm}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};
