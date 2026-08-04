import React, { useState, useEffect } from 'react';
import { Flame, ShieldAlert, BookOpen, Zap, Plus, Minus, Heart, RefreshCw, Sparkles, Crosshair, Swords, Shield } from 'lucide-react';
import { AiDifficulty, Language, PlayerTeam, MatchHeroState } from '../types';
import { getTranslation } from '../data/translations';
import { getHeroById } from '../data/heroes';
import { SoloRulesModal } from './SoloRulesModal';

interface CircuitClandestinoCardProps {
  aiDifficulty?: AiDifficulty;
  language: Language;
  team1: PlayerTeam;
  onUpdateHeroHp?: (heroIndex: number, delta: number) => void;
  onUpdateHeroPower?: (heroIndex: number, delta: number) => void;
  onTriggerVictory?: () => void;
}

export interface CardDraw {
  rank: string; // '2'-'10', 'J', 'Q', 'K', 'A'
  suit: string; // '♥️', '♦️', '♠️', '♣️'
  value: number; // 2-10, J=11, Q=12, K=13, A=14
}

const SUITS = ['♥️', '♦️', '♠️', '♣️'];

export const CircuitClandestinoCard: React.FC<CircuitClandestinoCardProps> = ({
  aiDifficulty = 'normal',
  language,
  team1,
  onUpdateHeroHp,
  onUpdateHeroPower,
  onTriggerVictory,
}) => {
  const t = getTranslation(language);
  const isIt = language === 'it';

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Circuit Run State
  const [wave, setWave] = useState<number>(1); // 1 to 5
  const [momentum, setMomentum] = useState<number>(0);

  // Calculate base & max Wave HP for current wave based on difficulty
  const getMaxHpForWave = (w: number): number => {
    const baseHpMap: Record<AiDifficulty, number> = {
      easy: 10,
      normal: 14,
      hard: 18,
    };
    const base = baseHpMap[aiDifficulty] || 14;
    return base + (w - 1) * 4;
  };

  const initialMaxHp = getMaxHpForWave(1);
  const [waveHp, setWaveHp] = useState<number>(initialMaxHp);
  const maxWaveHp = getMaxHpForWave(wave);

  // Update Wave HP max when wave changes
  useEffect(() => {
    setWaveHp(getMaxHpForWave(wave));
  }, [wave, aiDifficulty]);

  // Active Threat Card Effects State
  const [lastDrawnCard, setLastDrawnCard] = useState<CardDraw | null>(null);
  const [pendingAttack, setPendingAttack] = useState<{ amount: number; card: CardDraw } | null>(null);
  const [hasDefenseReduction, setHasDefenseReduction] = useState<boolean>(false); // J/Q/K effect (-1 dmg on next player attack)
  const [isAceActive, setIsAceActive] = useState<boolean>(false); // Ace effect (double damage on next threat draw)
  const [deckRemaining, setDeckRemaining] = useState<number>(0);
  const [deckStack, setDeckStack] = useState<CardDraw[]>([]);
  const [logHistory, setLogHistory] = useState<string[]>([]);

  const getHeroName = (heroState?: MatchHeroState, fallbackIdx: number = 0): string => {
    if (!heroState) return isIt ? `Lottatore ${fallbackIdx + 1}` : `Fighter ${fallbackIdx + 1}`;
    const heroData = getHeroById(heroState.heroId);
    return heroData ? heroData.name : heroState.heroId;
  };

  // Build a shuffled Threat Deck for current wave
  const createFreshDeck = (currentWave: number): CardDraw[] => {
    let ranks: string[] = [];
    if (aiDifficulty === 'easy') {
      const maxRank = Math.min(10, 6 + (currentWave - 1));
      for (let r = 2; r <= maxRank; r++) ranks.push(String(r));
    } else if (aiDifficulty === 'normal') {
      ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
      if (currentWave >= 2) ranks.push('J');
      if (currentWave >= 3) ranks.push('Q');
      if (currentWave >= 4) ranks.push('K');
      if (currentWave >= 5) ranks.push('A');
    } else {
      ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    }

    const cards: CardDraw[] = [];
    ranks.forEach((rank) => {
      SUITS.forEach((suit) => {
        let value = parseInt(rank, 10);
        if (rank === 'J') value = 11;
        if (rank === 'Q') value = 12;
        if (rank === 'K') value = 13;
        if (rank === 'A') value = 14;
        cards.push({ rank, suit, value });
      });
    });

    // Fisher-Yates Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  };

  // Initialize deck stack
  useEffect(() => {
    const newDeck = createFreshDeck(wave);
    setDeckStack(newDeck);
    setDeckRemaining(newDeck.length);
  }, [wave, aiDifficulty]);

  // Subtract damage from Wave HP (applying J/Q/K defense reduction if active)
  const handleDealDamageToWave = (baseAmount: number) => {
    if (waveHp <= 0) return;

    let finalDamage = baseAmount;
    if (hasDefenseReduction) {
      finalDamage = Math.max(0, baseAmount - 1);
      setHasDefenseReduction(false);
    }

    const newHp = Math.max(0, waveHp - finalDamage);
    setWaveHp(newHp);

    let logMsg = isIt
      ? `💥 Attacco! Inflitti ${finalDamage} danni all'Ondata ${wave} (HP: ${newHp}/${maxWaveHp})`
      : `💥 Attack! Dealt ${finalDamage} damage to Wave ${wave} (HP: ${newHp}/${maxWaveHp})`;

    if (hasDefenseReduction && baseAmount > 0) {
      logMsg += isIt ? ' [-1 per Difesa Threat (J/Q/K)]' : ' [-1 from Threat Defense (J/Q/K)]';
    }

    if (newHp === 0) {
      // Award +1 Momentum bonus for clearing Wave HP!
      setMomentum((m) => m + 1);
      logMsg += isIt ? ' ➔ ONDATA SUPERATA! (+1 Momentum guadagnato!)' : ' ➔ WAVE CLEARED! (+1 Momentum gained!)';
    }

    setLogHistory((prev) => [logMsg, ...prev.slice(0, 4)]);
  };

  // Draw Threat Card Action
  const handleDrawThreatCard = () => {
    let currentStack = [...deckStack];

    // Check if deck is empty -> Reshuffle & Grant +1 Momentum!
    if (currentStack.length === 0) {
      currentStack = createFreshDeck(wave);
      setMomentum((m) => m + 1);
      setLogHistory((prev) => [
        isIt
          ? '🔄 Threat Deck esaurito e rimescolato! (+1 Momentum guadagnato per aver resistito!)'
          : '🔄 Threat Deck exhausted & reshuffled! (+1 Momentum gained for holding the line!)',
        ...prev.slice(0, 4),
      ]);
    }

    const drawn = currentStack.shift()!;
    setDeckStack(currentStack);
    setDeckRemaining(currentStack.length);
    setLastDrawnCard(drawn);

    let logText = '';
    const { rank, suit, value } = drawn;

    if (['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(rank)) {
      let attackHp = value;
      if (isAceActive) {
        attackHp = value * 2;
        setIsAceActive(false);
        logText = `🅰️💥 ${rank} ${suit}: ${
          isIt
            ? `Attacco RADDOPPIATO dall'Asso ➔ ${attackHp} HP Danni! Seleziona chi li subisce.`
            : `DOUBLE Attack from Ace ➔ ${attackHp} HP Damage! Select target hero.`
        }`;
      } else {
        logText = `🃏 ${rank} ${suit}: ${
          isIt
            ? `Attacco ${attackHp} HP! Seleziona l'eroe che subirà i danni.`
            : `Attack ${attackHp} HP! Select the hero to take damage.`
        }`;
      }
      setPendingAttack({ amount: attackHp, card: drawn });
    } else if (['J', 'Q', 'K'].includes(rank)) {
      setPendingAttack(null);
      setHasDefenseReduction(true);
      logText = `👑 ${rank} ${suit}: ${
        isIt
          ? '🛡️ Il Threat si difende meglio! Il tuo prossimo attacco infliggerà -1 danno'
          : '🛡️ Threat defends better! Your next attack will deal -1 damage'
      }`;
    } else if (rank === 'A') {
      setPendingAttack(null);
      setIsAceActive(true);
      logText = `🅰️ ${rank} ${suit}: ${
        isIt
          ? '💥 Colpo Speciale! Danno doppio sulla prossima carta minaccia pescata'
          : '💥 Special Move! Double damage on next drawn threat card'
      }`;
    }

    setLogHistory((prev) => [logText, ...prev.slice(0, 4)]);
  };

  // Apply Pending Attack Damage to Selected Hero
  const handleApplyDamageToHero = (heroIndex: number) => {
    if (!pendingAttack || !onUpdateHeroHp) return;

    const heroState = team1.heroes[heroIndex];
    const isWildBunch = heroState?.heroId === 'wild_bunch';
    const baseDmg = pendingAttack.amount;

    // Wild Bunch can only take 1 HP of damage at a time
    const actualDamage = isWildBunch ? Math.min(1, baseDmg) : baseDmg;

    onUpdateHeroHp(heroIndex, -actualDamage);

    const heroName = getHeroName(heroState, heroIndex);
    let logText = isIt
      ? `💥 ${heroName} subisce -${actualDamage} HP di danno`
      : `💥 ${heroName} takes -${actualDamage} HP damage`;

    if (isWildBunch && baseDmg > 1) {
      logText += isIt
        ? ' (ridotto a -1 HP per la regola del Mucchio Selvaggio!)'
        : ' (reduced to -1 HP due to Wild Bunch rule!)';
    }

    setLogHistory((prev) => [logText, ...prev.slice(0, 4)]);
    setPendingAttack(null);
  };

  // Cancel Ace Double Damage with 1 Momentum
  const handleCancelAceWithMomentum = () => {
    if (momentum < 1 || !isAceActive) return;
    setMomentum((m) => m - 1);
    setIsAceActive(false);
    setLogHistory((prev) => [
      isIt
        ? '🛡️ Speso 1 Momentum: Raddoppio dell\'Asso ANNULLATO con successo!'
        : '🛡️ Spent 1 Momentum: Ace double damage CANCELLED successfully!',
      ...prev.slice(0, 4),
    ]);
  };

  // Spend Momentum for Heal
  const handleSpendMomentumHeal = (heroIndex: number) => {
    if (momentum < 1) return;
    setMomentum((m) => m - 1);

    const heroState = team1.heroes[heroIndex];
    const isWildBunch = heroState?.heroId === 'wild_bunch';
    const healAmount = isWildBunch ? 1 : 2;

    if (onUpdateHeroHp) {
      onUpdateHeroHp(heroIndex, healAmount);
    }
    const heroName = getHeroName(heroState, heroIndex);
    setLogHistory((prev) => [
      isIt
        ? `💚 Speso 1 Momentum: +${healAmount} HP a ${heroName}${isWildBunch ? ' (max +1 per Mucchio Selvaggio)' : ''}`
        : `💚 Spent 1 Momentum: +${healAmount} HP to ${heroName}${isWildBunch ? ' (max +1 for Wild Bunch)' : ''}`,
      ...prev.slice(0, 4),
    ]);
  };

  // Spend Momentum for Draw Extra Card
  const handleSpendMomentumRedraw = () => {
    if (momentum < 1) return;
    setMomentum((m) => m - 1);
    setLogHistory((prev) => [
      isIt ? '🎴 Speso 1 Momentum: Pesca carta extra in fase Build' : '🎴 Spent 1 Momentum: Draw extra card in Build phase',
      ...prev.slice(0, 4),
    ]);
  };

  // Complete Wave & Apply Recovery
  const handleCompleteWave = () => {
    if (wave >= 5) {
      if (onTriggerVictory) onTriggerVictory();
      return;
    }

    let hpBonus = 3;
    let powerBonus = 1;

    if (wave === 3) {
      hpBonus = 2;
      powerBonus = 1;
    } else if (wave === 4) {
      hpBonus = 2;
      powerBonus = 0;
    }

    if (onUpdateHeroHp) {
      onUpdateHeroHp(0, hpBonus);
      onUpdateHeroHp(1, hpBonus);
    }
    if (onUpdateHeroPower && powerBonus > 0) {
      onUpdateHeroPower(0, powerBonus);
      onUpdateHeroPower(1, powerBonus);
    }

    const nextWave = wave + 1;
    setWave(nextWave);
    setLastDrawnCard(null);

    setLogHistory((prev) => [
      isIt
        ? `🎉 Ondata ${wave} Superata! Recupero applicato (+${hpBonus} HP, +${powerBonus} Potere ciascuno). Inizio Ondata ${nextWave}!`
        : `🎉 Wave ${wave} Cleared! Recovery applied (+${hpBonus} HP, +${powerBonus} Power each). Starting Wave ${nextWave}!`,
      ...prev.slice(0, 4),
    ]);
  };

  const isWaveCleared = waveHp <= 0;

  const diffLabelMap: Record<AiDifficulty, { label: string; color: string }> = {
    easy: { label: isIt ? 'Apprendista (10 HP)' : 'Apprentice (10 HP)', color: 'bg-emerald-500 text-slate-950 border-emerald-400' },
    normal: { label: isIt ? 'Veterano (14 HP)' : 'Veteran (14 HP)', color: 'bg-amber-500 text-slate-950 border-amber-400' },
    hard: { label: isIt ? 'Leggenda (18 HP)' : 'Legend (18 HP)', color: 'bg-rose-600 text-white border-rose-500' },
  };

  const currentDiff = diffLabelMap[aiDifficulty] || diffLabelMap.normal;

  return (
    <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-black text-white text-base flex items-center gap-2">
              🥊 {isIt ? 'Il Circuito Clandestino' : 'The Underground Circuit'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isIt ? 'Modalità Solitario con Barra HP dell\'Ondata & Threat Deck' : 'Solo Wave HP Bar & Threat Deck'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-xl text-xs font-black border shadow-sm ${currentDiff.color}`}>
            {currentDiff.label}
          </span>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title={isIt ? 'Regolamento Completo' : 'Full Rules'}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* WAVE HP BAR & DAMAGE ACTION PANEL */}
      <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs rounded-xl flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              {isIt ? `Ondata ${wave} di 5` : `Wave ${wave} of 5`}
            </span>
            <span className="text-sm font-black text-white">
              HP Ondata: <span className="text-amber-400">{waveHp}</span> / {maxWaveHp}
            </span>
          </div>

          {/* Manual HP Adjusters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold">{isIt ? 'Regola HP:' : 'Adjust HP:'}</span>
            <button
              type="button"
              onClick={() => setWaveHp((h) => Math.max(0, h - 1))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center text-xs font-black cursor-pointer border border-slate-700"
              title="-1 HP"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => setWaveHp((h) => Math.min(maxWaveHp, h + 1))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center text-xs font-black cursor-pointer border border-slate-700"
              title="+1 HP"
            >
              +1
            </button>
          </div>
        </div>

        {/* Progress HP Bar */}
        <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              isWaveCleared
                ? 'bg-emerald-500'
                : waveHp <= maxWaveHp * 0.3
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, (waveHp / maxWaveHp) * 100))}%` }}
          />
        </div>

        {/* QUICK ATTACK DAMAGE BUTTONS */}
        {!isWaveCleared ? (
          <div className="pt-1">
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-300">
                <Swords className="w-3.5 h-3.5" />
                {isIt ? 'Infliggi Danno all\'Ondata:' : 'Deal Damage to Wave:'}
              </span>
              {hasDefenseReduction && (
                <span className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-400" />
                  {isIt ? 'Difesa Threat Attiva (-1 Danno)' : 'Threat Defense Active (-1 Damage)'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((dmg) => (
                <button
                  key={dmg}
                  type="button"
                  onClick={() => handleDealDamageToWave(dmg)}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-amber-500/20 hover:border-amber-500/50 text-white font-extrabold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <span>-{hasDefenseReduction ? Math.max(0, dmg - 1) : dmg} HP</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* WAVE CLEARED BANNER */
          <button
            type="button"
            onClick={handleCompleteWave}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {wave < 5
              ? (isIt ? `Ondata ${wave} Azzerata! Passa all'Ondata ${wave + 1} (+Recupero +3 HP / +1 PWR)` : `Wave ${wave} Cleared! Advance to Wave ${wave + 1} (+Recovery +3 HP / +1 PWR)`)
              : (isIt ? '🏆 CONQUISTA IL CIRCUITO CLANDESTINO! (Vittoria)' : '🏆 CONQUER THE UNDERGROUND CIRCUIT! (Victory)')}
          </button>
        )}
      </div>

      {/* INTERACTIVE THREAT DECK DRAWER & MOMENTUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Draw Card Action Panel */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {isIt ? 'Threat Deck (Minaccia)' : 'Threat Deck'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              {isIt ? 'Carte nel Mazzo:' : 'Cards left:'} <strong className="text-amber-400">{deckRemaining}</strong>
            </span>
          </div>

          {/* Last Drawn Card Box */}
          {lastDrawnCard ? (
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              pendingAttack ? 'bg-red-950/60 border-red-500/60' : 'bg-slate-900 border-amber-500/30'
            }`}>
              <div className="w-12 h-16 bg-white rounded-lg border-2 border-slate-300 flex flex-col items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                <span className="text-base leading-none">{lastDrawnCard.rank}</span>
                <span className="text-sm leading-none">{lastDrawnCard.suit}</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <span>
                    {lastDrawnCard.rank === 'J' || lastDrawnCard.rank === 'Q' || lastDrawnCard.rank === 'K'
                      ? (isIt ? '👑 Figura pescata!' : '👑 Face Card drawn!')
                      : lastDrawnCard.rank === 'A'
                      ? (isIt ? '🅰️ Asso Pescato!' : '🅰️ Ace Drawn!')
                      : (isIt ? `Attacco ${lastDrawnCard.value} HP` : `Attack ${lastDrawnCard.value} HP`)}
                  </span>
                  {pendingAttack && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded font-black animate-pulse">
                      {isIt ? 'IN ATTESA' : 'PENDING'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">
                  {['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(lastDrawnCard.rank) &&
                    (pendingAttack
                      ? (isIt ? `Seleziona l'eroe sotto che subirà -${pendingAttack.amount} HP.` : `Select the hero below to take -${pendingAttack.amount} HP.`)
                      : (isIt ? `Attacco risolto pari a ${lastDrawnCard.value} HP.` : `Attack resolved for ${lastDrawnCard.value} HP.`))}
                  {['J', 'Q', 'K'].includes(lastDrawnCard.rank) &&
                    (isIt ? '🛡️ Il Threat si difende meglio: -1 Danno al tuo prossimo attacco.' : '🛡️ Threat defends better: -1 Damage on your next attack.')}
                  {lastDrawnCard.rank === 'A' &&
                    (isIt ? '💥 Danno doppio sulla prossima carta minaccia!' : '💥 Double damage on next drawn threat card!')}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
              {isIt ? 'Premi il pulsante sotto per pescare dal Threat Deck' : 'Press button below to draw from Threat Deck'}
            </div>
          )}

          {/* DAMAGE TARGET SELECTION (Underneath drawn card & above draw button) */}
          {pendingAttack && (
            <div className="p-3 bg-red-950/80 border-2 border-red-500/70 rounded-xl space-y-2 animate-pulse-once">
              <div className="flex items-center justify-between border-b border-red-800/60 pb-1.5">
                <span className="text-xs font-black text-red-200 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-red-400" />
                  {isIt ? 'Chi subisce l\'attacco?' : 'Who takes the attack?'}
                </span>
                <span className="text-[10px] font-black bg-red-900 px-2 py-0.5 rounded border border-red-600 text-white">
                  -{pendingAttack.amount} HP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {team1.heroes.slice(0, 2).map((h, idx) => {
                  const heroName = getHeroName(h, idx);
                  const isWildBunch = h?.heroId === 'wild_bunch';
                  const isKo = h ? (h.currentHp <= 0 || h.isKo) : false;
                  const currentHp = h?.currentHp ?? 10;
                  const damageToTake = isWildBunch ? Math.min(1, pendingAttack.amount) : pendingAttack.amount;
                  const newHp = Math.max(0, currentHp - damageToTake);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyDamageToHero(idx)}
                      disabled={isKo}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-md ${
                        isKo
                          ? 'bg-slate-900 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                          : 'bg-red-900/70 hover:bg-red-600/80 border-red-500/80 text-white active:scale-95'
                      }`}
                    >
                      {/* Hero Name */}
                      <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs">
                        <span>{heroName}</span>
                        {isKo && <span className="text-[10px] text-red-400 font-bold">(KO)</span>}
                      </div>

                      {/* HP Current -> New HP */}
                      <div className="text-[11px] font-extrabold text-slate-200 flex items-center gap-1">
                        <span className="text-slate-400 font-normal">HP:</span>
                        <span className="text-white font-black">{currentHp}</span>
                        <span className="text-red-400 font-bold">➔</span>
                        <span className="text-red-300 font-black">{newHp}</span>
                        <span className="text-[10px] bg-red-950 px-1.5 py-0.2 rounded border border-red-700/60 text-red-300 ml-0.5 font-black">
                          -{damageToTake}
                        </span>
                      </div>

                      {/* Wild Bunch special rule */}
                      {isWildBunch && pendingAttack.amount > 1 && (
                        <span className="text-[9px] text-emerald-300 font-bold leading-tight">
                          ({isIt ? 'Mucchio Selvaggio: max -1 HP' : 'Wild Bunch: max -1 HP'})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDrawThreatCard}
              disabled={pendingAttack !== null}
              className={`w-full py-2.5 px-4 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 ${
                pendingAttack !== null
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
              }`}
              title={
                pendingAttack !== null
                  ? (isIt ? 'Seleziona prima l\'eroe che subisce il danno!' : 'Select the hero taking damage first!')
                  : undefined
              }
            >
              <RefreshCw className="w-4 h-4" />
              {pendingAttack !== null
                ? (isIt ? 'Seleziona l\'Eroe per continuare' : 'Select Hero to continue')
                : (isIt ? 'Pesca Carta Minaccia' : 'Draw Threat Card')}
            </button>

            {/* Ace Active Special Choice Button */}
            {isAceActive && (
              <button
                type="button"
                onClick={handleCancelAceWithMomentum}
                disabled={momentum < 1}
                className="w-full py-2 px-3 bg-amber-950 border border-amber-500/60 hover:bg-amber-900 disabled:opacity-40 text-amber-200 font-bold text-xs rounded-xl flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <span>💥</span>
                  <span>{isIt ? 'Annulla Raddoppio dell\'Asso' : 'Cancel Ace Double Damage'}</span>
                </span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40 text-amber-400 font-black">
                  -1 ⚡
                </span>
              </button>
            )}

            {/* Defense Active Indicator */}
            {hasDefenseReduction && (
              <div className="w-full py-1.5 px-3 bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold text-[11px] rounded-xl flex items-center justify-between">
                <span>🛡️ Threat in Difesa (-1 Danno al tuo prossimo attacco)</span>
              </div>
            )}
          </div>
        </div>

        {/* MOMENTUM STRATEGIC BANK */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              {isIt ? 'Momentum (Riserva Strategica)' : 'Momentum (Strategic Reserve)'}
            </span>
            <div className="flex items-center gap-1 text-sm font-black text-white bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              <span>⚡ {momentum}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400">
              {isIt ? 'Spendi 1 Momentum:' : 'Spend 1 Momentum:'}
            </div>

            {/* Dynamic Heal Buttons for Team 1 Heroes */}
            {team1.heroes.slice(0, 2).map((h, idx) => {
              const heroName = getHeroName(h, idx);
              const isWildBunch = h?.heroId === 'wild_bunch';
              const healAmount = isWildBunch ? 1 : 2;
              const isKo = h ? (h.currentHp <= 0 || h.isKo) : false;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSpendMomentumHeal(idx)}
                  disabled={momentum < 1 || isKo}
                  className="w-full p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 shrink-0" />
                    <span>
                      {isIt ? `Cura +${healAmount} HP a ${heroName}` : `Heal +${healAmount} HP to ${heroName}`}
                    </span>
                    {isWildBunch && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        ({isIt ? 'Mucchio Selvaggio: max +1' : 'Wild Bunch: max +1'})
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-bold">
                    -1 ⚡
                  </span>
                </button>
              );
            })}

            {/* Draw Extra Build Card Button */}
            <button
              type="button"
              onClick={() => handleSpendMomentumRedraw()}
              disabled={momentum < 1}
              className="w-full p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {isIt ? 'Pesca Carta Extra (Fase Build)' : 'Draw Extra Card (Build Phase)'}
              </span>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                -1 ⚡
              </span>
            </button>
          </div>

          {/* Manual Momentum Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">{isIt ? 'Regola Momentum:' : 'Adjust Momentum:'}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMomentum((m) => Math.max(0, m - 1))}
                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setMomentum((m) => m + 1)}
                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMBAT & CIRCUIT LOG */}
      {logHistory.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1.5">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            {isIt ? 'Registro Eventi Circuito' : 'Circuit Event Log'}
          </div>
          <div className="space-y-1 text-xs">
            {logHistory.map((log, index) => (
              <div
                key={index}
                className="p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-lg text-slate-200 font-medium"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RULES MODAL TRIGGER */}
      <SoloRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        language={language}
      />
    </div>
  );
};
