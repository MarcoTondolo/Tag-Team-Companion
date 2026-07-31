import { Player, Match, PlayerTeam, Language } from '../types';

const STORAGE_KEYS = {
  PLAYERS: 'tagteam_players',
  MATCHES: 'tagteam_matches',
  ACTIVE_MATCH: 'tagteam_active_match',
  LANGUAGE: 'tagteam_language',
};

// Initial default players if empty
const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Marco', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Luca', createdAt: new Date().toISOString() },
];

export const StorageService = {
  getLanguage(): Language {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (saved === 'en' || saved === 'it') ? saved : 'it';
    } catch {
      return 'it';
    }
  },

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  },

  getPlayers(): Player[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (!saved) {
        this.savePlayers(DEFAULT_PLAYERS);
        return DEFAULT_PLAYERS;
      }
      return JSON.parse(saved);
    } catch {
      return DEFAULT_PLAYERS;
    }
  },

  savePlayers(players: Player[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error('Failed to save players', e);
    }
  },

  addPlayer(name: string): Player {
    const players = this.getPlayers();
    const newPlayer: Player = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    players.push(newPlayer);
    this.savePlayers(players);
    return newPlayer;
  },

  deletePlayer(id: string): void {
    const players = this.getPlayers().filter((p) => p.id !== id);
    this.savePlayers(players);
  },

  getMatches(): Match[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveMatches(matches: Match[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.error('Failed to save matches', e);
    }
  },

  addMatch(match: Match): void {
    const matches = this.getMatches();
    matches.unshift(match); // newest first
    this.saveMatches(matches);
    // Clear active match once saved
    this.clearActiveMatch();
  },

  deleteMatch(matchId: string): void {
    const matches = this.getMatches().filter((m) => m.id !== matchId);
    this.saveMatches(matches);
  },

  getActiveMatch(): { team1: PlayerTeam; team2: PlayerTeam; startTime: string } | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  saveActiveMatch(data: { team1: PlayerTeam; team2: PlayerTeam; startTime: string }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save active match', e);
    }
  },

  clearActiveMatch(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH);
    } catch (e) {
      console.error('Failed to clear active match', e);
    }
  },
};
