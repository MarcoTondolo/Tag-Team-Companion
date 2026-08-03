import React, { useState } from 'react';
import { Bot, ShieldAlert, BookOpen, ChevronDown, ChevronUp, CheckSquare, Square, Zap, HelpCircle } from 'lucide-react';
import { AiDifficulty, Language } from '../types';
import { getTranslation } from '../data/translations';
import { SoloRulesModal } from './SoloRulesModal';

interface BotAiAssistantCardProps {
  aiDifficulty?: AiDifficulty;
  language: Language;
}

export const BotAiAssistantCard: React.FC<BotAiAssistantCardProps> = ({
                                                                        aiDifficulty = 'normal',
                                                                        language,
                                                                      }) => {
  const t = getTranslation(language);

  const [isCardAddedThisRound, setIsCardAddedThisRound] = useState<boolean>(false);
  const [showPriorities, setShowPriorities] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'mismatches' | 'priorities'>('mismatches');

  const cardCountMap: Record<AiDifficulty, number> = {
    easy: 1,
    normal: 2,
    hard: 3,
  };

  const cardCount = cardCountMap[aiDifficulty] || 2;

  const diffLabelMap: Record<AiDifficulty, { label: string; color: string }> = {
    easy: { label: t.draft.easy, color: 'bg-emerald-500 text-slate-950 border-emerald-400' },
    normal: { label: t.draft.normal, color: 'bg-amber-500 text-slate-950 border-amber-400' },
    hard: { label: t.draft.hard, color: 'bg-rose-600 text-white border-rose-500' },
  };

  const currentDiff = diffLabelMap[aiDifficulty] || diffLabelMap.normal;

  return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-2xl border border-amber-500/30">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                {t.soloAssistant.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.soloAssistant.officialRulesSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
          <span
              className={`px-3 py-1 rounded-xl text-xs font-black border shadow-sm ${currentDiff.color}`}
          >
            {currentDiff.label}
          </span>
            <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title={t.soloAssistant.openFullRules}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Phase Quick Reminders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Building Phase Box */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {t.soloAssistant.buildingPhaseTitle}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {t.soloAssistant.buildingInstructions.replace('{count}', String(cardCount))}
            </p>
          </div>

          {/* Combat Phase Tracker Box */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xs font-black text-amber-400 flex items-center justify-between">
              <span>{t.soloAssistant.combatPhaseTitle}</span>
              <span className="text-[10px] text-slate-500 font-normal">{t.soloAssistant.addedCardMax1}</span>
            </div>
            <button
                type="button"
                onClick={() => setIsCardAddedThisRound(!isCardAddedThisRound)}
                className={`w-full p-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-between cursor-pointer ${
                    isCardAddedThisRound
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
            >
            <span className="flex items-center gap-2">
              {isCardAddedThisRound ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              {t.soloAssistant.addedCardTracker}
            </span>
              <span className="text-[10px] uppercase font-bold">
              {isCardAddedThisRound ? t.soloAssistant.addedStatus : t.soloAssistant.toAddStatus}
            </span>
            </button>
          </div>
        </div>

        {/* Assistant Helper Tabs (Mismatches vs Priority Hierarchy) */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={() => setActiveTab('mismatches')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'mismatches'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t.soloAssistant.tabMismatches}
              </button>
              <button
                  type="button"
                  onClick={() => setActiveTab('priorities')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'priorities'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t.soloAssistant.tabPriorities}
              </button>
            </div>
          </div>

          {/* Tab 1: Mismatch Resolution Helper */}
          {activeTab === 'mismatches' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-extrabold text-amber-300">
                    {t.soloAssistant.mismatch1}
                  </div>
                  <div className="text-slate-300 font-semibold text-[11px] pl-2">
                    {t.soloAssistant.sol1}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-extrabold text-rose-400">
                    {t.soloAssistant.mismatch2}
                  </div>
                  <div className="text-slate-300 font-semibold text-[11px] pl-2">
                    {t.soloAssistant.sol2}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-extrabold text-sky-400">
                    {t.soloAssistant.mismatch3}
                  </div>
                  <div className="text-slate-300 font-semibold text-[11px] pl-2">
                    {t.soloAssistant.sol3}
                  </div>
                </div>
              </div>
          )}

          {/* Tab 2: Priority List */}
          {activeTab === 'priorities' && (
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-amber-400 mb-1">
                  {t.soloAssistant.priorityDesc}
                </div>
                <div className="space-y-1.5 text-xs">
                  {t.soloAssistant.priorityList.map((pText, i) => (
                      <div
                          key={i}
                          className="p-2 bg-slate-900/90 border border-slate-800/80 rounded-xl text-slate-200 font-medium flex items-center gap-2"
                      >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                        <span>{pText.substring(3)}</span>
                      </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                  {t.soloAssistant.tieBreakers}
                </p>
              </div>
          )}
        </div>

        {/* Rules Modal Trigger */}
        <SoloRulesModal
            isOpen={showRulesModal}
            onClose={() => setShowRulesModal(false)}
            language={language}
        />
      </div>
  );
};
