import React, { useState } from 'react';
import { History, Trash2, Calendar, Trophy, Flag, Shield } from 'lucide-react';
import { Match, Language } from '../types';
import { getTranslation } from '../data/translations';
import { getHeroById } from '../data/heroes';
import { FighterAvatar } from './FighterAvatar';

interface MatchHistoryViewProps {
  matches: Match[];
  onDeleteMatch: (id: string) => void;
  language: Language;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
                                                                    matches,
                                                                    onDeleteMatch,
                                                                    language,
                                                                  }) => {
  const t = getTranslation(language);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-amber-400" />
              {t.historyView.title}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {language === 'it'
                  ? 'Tutti i match completati registrati nella memoria dell\'app.'
                  : 'All recorded matches stored in local app memory.'}
            </p>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map((match) => {
            const isDraw = match.isDraw || match.winnerPlayerId === null;
            const winnerTeam =
                match.winnerPlayerId === match.team1.playerId
                    ? match.team1
                    : match.winnerPlayerId === match.team2.playerId
                        ? match.team2
                        : null;

            const formattedDate = new Date(match.date).toLocaleDateString(
                language === 'it' ? 'it-IT' : 'en-US',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
            );

            return (
                <div
                    key={match.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Header: Date, Game Mode, Winner, Delete button */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{formattedDate}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-extrabold rounded-md uppercase">
                    {match.gameMode === '2v2' ? '2v2' : match.isVsAi || match.gameMode === 'vs_ai' ? 'VS AI' : '1v1'}
                  </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {match.isVsAi || match.gameMode === 'vs_ai' ? (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                            {language === 'it' ? `Ondata Raggiunta: ${match.maxWave || 1}` : `Wave Reached: ${match.maxWave || 1}`}
                    </span>
                      ) : isDraw ? (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                            {t.common.draws}
                    </span>
                      ) : (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      Winner: {winnerTeam?.playerName}
                    </span>
                      )}

                      <button
                          onClick={() => setMatchToDelete(match.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Match teams & hero pairs display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team 1 */}
                    <div
                        className={`p-3 rounded-xl border ${
                            match.winnerPlayerId === match.team1.playerId
                                ? 'bg-blue-950/30 border-blue-500/40'
                                : 'bg-slate-950/60 border-slate-800'
                        }`}
                    >
                  <span className="text-xs font-bold text-blue-400 block mb-2">
                    {match.team1.playerName}
                  </span>
                      <div className="flex items-center gap-3">
                        {match.team1.heroes.map((h, i) => {
                          const hObj = getHeroById(h.heroId);
                          return (
                              <div key={i} className="flex items-center gap-2">
                                <FighterAvatar heroId={h.heroId} size="sm" isKo={h.isKo} />
                                <span className="text-xs font-semibold text-slate-200">
                            {hObj?.name}
                          </span>
                              </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div
                        className={`p-3 rounded-xl border ${
                            match.winnerPlayerId === match.team2.playerId
                                ? 'bg-rose-950/30 border-rose-500/40'
                                : 'bg-slate-950/60 border-slate-800'
                        }`}
                    >
                  <span className="text-xs font-bold text-rose-400 block mb-2">
                    {match.team2.playerName}
                  </span>
                      <div className="flex items-center gap-3">
                        {match.team2.heroes.map((h, i) => {
                          const hObj = getHeroById(h.heroId);
                          return (
                              <div key={i} className="flex items-center gap-2">
                                <FighterAvatar heroId={h.heroId} size="sm" isKo={h.isKo} />
                                <span className="text-xs font-semibold text-slate-200">
                            {hObj?.name}
                          </span>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
            );
          })}

          {matches.length === 0 && (
              <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                {t.historyView.noMatches}
              </div>
          )}
        </div>

        {/* Delete Match Confirmation Modal */}
        {matchToDelete && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {language === 'it' ? 'Elimina Match' : 'Delete Match'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.historyView.deleteMatchConfirm}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                      onClick={() => setMatchToDelete(null)}
                      className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                      onClick={() => {
                        onDeleteMatch(matchToDelete);
                        setMatchToDelete(null);
                      }}
                      className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    {t.common.delete}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};
