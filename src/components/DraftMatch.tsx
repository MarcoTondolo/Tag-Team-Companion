import React, { useState, useEffect } from 'react';
import { Swords, AlertCircle, Sparkles, UserPlus, Lock, X, Bot, Users, BookOpen, RefreshCw, Zap, Flame } from 'lucide-react';
import { Player, Language, PlayerTeam, MatchHeroState, AiDifficulty, GameMode } from '../types';
import { HEROES, getHeroById } from '../data/heroes';
import { getTranslation } from '../data/translations';
import { FighterAvatar } from './FighterAvatar';
import { SoloRulesModal } from './SoloRulesModal';

interface DraftMatchProps {
  players: Player[];
  onStartMatch: (
      team1: PlayerTeam,
      team2: PlayerTeam,
      isVsAi?: boolean,
      aiDifficulty?: AiDifficulty,
      gameMode?: GameMode
  ) => void;
  language: Language;
  onQuickAddPlayer: (name: string) => void;
}

export const DraftMatch: React.FC<DraftMatchProps> = ({
                                                        players,
                                                        onStartMatch,
                                                        language,
                                                        onQuickAddPlayer,
                                                      }) => {
  const t = getTranslation(language);

  // Match Mode: '1v1' | '2v2' | 'vs_ai'
  const [matchMode, setMatchMode] = useState<GameMode>('1v1');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('normal');
  const [showSoloRulesModal, setShowSoloRulesModal] = useState<boolean>(false);

  // 1v1 / vs_ai player selection
  const [player1Id, setPlayer1Id] = useState<string>(players[0]?.id || '');
  const [player2Id, setPlayer2Id] = useState<string>(
      players.find((p) => p.id !== players[0]?.id)?.id || players[1]?.id || ''
  );

  // 2v2 player selections (4 distinct players)
  const [p1aId, setP1aId] = useState<string>(players[0]?.id || '');
  const [p1bId, setP1bId] = useState<string>(players[1]?.id || '');
  const [p2aId, setP2aId] = useState<string>(players[2]?.id || '');
  const [p2bId, setP2bId] = useState<string>(players[3]?.id || '');

  // Hero draft selections per team (arrays of up to 2 hero IDs)
  const [p1Heroes, setP1Heroes] = useState<string[]>(['wong', 'bodvar']);
  const [p2Heroes, setP2Heroes] = useState<string[]>(['ching_shih', 'joan']);

  // Guided Solo Draft State (6 Fighters -> 2 Pairs -> Random Assignment)
  const [soloDraftMethod, setSoloDraftMethod] = useState<'guided' | 'direct'>('guided');
  const [drawn6Heroes, setDrawn6Heroes] = useState<string[]>([]);
  const [pairAHeroes, setPairAHeroes] = useState<string[]>([]);
  const [pairBHeroes, setPairBHeroes] = useState<string[]>([]);

  // Quick player add state
  const [quickName, setQuickName] = useState('');

  // Keep player selections valid & distinct when players prop changes or on mode switch
  useEffect(() => {
    if (players.length >= 1) {
      if (!player1Id || !players.some((p) => p.id === player1Id)) {
        setPlayer1Id(players[0]?.id || '');
      }
      if (matchMode === '1v1') {
        if (!player2Id || player2Id === player1Id || !players.some((p) => p.id === player2Id)) {
          const nextP2 = players.find((p) => p.id !== player1Id)?.id || '';
          setPlayer2Id(nextP2);
        }
      }
      if (matchMode === '2v2') {
        // Auto-assign 4 distinct IDs if available
        const currentSelected = [p1aId, p1bId, p2aId, p2bId];
        const validP1a = players.some((p) => p.id === p1aId) ? p1aId : players[0]?.id || '';
        const validP1b = players.some((p) => p.id === p1bId && p.id !== validP1a)
            ? p1bId
            : players.find((p) => p.id !== validP1a)?.id || '';
        const validP2a = players.some((p) => p.id === p2aId && p.id !== validP1a && p.id !== validP1b)
            ? p2aId
            : players.find((p) => p.id !== validP1a && p.id !== validP1b)?.id || '';
        const validP2b = players.some(
            (p) => p.id === p2bId && p.id !== validP1a && p.id !== validP1b && p.id !== validP2a
        )
            ? p2bId
            : players.find((p) => p.id !== validP1a && p.id !== validP1b && p.id !== validP2a)?.id || '';

        setP1aId(validP1a);
        setP1bId(validP1b);
        setP2aId(validP2a);
        setP2bId(validP2b);
      }
    }
  }, [players, player1Id, player2Id, matchMode]);

  // Handle Solo Mode 6-Fighter Drawing
  const handleDraw6RandomFighters = () => {
    const shuffled = [...HEROES].map((h) => h.id).sort(() => Math.random() - 0.5);
    const selected6 = shuffled.slice(0, 6);
    setDrawn6Heroes(selected6);
    setPairAHeroes([]);
    setPairBHeroes([]);
  };

  // Automatically form 2 balanced, synergistic pairs from the 6 drawn fighters
  const handleAutoFormPairs = () => {
    if (drawn6Heroes.length !== 6) return;
    const shuffled = [...drawn6Heroes].sort(() => Math.random() - 0.5);
    setPairAHeroes([shuffled[0], shuffled[1]]);
    setPairBHeroes([shuffled[2], shuffled[3]]);
  };

  // Select Pair A or Pair B for Player Team in Solo Mode
  const handleSelectPairA = () => {
    if (pairAHeroes.length === 2) {
      setP1Heroes([...pairAHeroes]);
    }
  };

  const handleSelectPairB = () => {
    if (pairBHeroes.length === 2) {
      setP1Heroes([...pairBHeroes]);
    }
  };

  // Randomly assign Pair A and Pair B to Human Player and Bot AI (Michael Kelley Rule for 1v1)
  const handleRandomPairAssignment = () => {
    if (pairAHeroes.length !== 2 || pairBHeroes.length !== 2) return;
    const isHumanPairA = Math.random() < 0.5;
    if (isHumanPairA) {
      setP1Heroes([...pairAHeroes]);
      setP2Heroes([...pairBHeroes]);
    } else {
      setP1Heroes([...pairBHeroes]);
      setP2Heroes([...pairAHeroes]);
    }
  };

  // Check duplicate heroes & team validity
  const allSelectedHeroes = matchMode === 'vs_ai' ? p1Heroes : [...p1Heroes, ...p2Heroes];
  const hasDuplicateHero = new Set(allSelectedHeroes).size !== allSelectedHeroes.length;

  const isSamePlayer1v1 = matchMode === '1v1' && player1Id === player2Id;
  const selected2v2Players = [p1aId, p1bId, p2aId, p2bId].filter(Boolean);
  const is2v2Valid = matchMode === '2v2' && new Set(selected2v2Players).size === 4 && players.length >= 4;

  const isTeam1Complete = p1Heroes.length === 2;
  const isTeam2Complete = p2Heroes.length === 2;

  const canStartMatch =
      matchMode === 'vs_ai'
          ? isTeam1Complete && player1Id
          : matchMode === '2v2'
              ? isTeam1Complete && isTeam2Complete && !hasDuplicateHero && is2v2Valid
              : isTeam1Complete && isTeam2Complete && !hasDuplicateHero && !isSamePlayer1v1 && player1Id && player2Id;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onQuickAddPlayer(quickName.trim());
    setQuickName('');
  };

  const handlePlayer1Change = (newP1Id: string) => {
    setPlayer1Id(newP1Id);
    if (matchMode === '1v1' && player2Id === newP1Id) {
      const remaining = players.find((p) => p.id !== newP1Id);
      if (remaining) setPlayer2Id(remaining.id);
    }
  };

  const handlePlayer2Change = (newP2Id: string) => {
    setPlayer2Id(newP2Id);
    if (player1Id === newP2Id) {
      const remaining = players.find((p) => p.id !== newP2Id);
      if (remaining) setPlayer1Id(remaining.id);
    }
  };

  // Toggle selection for Team 1
  const toggleP1Hero = (heroId: string) => {
    if (matchMode !== 'vs_ai' && p2Heroes.includes(heroId)) return; // Cannot pick opponent's hero

    if (p1Heroes.includes(heroId)) {
      setP1Heroes(p1Heroes.filter((id) => id !== heroId));
    } else {
      if (p1Heroes.length < 2) {
        setP1Heroes([...p1Heroes, heroId]);
      } else {
        setP1Heroes([p1Heroes[0], heroId]);
      }
    }
  };

  // Toggle selection for Team 2
  const toggleP2Hero = (heroId: string) => {
    if (p1Heroes.includes(heroId)) return; // Cannot pick opponent's hero

    if (p2Heroes.includes(heroId)) {
      setP2Heroes(p2Heroes.filter((id) => id !== heroId));
    } else {
      if (p2Heroes.length < 2) {
        setP2Heroes([...p2Heroes, heroId]);
      } else {
        setP2Heroes([p2Heroes[0], heroId]);
      }
    }
  };

  const handleStart = () => {
    if (!canStartMatch) return;

    const isVsAi = matchMode === 'vs_ai';

    // Build Hero State helper
    const buildHeroState = (heroId: string): MatchHeroState => {
      const hero = getHeroById(heroId);
      const image = `${import.meta.env.BASE_URL}heroes/${heroId}.png`;
      if (!hero) {
        return { heroId, image, currentHp: 10, currentPower: 0, isKo: false };
      }

      if (hero.id === 'fey_folk') {
        return {
          heroId,
          image,
          currentHp: 12,
          currentPower: hero.startingPower,
          isKo: false,
          feyFolkHp: { elf: 5, gnome: 4, fairy: 3 },
        };
      }

      if (hero.id === 'green_knight') {
        return {
          heroId,
          image,
          currentHp: hero.startingHp,
          currentPower: hero.startingPower,
          isKo: false,
          customMaxHp: hero.maxHp,
        };
      }

      if (hero.id === 'excalibur') {
        return {
          heroId,
          image,
          currentHp: hero.startingHp,
          currentPower: hero.startingPower,
          isKo: false,
          isBrokenBlade: false,
        };
      }

      return {
        heroId,
        image,
        currentHp: hero.startingHp,
        currentPower: hero.startingPower,
        isKo: false,
      };
    };

    const team1Heroes = [buildHeroState(p1Heroes[0]), buildHeroState(p1Heroes[1])];
    const team2Heroes = [buildHeroState(p2Heroes[0]), buildHeroState(p2Heroes[1])];

    // Wild Bunch Special Start Automation:
    if (p1Heroes[0] === 'wild_bunch') team1Heroes[1].currentPower += 1;
    if (p1Heroes[1] === 'wild_bunch') team1Heroes[0].currentPower += 1;
    if (p2Heroes[0] === 'wild_bunch') team2Heroes[1].currentPower += 1;
    if (p2Heroes[1] === 'wild_bunch') team2Heroes[0].currentPower += 1;

    let team1: PlayerTeam;
    let team2: PlayerTeam;

    if (matchMode === '2v2') {
      const p1a = players.find((p) => p.id === p1aId);
      const p1b = players.find((p) => p.id === p1bId);
      const p2a = players.find((p) => p.id === p2aId);
      const p2b = players.find((p) => p.id === p2bId);

      if (!p1a || !p1b || !p2a || !p2b) return;

      team1 = {
        playerId: p1a.id,
        playerName: `${p1a.name} & ${p1b.name}`,
        player2Id: p1b.id,
        player2Name: p1b.name,
        heroes: team1Heroes,
      };

      team2 = {
        playerId: p2a.id,
        playerName: `${p2a.name} & ${p2b.name}`,
        player2Id: p2b.id,
        player2Name: p2b.name,
        heroes: team2Heroes,
      };
    } else {
      const p1 = players.find((p) => p.id === player1Id);
      if (!p1) return;

      team1 = {
        playerId: p1.id,
        playerName: p1.name,
        heroes: team1Heroes,
      };

      if (isVsAi) {
        team2 = {
          playerId: 'threat_deck',
          playerName: 'Threat Deck',
          heroes: [],
        };
      } else {
        const p2 = players.find((p) => p.id === player2Id);
        if (!p2) return;
        team2 = {
          playerId: p2.id,
          playerName: p2.name,
          heroes: team2Heroes,
        };
      }
    }

    onStartMatch(team1, team2, isVsAi, aiDifficulty, matchMode);
  };

  if (players.length < 1) {
    return (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Crea un profilo per iniziare</h2>
          <form onSubmit={handleQuickAdd} className="flex gap-2 pt-2">
            <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder={t.playersView.playerNamePlaceholder}
                className="px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 w-full"
            />
            <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {t.common.confirm}
            </button>
          </form>
        </div>
    );
  }

  // Filter player options to exclude opponent in 1v1 mode
  const player1Options = matchMode === '1v1' ? players.filter((p) => p.id !== player2Id) : players;
  const player2Options = players.filter((p) => p.id !== player1Id);

  // Render hero selection grid for a team
  const renderSingleHeroGrid = (
      selectedHeroes: string[],
      opponentHeroes: string[],
      onToggle: (heroId: string) => void,
      teamAccent: 'blue' | 'rose'
  ) => {
    const isBlue = teamAccent === 'blue';
    const accentBorder = isBlue ? 'border-blue-500' : 'border-rose-500';
    const accentBg = isBlue ? 'bg-blue-500/20' : 'bg-rose-500/20';
    const accentRing = isBlue ? 'ring-blue-400/80' : 'ring-rose-400/80';
    const badgeBg = isBlue ? 'bg-blue-500 text-slate-950' : 'bg-rose-500 text-white';

    return (
        <div className="space-y-3">
          {/* Selection Status Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span>{language === 'it' ? 'Eroi Selezionati:' : 'Heroes Selected:'}</span>
            <span
                className={
                  selectedHeroes.length === 2
                      ? 'text-emerald-400 font-extrabold'
                      : 'text-amber-400 font-extrabold'
                }
            >
            {selectedHeroes.length} / 2
          </span>
          </div>

          {/* Selected Hero Cards Preview Slot */}
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((index) => {
              const hId = selectedHeroes[index];
              const hero = hId ? getHeroById(hId) : null;

              return (
                  <div
                      key={index}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                          hero
                              ? `${accentBg} ${accentBorder} shadow-sm`
                              : 'bg-slate-950/60 border-dashed border-slate-800/80 text-slate-500'
                      }`}
                  >
                    {hero ? (
                        <>
                          <FighterAvatar heroId={hero.id} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-extrabold text-white truncate">{hero.name}</div>
                            <div className="text-[10px] text-slate-300 font-semibold">
                              HP: <span className="text-emerald-400">{hero.startingHp}</span> | PWR:{' '}
                              <span className="text-amber-400">{hero.startingPower}</span>
                            </div>
                          </div>
                          <button
                              type="button"
                              onClick={() => onToggle(hero.id)}
                              title={language === 'it' ? 'Rimuovi eroe' : 'Remove hero'}
                              className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900/80 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                    ) : (
                        <div className="text-[11px] font-semibold text-slate-500 italic py-1 px-1">
                          + {language === 'it' ? `Tocca un eroe (#${index + 1})` : `Tap a hero (#${index + 1})`}
                        </div>
                    )}
                  </div>
              );
            })}
          </div>

          {/* The Grid of 12 Heroes */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
            {HEROES.map((h) => {
              const selectedIndex = selectedHeroes.indexOf(h.id);
              const isSelected = selectedIndex !== -1;
              const isTakenByOpponent = opponentHeroes.includes(h.id);

              return (
                  <button
                      key={h.id}
                      type="button"
                      disabled={isTakenByOpponent}
                      onClick={() => onToggle(h.id)}
                      title={
                        isTakenByOpponent
                            ? `${h.name} (${
                                language === 'it' ? "Scelto dall'avversario" : 'Taken by opponent'
                            })`
                            : isSelected
                                ? `${h.name} (${
                                    language === 'it' ? 'Tocca per deselezionare' : 'Tap to deselect'
                                })`
                                : `${h.name} - HP: ${h.startingHp}, PWR: ${h.startingPower}`
                      }
                      className={`relative p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                              ? `${accentBorder} ${accentBg} text-white ring-2 ${accentRing} shadow-lg scale-[1.03] z-10 cursor-pointer`
                              : isTakenByOpponent
                                  ? 'opacity-25 grayscale cursor-not-allowed bg-slate-950 border-slate-800/40 pointer-events-none'
                                  : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-slate-600 text-slate-300 cursor-pointer hover:scale-[1.02]'
                      }`}
                  >
                    <FighterAvatar heroId={h.id} size="sm" />
                    <span
                        className={`text-[10px] font-extrabold tracking-tight truncate max-w-full mt-1.5 ${
                            isSelected ? 'text-white' : 'text-slate-400'
                        }`}
                    >
                  {h.name}
                </span>

                    {/* Badge Number (#1 / #2) if selected */}
                    {isSelected && (
                        <div
                            className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shadow-md ${badgeBg}`}
                        >
                          #{selectedIndex + 1}
                        </div>
                    )}

                    {/* Lock Badge if Taken by Opponent */}
                    {isTakenByOpponent && (
                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] rounded-2xl flex items-center justify-center text-slate-500 font-black">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                  </button>
              );
            })}
          </div>
        </div>
    );
  };

  return (
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header Card: Title & Mode Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-black text-white flex items-center justify-center md:justify-start gap-2 tracking-tight">
                <Swords className="w-6 h-6 text-amber-400" />
                {t.draft.title}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {t.draft.modeDesc}
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="inline-flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800/80 w-fit shrink-0 gap-1 self-center mx-auto md:mx-0">
              <button
                  type="button"
                  onClick={() => setMatchMode('1v1')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      matchMode === '1v1'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>{t.draft.modePvP}</span>
              </button>

              <button
                  type="button"
                  onClick={() => setMatchMode('2v2')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      matchMode === '2v2'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>{t.draft.mode2v2}</span>
              </button>

              <button
                  type="button"
                  onClick={() => setMatchMode('vs_ai')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      matchMode === 'vs_ai'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Flame className="w-4 h-4 shrink-0 text-orange-400" />
                <span>{t.draft.circuitModeTitle}</span>
              </button>
            </div>
          </div>

          {/* 2v2 Mode Quick Add Notice if less than 4 players */}
          {matchMode === '2v2' && players.length < 4 && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.draft.need4Players} ({players.length} / 4)</span>
                </div>
                <form onSubmit={handleQuickAdd} className="flex gap-2">
                  <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder={t.playersView.playerNamePlaceholder}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 w-full"
                  />
                  <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {t.common.confirm}
                  </button>
                </form>
              </div>
          )}

          {/* Solo Mode Settings Banner */}
          {matchMode === 'vs_ai' && (
              <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                  {t.draft.difficultyLabel}
                </span>
                  </div>

                  {/* Difficulty Radio Buttons */}
                  <div className="flex items-center gap-2">
                    {(['easy', 'normal', 'hard'] as AiDifficulty[]).map((diff) => (
                        <button
                            key={diff}
                            type="button"
                            onClick={() => setAiDifficulty(diff)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                aiDifficulty === diff
                                    ? diff === 'easy'
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                        : diff === 'normal'
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                            : 'bg-rose-600 text-white border-rose-500 shadow-sm'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                          {diff === 'easy' && (t.draft.easyLabel || 'Apprendista')}
                          {diff === 'normal' && (t.draft.normalLabel || 'Veterano')}
                          {diff === 'hard' && (t.draft.hardLabel || 'Leggenda')}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Solo Rules Button & Draft Method Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                      type="button"
                      onClick={() => setShowSoloRulesModal(true)}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 w-fit cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{t.draft.soloRulesBtn}</span>
                  </button>

                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                        type="button"
                        onClick={() => setSoloDraftMethod('guided')}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            soloDraftMethod === 'guided'
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {t.draft.draftMethodGuided}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSoloDraftMethod('direct')}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            soloDraftMethod === 'direct'
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {t.draft.draftMethodDirect}
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* GUIDED SOLO DRAFT ASSISTANT (MICHAEL KELLEY RULES) */}
        {matchMode === 'vs_ai' && soloDraftMethod === 'guided' && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    {t.draft.guidedDraftTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.draft.guidedDraftDesc}
                  </p>
                </div>
              </div>

              {/* STEP 1: Draw 6 Random Fighters */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                {t.draft.step1Title}
              </span>
                  <button
                      type="button"
                      onClick={handleDraw6RandomFighters}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {drawn6Heroes.length === 6 ? t.draft.redraw6 : t.draft.draw6Random}
                  </button>
                </div>

                {drawn6Heroes.length === 6 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {drawn6Heroes.map((hId) => {
                        const hero = getHeroById(hId);
                        if (!hero) return null;
                        return (
                            <div
                                key={hId}
                                className="p-2 bg-slate-900 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center text-center shadow-sm"
                            >
                              <FighterAvatar heroId={hero.id} size="sm" />
                              <span className="text-[10px] font-extrabold text-white mt-1 truncate max-w-full">
                        {hero.name}
                      </span>
                            </div>
                        );
                      })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic">
                      {t.draft.draw6Instruction}
                    </p>
                )}
              </div>

              {/* STEP 2 & 3: Form Pairs & Random Assignment */}
              {drawn6Heroes.length === 6 && (
                  <div className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  {t.draft.step2and3Title}
                </span>
                      <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAutoFormPairs}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {t.draft.autoFormPairs}
                        </button>
                        {matchMode === 'vs_ai' ? (
                            <div className="flex gap-1.5">
                              <button
                                  type="button"
                                  onClick={handleSelectPairA}
                                  disabled={pairAHeroes.length !== 2}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                              >
                                {language === 'it' ? 'Scegli Coppia A' : 'Select Pair A'}
                              </button>
                              <button
                                  type="button"
                                  onClick={handleSelectPairB}
                                  disabled={pairBHeroes.length !== 2}
                                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                              >
                                {language === 'it' ? 'Scegli Coppia B' : 'Select Pair B'}
                              </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleRandomPairAssignment}
                                disabled={pairAHeroes.length !== 2 || pairBHeroes.length !== 2}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {t.draft.randomPairAssignment}
                            </button>
                        )}
                      </div>
                    </div>

                    {/* Display Formed Pairs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900 border border-blue-500/40 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
                          <span>{t.draft.pairA}</span>
                          <span className="text-[10px] text-slate-400">{pairAHeroes.length} / 2 {t.draft.heroesCount}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1].map((idx) => {
                            const hId = pairAHeroes[idx];
                            const hero = hId ? getHeroById(hId) : null;
                            return (
                                <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                                  {hero ? (
                                      <>
                                        <FighterAvatar heroId={hero.id} size="sm" />
                                        <span className="text-xs font-bold text-white truncate">{hero.name}</span>
                                      </>
                                  ) : (
                                      <span className="text-[10px] text-slate-500 italic">{t.draft.emptySlot}</span>
                                  )}
                                </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 border border-rose-500/40 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
                          <span>{t.draft.pairB}</span>
                          <span className="text-[10px] text-slate-400">{pairBHeroes.length} / 2 {t.draft.heroesCount}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1].map((idx) => {
                            const hId = pairBHeroes[idx];
                            const hero = hId ? getHeroById(hId) : null;
                            return (
                                <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                                  {hero ? (
                                      <>
                                        <FighterAvatar heroId={hero.id} size="sm" />
                                        <span className="text-xs font-bold text-white truncate">{hero.name}</span>
                                      </>
                                  ) : (
                                      <span className="text-[10px] text-slate-500 italic">{t.draft.emptySlot}</span>
                                  )}
                                </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
        )}

        {/* Players & Heroes Draft Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TEAM 1 BOX (BLUE THEME) */}
          <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col gap-3 border-b border-blue-900/40 pb-3">
              <h3 className="text-base font-extrabold text-blue-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                {matchMode === 'vs_ai'
                    ? t.draft.humanPlayerBlue
                    : matchMode === '2v2'
                        ? t.draft.team1Blue
                        : t.draft.player1}
              </h3>

              {/* Player Selection Dropdowns */}
              {matchMode === '2v2' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        {language === 'it' ? 'Giocatore 1A' : 'Player 1A'}
                      </label>
                      <select
                          value={p1aId}
                          onChange={(e) => setP1aId(e.target.value)}
                          className="w-full bg-slate-950 border border-blue-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                      >
                        {players.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-900">
                              {p.name}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        {language === 'it' ? 'Giocatore 1B' : 'Player 1B'}
                      </label>
                      <select
                          value={p1bId}
                          onChange={(e) => setP1bId(e.target.value)}
                          className="w-full bg-slate-950 border border-blue-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                      >
                        {players.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-900">
                              {p.name}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>
              ) : (
                  <select
                      value={player1Id}
                      onChange={(e) => handlePlayer1Change(e.target.value)}
                      className="bg-slate-950 border border-blue-800/80 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-blue-400 cursor-pointer w-full"
                  >
                    {player1Options.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">
                          {p.name}
                        </option>
                    ))}
                  </select>
              )}
            </div>

            {/* Interactive Hero Grid for Team 1 */}
            {renderSingleHeroGrid(p1Heroes, matchMode === 'vs_ai' ? [] : p2Heroes, toggleP1Hero, 'blue')}
          </div>

          {/* RIGHT COLUMN: TEAM 2 FOR 1V1/2V2 OR CIRCUITO CLANDESTINO INFO FOR VS_AI */}
          {matchMode === 'vs_ai' ? (
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {language === 'it' ? 'Avversario: Il Threat Deck' : 'Opponent: Threat Deck'}
                      </h3>
                      <p className="text-xs text-amber-400 font-bold">
                        {language === 'it' ? 'Nessun team avversario da pilotare' : 'No opponent team to control'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    <p className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300">
                      {language === 'it'
                          ? 'In modalità Circuito Clandestino non c\'è un secondo team di lottatori. Affronterai le 5 Ondate del Threat Deck (carte da gioco da 2 a 10 + Figure & Assi).'
                          : 'In Underground Circuit mode there is no second fighter team. You face 5 Escalating Waves of the Threat Deck (standard rank cards 2-10 + Face cards & Aces).'}
                    </p>

                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                      <span className="font-bold text-amber-400 block">{language === 'it' ? 'Regole Incontro:' : 'Match Rules:'}</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                        <li>{language === 'it' ? 'Scegli 2 lottatori per il TUO Tag Team' : 'Pick 2 fighters for YOUR Tag Team'}</li>
                        <li>{language === 'it' ? 'Supera le 5 Ondate senza far andare KO entrambi i tuoi lottatori' : 'Survive 5 Waves without letting both your fighters go KO'}</li>
                        <li>{language === 'it' ? 'Usa il Momentum per curarti e gestire le risorse tra le ondate' : 'Use Momentum to heal and manage resources between waves'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                      type="button"
                      onClick={() => setShowSoloRulesModal(true)}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    {language === 'it' ? 'Leggi Regolamento Solitario Completo' : 'Read Full Solo Rules'}
                  </button>
                </div>
              </div>
          ) : (
              <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col gap-3 border-b border-rose-900/40 pb-3">
                  <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                    {matchMode === '2v2' ? t.draft.team2Red : t.draft.player2}
                  </h3>

                  {/* Player Selection Dropdowns */}
                  {matchMode === '2v2' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            {language === 'it' ? 'Giocatore 2A' : 'Player 2A'}
                          </label>
                          <select
                              value={p2aId}
                              onChange={(e) => setP2aId(e.target.value)}
                              className="w-full bg-slate-950 border border-rose-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-rose-400 cursor-pointer"
                          >
                            {players.map((p) => (
                                <option key={p.id} value={p.id} className="bg-slate-900">
                                  {p.name}
                                </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            {language === 'it' ? 'Giocatore 2B' : 'Player 2B'}
                          </label>
                          <select
                              value={p2bId}
                              onChange={(e) => setP2bId(e.target.value)}
                              className="w-full bg-slate-950 border border-rose-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-rose-400 cursor-pointer"
                          >
                            {players.map((p) => (
                                <option key={p.id} value={p.id} className="bg-slate-900">
                                  {p.name}
                                </option>
                            ))}
                          </select>
                        </div>
                      </div>
                  ) : (
                      <select
                          value={player2Id}
                          onChange={(e) => handlePlayer2Change(e.target.value)}
                          className="bg-slate-950 border border-rose-800/80 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-rose-400 cursor-pointer w-full"
                      >
                        {player2Options.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-900">
                              {p.name}
                            </option>
                        ))}
                      </select>
                  )}
                </div>

                {/* Interactive Hero Grid for Team 2 */}
                {renderSingleHeroGrid(p2Heroes, p1Heroes, toggleP2Hero, 'rose')}
              </div>
          )}
        </div>

        {/* Special Mechanic Notices & Warnings */}
        {allSelectedHeroes.includes('wild_bunch') && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{t.draft.wildBunchNotice}</span>
            </div>
        )}

        {(!isTeam1Complete || (matchMode !== 'vs_ai' && !isTeam2Complete)) && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
            {matchMode === 'vs_ai'
                ? (language === 'it' ? 'Seleziona esattamente 2 eroi per il tuo Tag Team per iniziare il Circuito.' : 'Please select 2 heroes for your Tag Team to start.')
                : (language === 'it' ? 'Seleziona esattamente 2 eroi per ciascun team per iniziare il match.' : 'Please select exactly 2 heroes for each team to start the match.')}
          </span>
            </div>
        )}

        {hasDuplicateHero && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.draft.duplicateHeroError}</span>
            </div>
        )}

        {isSamePlayer1v1 && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.draft.samePlayerError}</span>
            </div>
        )}

        {matchMode === '2v2' && !is2v2Valid && players.length >= 4 && (
            <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.draft.samePlayerIn2v2Error}</span>
            </div>
        )}

        {/* START MATCH BUTTON */}
        <div className="pt-2 text-center">
          <button
              type="button"
              onClick={handleStart}
              disabled={!canStartMatch}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 disabled:opacity-40 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform active:scale-98 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <Swords className="w-5 h-5" />
            {t.draft.startMatch} {matchMode === 'vs_ai' && '(VS AI)'} {matchMode === '2v2' && '(2v2)'}
          </button>
        </div>

        {/* SOLO RULES MODAL */}
        <SoloRulesModal
            isOpen={showSoloRulesModal}
            onClose={() => setShowSoloRulesModal(false)}
            language={language}
        />
      </div>
  );
};

