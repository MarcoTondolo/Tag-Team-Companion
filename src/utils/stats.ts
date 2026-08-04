import { Match, Player, PlayerStats, HeroStats, CompositionStats, PlayerStatDetail } from '../types';
import { HEROES, getHeroById } from '../data/heroes';

/**
 * Creates a canonical composition ID from two hero IDs (alphabetical order)
 * e.g. ['wong', 'bodvar'] -> 'bodvar+wong'
 */
export function getCompId(hero1Id: string, hero2Id: string): string {
  return [hero1Id, hero2Id].sort().join('+');
}

/**
 * Safely extracts hero IDs from a composition ID regardless of delimiter or underscores in hero IDs
 */
export function getHeroIdsFromCompId(compId: string): [string, string] {
  if (compId.includes('+')) {
    const parts = compId.split('+');
    return [parts[0] || '', parts[1] || ''];
  }
  if (compId.includes('::')) {
    const parts = compId.split('::');
    return [parts[0] || '', parts[1] || ''];
  }
  // Fallback for legacy compIds generated with '_' (e.g. 'ching_shih_wong' or 'bodvar_wong')
  const sortedHeroes = [...HEROES].sort((a, b) => b.id.length - a.id.length);
  const heroesFound: string[] = [];
  let tempId = compId;
  for (const h of sortedHeroes) {
    if (tempId.includes(h.id)) {
      heroesFound.push(h.id);
      tempId = tempId.replace(h.id, '');
      if (heroesFound.length === 2) break;
    }
  }
  if (heroesFound.length === 2) {
    return [heroesFound[0], heroesFound[1]];
  }
  const parts = compId.split('_');
  return [parts[0] || '', parts[1] || ''];
}

/**
 * Formats a composition display name, e.g., "Bödvar & Wong"
 */
export function getCompName(hero1Id: string, hero2Id: string): string {
  const sortedIds = [hero1Id, hero2Id].sort();
  const h1 = getHeroById(sortedIds[0]);
  const h2 = getHeroById(sortedIds[1]);
  return `${h1?.name || sortedIds[0]} & ${h2?.name || sortedIds[1]}`;
}

export function computeWinrate(wins: number, matches: number): number {
  if (matches === 0) return 0;
  return Math.round((wins / matches) * 1000) / 10; // 1 decimal place e.g. 66.7
}

