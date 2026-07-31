import React, { useState } from 'react';
import { UserPlus, Trash2, Trophy, BarChart, User } from 'lucide-react';
import { Player, Match, Language } from '../types';
import { getTranslation } from '../data/translations';
import { calculateAllStats } from '../utils/stats';

interface PlayersManagerProps {
  players: Player[];
  matches: Match[];
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (id: string) => void;
  language: Language;
  onSelectPlayerForStats?: (playerId: string) => void;
}

export const PlayersManager: React.FC<PlayersManagerProps> = ({
  players,
  matches,
  onAddPlayer,
  onDeletePlayer,
  language,
  onSelectPlayerForStats,
}) => {
  const t = getTranslation(language);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const { playerStats } = calculateAllStats(players, matches);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" />
            {t.playersView.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'it'
              ? 'Registra i giocatori per iniziare le sfide e tracciare le statistiche personali.'
              : 'Register players to launch matches and track individual stats.'}
          </p>
        </div>

        {/* Add Player Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder={t.playersView.playerNamePlaceholder}
            className="px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {t.playersView.addPlayer}
          </button>
        </form>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p) => {
          const stat = playerStats.find((s) => s.playerId === p.id);
          const matchesCount = stat?.matchesPlayed || 0;
          const wins = stat?.wins || 0;
          const losses = stat?.losses || 0;
          const draws = stat?.draws || 0;
          const wr = stat?.winRate || 0;

          return (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {t.common.matchesPlayed}: {matchesCount}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPlayerToDelete(p)}
                    title={t.common.delete}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center mb-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      {t.common.wins}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">{wins}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      {t.common.losses}
                    </span>
                    <span className="text-sm font-bold text-red-400">{losses}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      {t.common.draws}
                    </span>
                    <span className="text-sm font-bold text-slate-400">{draws}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      {t.common.winrate}
                    </span>
                    <span className="text-sm font-bold text-amber-400">{wr}%</span>
                  </div>
                </div>
              </div>

              {/* View personal stats link */}
              {onSelectPlayerForStats && (
                <button
                  onClick={() => onSelectPlayerForStats(p.id)}
                  className="w-full mt-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
                >
                  <BarChart className="w-3.5 h-3.5 text-amber-400" />
                  {t.playersView.viewPersonalStats}
                </button>
              )}
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{t.common.noData}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {language === 'it' ? 'Elimina Giocatore' : 'Delete Player'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'it'
                  ? `Sei sicuro di voler eliminare "${playerToDelete.name}"?`
                  : `Are you sure you want to delete "${playerToDelete.name}"?`}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  onDeletePlayer(playerToDelete.id);
                  setPlayerToDelete(null);
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
