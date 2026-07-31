export type Language = 'it' | 'en';

export interface Hero {
  id: string;
  name: string;
  title: {
    it: string;
    en: string;
  };
  startingHp: number;
  startingPower: number;
  maxHp: number;
  hasMaxHpCap?: boolean;
  avatarColor: string; // Tailwind color theme (e.g. 'amber', 'emerald', 'indigo', etc.)
  iconName: string;
  specialMechanic?: {
    type: 'fey_folk' | 'bodvar_bear' | 'wild_bunch' | 'none';
    description: {
      it: string;
      en: string;
    };
  };
}

export interface FeyFolkHp {
  elf: number;   // Max 5
  gnome: number; // Max 4
  fairy: number; // Max 3
}

export interface MatchHeroState {
  heroId: string;
  image: string;
  currentHp: number; // For non-Fey Folk
  currentPower: number;
  isKo: boolean;
  // Special mechanic states
  feyFolkHp?: FeyFolkHp;
  isBearForm?: boolean; // For Bodvar
}

export interface PlayerTeam {
  playerId: string;
  playerName: string;
  heroes: MatchHeroState[];
}

export interface Match {
  id: string;
  date: string; // ISO string
  team1: PlayerTeam;
  team2: PlayerTeam;
  winnerPlayerId: string | null; // null = Draw
  isDraw: boolean;
  notes?: string;
  durationSeconds?: number;
}

export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface PlayerStatDetail {
  heroId?: string;
  compId?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  byCharacter: Record<string, PlayerStatDetail>; // heroId -> stats
  byComposition: Record<string, PlayerStatDetail>; // compId -> stats
}

export interface HeroStats {
  heroId: string;
  heroName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface CompositionStats {
  compId: string; // e.g. "bodvar_wong"
  heroIds: [string, string];
  compName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}
