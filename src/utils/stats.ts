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
  // 1. Calculate Hero Stats for all 12 base heroes
  const heroStatsMap: Record<string, HeroStats> = {};
  HEROES.forEach((hero) => {
    heroStatsMap[hero.id] = {
      heroId: hero.id,
      heroName: hero.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    };
  });

  // 2. Calculate Composition Stats
  const compStatsMap: Record<string, CompositionStats> = {};

  // 3. Calculate Player Stats
  const playerStatsMap: Record<string, PlayerStats> = {};
  players.forEach((p) => {
    playerStatsMap[p.id] = {
      playerId: p.id,
      playerName: p.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      byCharacter: {},
      byComposition: {},
    };
  });

  // Process each match
  matches.forEach((match) => {
    const isDraw = match.isDraw || match.winnerPlayerId === null;

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

      // --- Process Global Character Stats ---
      [hero1Id, hero2Id].forEach((hId) => {
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
      });

      // --- Process Global Composition Stats ---
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

          // Player's per-character breakdown
          [hero1Id, hero2Id].forEach((hId) => {
            if (!pStat.byCharacter[hId]) {
              pStat.byCharacter[hId] = {
                heroId: hId,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
              };
            }
            const pCharStat = pStat.byCharacter[hId];
            pCharStat.matchesPlayed += 1;
            if (isDraw) pCharStat.draws += 1;
            else if (isWinner) pCharStat.wins += 1;
            else pCharStat.losses += 1;
          });

          // Player's per-composition breakdown
          if (!pStat.byComposition[compId]) {
            pStat.byComposition[compId] = {
              compId,
              heroIds: [hero1Id, hero2Id].sort() as [string, string],
              matchesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              winRate: 0,
            };
          }
          const pCompStat = pStat.byComposition[compId];
          pCompStat.matchesPlayed += 1;
          if (isDraw) pCompStat.draws += 1;
          else if (isWinner) pCompStat.wins += 1;
          else pCompStat.losses += 1;
        }
      });
    };

    const team1Winner = match.winnerPlayerId === match.team1.playerId;
    const team2Winner = match.winnerPlayerId === match.team2.playerId;

    processTeam(match.team1, team1Winner);
    processTeam(match.team2, team2Winner);
  });

  // Calculate Winrates for all
  Object.values(heroStatsMap).forEach((stat) => {
    stat.winRate = computeWinrate(stat.wins, stat.matchesPlayed);
  });

  Object.values(compStatsMap).forEach((stat) => {
    stat.winRate = computeWinrate(stat.wins, stat.matchesPlayed);
  });

  Object.values(playerStatsMap).forEach((stat) => {
    stat.winRate = computeWinrate(stat.wins, stat.matchesPlayed);

    Object.values(stat.byCharacter).forEach((cStat) => {
      cStat.winRate = computeWinrate(cStat.wins, cStat.matchesPlayed);
    });

    Object.values(stat.byComposition).forEach((compStat) => {
      compStat.winRate = computeWinrate(compStat.wins, compStat.matchesPlayed);
    });
  });

  return {
    heroStats: Object.values(heroStatsMap).sort((a, b) => b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
    compStats: Object.values(compStatsMap).sort((a, b) => b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
    playerStats: Object.values(playerStatsMap).sort((a, b) => b.matchesPlayed - a.matchesPlayed || b.winRate - a.winRate),
  };
}
