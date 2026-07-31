import React, { useState, useEffect } from 'react';
import { Swords, AlertCircle, Sparkles, UserPlus, Lock, X } from 'lucide-react';
import { Player, Language, PlayerTeam, MatchHeroState } from '../types';
import { HEROES, getHeroById } from '../data/heroes';
import { getTranslation } from '../data/translations';
import { FighterAvatar } from './FighterAvatar';

interface DraftMatchProps {
  players: Player[];
  onStartMatch: (team1: PlayerTeam, team2: PlayerTeam) => void;
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

  // Player selection
  const [player1Id, setPlayer1Id] = useState<string>(players[0]?.id || '');
  const [player2Id, setPlayer2Id] = useState<string>(
    players.find((p) => p.id !== players[0]?.id)?.id || players[1]?.id || ''
  );

  // Hero draft selections per player (arrays of up to 2 hero IDs)
  const [p1Heroes, setP1Heroes] = useState<string[]>(['wong', 'bodvar']);
  const [p2Heroes, setP2Heroes] = useState<string[]>(['ching_shih', 'joan']);

  // Quick player add state
  const [quickName, setQuickName] = useState('');

  // Keep player selections valid & distinct when players prop changes or on player change
  useEffect(() => {
    if (players.length >= 2) {
      if (!player1Id || !players.some((p) => p.id === player1Id)) {
        const nextP1 = players[0]?.id || '';
        const nextP2 = players.find((p) => p.id !== nextP1)?.id || '';
        setPlayer1Id(nextP1);
        setPlayer2Id(nextP2);
      } else if (!player2Id || player2Id === player1Id || !players.some((p) => p.id === player2Id)) {
        const nextP2 = players.find((p) => p.id !== player1Id)?.id || '';
        setPlayer2Id(nextP2);
      }
    }
  }, [players, player1Id, player2Id]);

  // Check duplicate heroes & team validity
  const allSelectedHeroes = [...p1Heroes, ...p2Heroes];
  const hasDuplicateHero = new Set(allSelectedHeroes).size !== allSelectedHeroes.length;
  const isSamePlayer = player1Id === player2Id;
  const isTeam1Complete = p1Heroes.length === 2;
  const isTeam2Complete = p2Heroes.length === 2;
  const canStartMatch =
    isTeam1Complete && isTeam2Complete && !hasDuplicateHero && !isSamePlayer && player1Id && player2Id;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onQuickAddPlayer(quickName.trim());
    setQuickName('');
  };

  const handlePlayer1Change = (newP1Id: string) => {
    setPlayer1Id(newP1Id);
    if (player2Id === newP1Id) {
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

  // Toggle selection for Player 1
  const toggleP1Hero = (heroId: string) => {
    if (p2Heroes.includes(heroId)) return; // Cannot pick opponent's hero

    if (p1Heroes.includes(heroId)) {
      // Deselect
      setP1Heroes(p1Heroes.filter((id) => id !== heroId));
    } else {
      // Select
      if (p1Heroes.length < 2) {
        setP1Heroes([...p1Heroes, heroId]);
      } else {
        // If already 2 selected, replace the 2nd one
        setP1Heroes([p1Heroes[0], heroId]);
      }
    }
  };

  // Toggle selection for Player 2
  const toggleP2Hero = (heroId: string) => {
    if (p1Heroes.includes(heroId)) return; // Cannot pick opponent's hero

    if (p2Heroes.includes(heroId)) {
      // Deselect
      setP2Heroes(p2Heroes.filter((id) => id !== heroId));
    } else {
      // Select
      if (p2Heroes.length < 2) {
        setP2Heroes([...p2Heroes, heroId]);
      } else {
        // If already 2 selected, replace the 2nd one
        setP2Heroes([p2Heroes[0], heroId]);
      }
    }
  };

  const handleStart = () => {
    if (!canStartMatch) return;

    const p1 = players.find((p) => p.id === player1Id);
    const p2 = players.find((p) => p.id === player2Id);

    if (!p1 || !p2) return;

    // Build MatchHeroState helper
    const buildHeroState = (heroId: string): MatchHeroState => {
      const hero = getHeroById(heroId);
      if (!hero) {
        return { heroId, currentHp: 10, currentPower: 0, isKo: false };
      }

      if (hero.id === 'fey_folk') {
        return {
          heroId,
          currentHp: 12,
          currentPower: hero.startingPower,
          isKo: false,
          feyFolkHp: { elf: 5, gnome: 4, fairy: 3 },
        };
      }

      return {
        heroId,
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

    const team1: PlayerTeam = {
      playerId: p1.id,
      playerName: p1.name,
      heroes: team1Heroes,
    };

    const team2: PlayerTeam = {
      playerId: p2.id,
      playerName: p2.name,
      heroes: team2Heroes,
    };

    onStartMatch(team1, team2);
  };

  if (players.length < 2) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">{t.draft.needPlayers}</h2>
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

  // Filter player options to exclude opponent
  const player1Options = players.filter((p) => p.id !== player2Id);
  const player2Options = players.filter((p) => p.id !== player1Id);

  // Render hero selection grid for a player
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
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Swords className="w-6 h-6 text-amber-400" />
            {t.draft.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'it'
              ? "Tocca un eroe per selezionarlo/deselezionarlo (massimo 2 per giocatore). Gli eroi presi dall'avversario vengono disabilitati."
              : 'Tap a hero icon to select or deselect (max 2 per player). Opponent picks are locked.'}
          </p>
        </div>
      </div>

      {/* Players & Heroes Draft Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PLAYER 1 BOX (BLUE THEME) */}
        <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
            <h3 className="text-base font-extrabold text-blue-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
              {t.draft.player1}
            </h3>
            <select
              value={player1Id}
              onChange={(e) => handlePlayer1Change(e.target.value)}
              className="bg-slate-950 border border-blue-800/80 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {player1Options.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Hero Grid for Player 1 */}
          {renderSingleHeroGrid(p1Heroes, p2Heroes, toggleP1Hero, 'blue')}
        </div>

        {/* PLAYER 2 BOX (RED THEME) */}
        <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
              {t.draft.player2}
            </h3>
            <select
              value={player2Id}
              onChange={(e) => handlePlayer2Change(e.target.value)}
              className="bg-slate-950 border border-rose-800/80 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              {player2Options.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Hero Grid for Player 2 */}
          {renderSingleHeroGrid(p2Heroes, p1Heroes, toggleP2Hero, 'rose')}
        </div>
      </div>

      {/* Special Mechanic Notices & Warnings */}
      {allSelectedHeroes.includes('wild_bunch') && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{t.draft.wildBunchNotice}</span>
        </div>
      )}

      {(!isTeam1Complete || !isTeam2Complete) && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            {language === 'it'
              ? 'Seleziona esattamente 2 eroi per ciascun giocatore per iniziare il match.'
              : 'Please select exactly 2 heroes for each player to start the match.'}
          </span>
        </div>
      )}

      {hasDuplicateHero && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.draft.duplicateHeroError}</span>
        </div>
      )}

      {isSamePlayer && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.draft.samePlayerError}</span>
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
          {t.draft.startMatch}
        </button>
      </div>
    </div>
  );
};
