import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DraftMatch } from './components/DraftMatch';
import { ActiveMatch } from './components/ActiveMatch';
import { PlayersManager } from './components/PlayersManager';
import { StatsView } from './components/StatsView';
import { MatchHistoryView } from './components/MatchHistoryView';
import { StorageService } from './services/storage';
import { Player, Match, PlayerTeam, Language, AiDifficulty, GameMode } from './types';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => StorageService.getLanguage());
  const [players, setPlayers] = useState<Player[]>(() => StorageService.getPlayers());
  const [matches, setMatches] = useState<Match[]>(() => StorageService.getMatches());

  const [activeMatch, setActiveMatch] = useState<{
    team1: PlayerTeam;
    team2: PlayerTeam;
    startTime: string;
    isVsAi?: boolean;
    aiDifficulty?: AiDifficulty;
    gameMode?: GameMode;
  } | null>(() => StorageService.getActiveMatch());

  const [currentTab, setCurrentTab] = useState<string>(() =>
    StorageService.getActiveMatch() ? 'match' : 'draft'
  );

  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<string>('all');

  // Auto-redirect from match tab if no match is active
  useEffect(() => {
    if (currentTab === 'match' && !activeMatch) {
      setCurrentTab('draft');
    }
  }, [currentTab, activeMatch]);
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    StorageService.setLanguage(lang);
  };

  // Players management
  const handleAddPlayer = (name: string) => {
    const newPlayer = StorageService.addPlayer(name);
    setPlayers(StorageService.getPlayers());
  };

  const handleDeletePlayer = (id: string) => {
    StorageService.deletePlayer(id);
    setPlayers(StorageService.getPlayers());
  };

  // Match management
  const handleStartMatch = (
    team1: PlayerTeam,
    team2: PlayerTeam,
    isVsAi?: boolean,
    aiDifficulty?: AiDifficulty,
    gameMode?: GameMode
  ) => {
    const activeData = {
      team1,
      team2,
      startTime: new Date().toISOString(),
      isVsAi: !!isVsAi,
      aiDifficulty: aiDifficulty || 'normal',
      gameMode: gameMode || (isVsAi ? 'vs_ai' : team1.player2Id ? '2v2' : '1v1'),
    };
    setActiveMatch(activeData);
    StorageService.saveActiveMatch(activeData);
    setCurrentTab('match');
  };

  const handleSaveMatch = (completedMatch: Match) => {
    StorageService.addMatch(completedMatch);
    setMatches(StorageService.getMatches());
    setActiveMatch(null);
    setCurrentTab('stats');
  };

  const handleCancelMatch = () => {
    StorageService.clearActiveMatch();
    setActiveMatch(null);
    setCurrentTab('draft');
  };

  const handleDeleteMatchFromHistory = (matchId: string) => {
    StorageService.deleteMatch(matchId);
    setMatches(StorageService.getMatches());
  };

  const handleSelectPlayerForStats = (playerId: string) => {
    setSelectedPlayerForStats(playerId);
    setCurrentTab('stats');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        onLanguageChange={handleLanguageChange}
        hasActiveMatch={!!activeMatch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'match' && (
          <div>
            {activeMatch ? (
              <ActiveMatch
                team1={activeMatch.team1}
                team2={activeMatch.team2}
                isVsAi={activeMatch.isVsAi}
                aiDifficulty={activeMatch.aiDifficulty}
                gameMode={activeMatch.gameMode}
                onSaveMatch={handleSaveMatch}
                language={language}
                onCancelMatch={handleCancelMatch}
              />
            ) : (
              <DraftMatch
                players={players}
                onStartMatch={handleStartMatch}
                language={language}
                onQuickAddPlayer={handleAddPlayer}
              />
            )}
          </div>
        )}

        {currentTab === 'draft' && (
          <DraftMatch
            players={players}
            onStartMatch={handleStartMatch}
            language={language}
            onQuickAddPlayer={handleAddPlayer}
          />
        )}

        {currentTab === 'players' && (
          <PlayersManager
            players={players}
            matches={matches}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            language={language}
            onSelectPlayerForStats={handleSelectPlayerForStats}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            players={players}
            matches={matches}
            language={language}
            initialPlayerFilterId={selectedPlayerForStats}
          />
        )}

        {currentTab === 'history' && (
          <MatchHistoryView
            matches={matches}
            onDeleteMatch={handleDeleteMatchFromHistory}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4">
          Tag Team Board Game Companion & Analytics
        </div>
        <div className="max-w-7xl mx-auto px-4">
          by Marco Tondolo
        </div>
      </footer>
    </div>
  );
}