export function calculateAllStats(players: Player[], matches: Match[], filterPlayerId?: string) {
  // Helper interface to hold temporary wave calculation properties
  type WaveStatAcc = {
    maxWave?: number;
    avgWave?: number;
    wavesSum?: number;
    wavesCount?: number;
  };

  // 1. Calculate Hero Stats for all 12 base heroes
  const heroStatsMap: Record<string, HeroStats & WaveStatAcc> = {};
  HEROES.forEach((hero) => {
    heroStatsMap[hero.id] = {
      heroId: hero.id,
      heroName: hero.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      maxWave: 0,
      avgWave: 0,
      wavesSum: 0,
      wavesCount: 0,
    };
  });

  // 2. Calculate Composition Stats
  const compStatsMap: Record<string, CompositionStats & WaveStatAcc> = {};

  // 3. Calculate Player Stats
  const playerStatsMap: Record<string, PlayerStats & WaveStatAcc> = {};
  players.forEach((p) => {
    playerStatsMap[p.id] = {
      playerId: p.id,
      playerName: p.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      maxWave: 0,
      avgWave: 0,
      wavesSum: 0,
      wavesCount: 0,
      byCharacter: {},
      byComposition: {},
    };
  });

  // Process each match
  matches.forEach((match) => {
    const isDraw = match.isDraw || match.winnerPlayerId === null;
    const isSolo = match.isVsAi || match.gameMode === 'vs_ai' || match.team2?.playerId === 'bot_ai' || match.team2?.playerId === 'threat_deck';
    const waveVal = match.maxWave !== undefined ? match.maxWave : (isSolo ? 1 : undefined);

    // Helper to process team side
    const processTeam = (team: Match['team1'], isWinner: boolean) => {
      const { playerId, heroes } = team;

      // If filtering by specific player, check if either player on the team matches
      const teamPlayerIds = [team.playerId, team.player2Id].filter(Boolean) as string[];
      if (filterPlayerId && filterPlayerId !== 'all' && !teamPlayerIds.includes(filterPlayerId)) {
        return;
      }

      const hero1Id = heroes[0]?.heroId;
      const hero2Id = heroes[1]?.heroId;

      if (!hero1Id || !hero2Id) return;

      const compId = getCompId(hero1Id, hero2Id);
      const compName = getCompName(hero1Id, hero2Id);

      // Helper to record wave metrics
      const recordWave = (obj: WaveStatAcc) => {
        if (waveVal !== undefined && waveVal > 0) {
          obj.maxWave = Math.max(obj.maxWave || 0, waveVal);
          obj.wavesSum = (obj.wavesSum || 0) + waveVal;
          obj.wavesCount = (obj.wavesCount || 0) + 1;
        }
      };

      // --- Process Global Character Stats ---
      [hero1Id, hero2Id].forEach((hId) => {
        if (hId === 'threat_deck') return;
        if (!heroStatsMap[hId]) {
          const hObj = getHeroById(hId);
          heroStatsMap[hId] = {
            heroId: hId,
            heroName: hObj?.name || hId,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            maxWave: 0,
            avgWave: 0,
            wavesSum: 0,
            wavesCount: 0,
          };
        }
        const hStat = heroStatsMap[hId];
        hStat.matchesPlayed += 1;
        if (isDraw) {
          hStat.draws += 1;
        } else if (isWinner) {
          hStat.wins += 1;
        } else {
          hStat.losses += 1;
        }
        recordWave(hStat);
      });

      // --- Process Global Composition Stats ---
      if (hero1Id !== 'threat_deck' && hero2Id !== 'threat_deck') {
        if (!compStatsMap[compId]) {
          compStatsMap[compId] = {
            compId,
            heroIds: [hero1Id, hero2Id].sort() as [string, string],
            compName,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            maxWave: 0,
            avgWave: 0,
            wavesSum: 0,
            wavesCount: 0,
          };
        }
        const cStat = compStatsMap[compId];
        cStat.matchesPlayed += 1;
        if (isDraw) {
          cStat.draws += 1;
        } else if (isWinner) {
          cStat.wins += 1;
        } else {
          cStat.losses += 1;
        }
        recordWave(cStat);
      }

      // --- Process Player Stats ---
      teamPlayerIds.forEach((pId) => {
        if (playerStatsMap[pId]) {
          const pStat = playerStatsMap[pId];
          pStat.matchesPlayed += 1;
          if (isDraw) {
            pStat.draws += 1;
          } else if (isWinner) {
            pStat.wins += 1;
          } else {
            pStat.losses += 1;
          }
          recordWave(pStat);

          // Player's per-character breakdown
          [hero1Id, hero2Id].forEach((hId) => {
            if (hId === 'threat_deck') return;
            if (!pStat.byCharacter[hId]) {
              pStat.byCharacter[hId] = {
                heroId: hId,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                maxWave: 0,
                avgWave: 0,
                wavesSum: 0,
                wavesCount: 0,
              };
            }
            const pCharStat = pStat.byCharacter[hId] as PlayerStatDetail & WaveStatAcc;
            pCharStat.matchesPlayed += 1;
            if (isDraw) pCharStat.draws += 1;
            else if (isWinner) pCharStat.wins += 1;
            else pCharStat.losses += 1;
            recordWave(pCharStat);
          });

          // Player's per-composition breakdown
          if (hero1Id !== 'threat_deck' && hero2Id !== 'threat_deck') {
            if (!pStat.byComposition[compId]) {
              pStat.byComposition[compId] = {
                compId,
                heroIds: [hero1Id, hero2Id].sort() as [string, string],
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                maxWave: 0,
                avgWave: 0,
                wavesSum: 0,
                wavesCount: 0,
              };
            }
            const pCompStat = pStat.byComposition[compId] as PlayerStatDetail & WaveStatAcc;
            pCompStat.matchesPlayed += 1;
            if (isDraw) pCompStat.draws += 1;
            else if (isWinner) pCompStat.wins += 1;
            else pCompStat.losses += 1;
            recordWave(pCompStat);
          }
        }
      });
    };

    const team1Winner = match.winnerPlayerId === match.team1.playerId;
    const team2Winner = match.winnerPlayerId === match.team2.playerId;

    processTeam(match.team1, team1Winner);
    if (!isSolo && match.team2?.playerId !== 'bot_ai' && match.team2?.playerId !== 'threat_deck') {
      processTeam(match.team2, team2Winner);
    }
  });

  // Helper to finalize object wave & winrate stats
  const finalizeStats = (stat: { winRate: number; wins: number; matchesPlayed: number; maxWave?: number; avgWave?: number } & WaveStatAcc) => {
    stat.winRate = computeWinrate(stat.wins, stat.matchesPlayed);
    if (stat.wavesCount && stat.wavesCount > 0) {
      stat.avgWave = Math.round(((stat.wavesSum || 0) / stat.wavesCount) * 10) / 10;
      stat.maxWave = stat.maxWave || 1;
    } else {
      stat.maxWave = 0;
      stat.avgWave = 0;
    }
    delete stat.wavesSum;
    delete stat.wavesCount;
  };

  // Calculate Winrates & Waves for all
  Object.values(heroStatsMap).forEach(finalizeStats);
  Object.values(compStatsMap).forEach(finalizeStats);
  Object.values(playerStatsMap).forEach((stat) => {
    finalizeStats(stat);
    Object.values(stat.byCharacter).forEach((cStat) => finalizeStats(cStat as any));
    Object.values(stat.byComposition).forEach((compStat) => finalizeStats(compStat as any));
  });

  return {
    heroStats: Object.values(heroStatsMap).sort((a, b) => (b.avgWave || 0) - (a.avgWave || 0) || b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
    compStats: Object.values(compStatsMap).sort((a, b) => (b.avgWave || 0) - (a.avgWave || 0) || b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
    playerStats: Object.values(playerStatsMap).sort((a, b) => (b.avgWave || 0) - (a.avgWave || 0) || b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
  };
}
