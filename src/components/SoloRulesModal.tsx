import React from 'react';
import { X, Flame, ShieldAlert, BookOpen, Heart, Zap, Award, Sparkles, Crosshair, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface SoloRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SoloRulesModal: React.FC<SoloRulesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isIt = language === 'it';

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">

          {/* Modal Header */}
          <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  {isIt ? 'Regolamento: Il Circuito Clandestino' : 'Rules: The Underground Circuit'}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">
                  {isIt ? 'Modalità Solitario con Barra HP dell\'Ondata & Threat Deck' : 'Solo Wave HP Bar & Threat Deck Mode'}
                </p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed custom-scrollbar">

            {/* L'Idea & Concetto Base */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isIt ? '1. Concept & Regole Base' : '1. Concept & Basic Rules'}
              </h4>
              <p className="text-xs sm:text-sm">
                {isIt
                    ? 'Il tuo Tag Team si fa strada attraverso un circuito di incontri clandestini sempre più duri, senza mai tornare negli spogliatoi per un recupero completo. Non piloti un vero avversario: affronti un Threat Deck (Mazzo di Minaccia) generico che si pesca ad ogni turno e una Barra HP dell\'Ondata astratta.'
                    : 'Your Tag Team fights through a circuit of increasingly brutal underground matches without returning for full recovery. You face a Threat Deck auto-drawn each round and an abstract Wave HP Bar.'}
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium">
                ⚡ <strong>{isIt ? 'Il Twist Principale:' : 'Main Twist:'}</strong>{' '}
                {isIt
                    ? 'HP e potere non si resettano mai del tutto tra un\'ondata e l\'altra. Gestire la resistenza a lungo termine conta quanto le singole mosse.'
                    : 'HP and Power never fully reset between waves! Long-term endurance management matters as much as individual moves.'}
              </div>
            </section>

            {/* Barra HP Ondata */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Crosshair className="w-5 h-5" />
                {isIt ? '2. La Barra HP dell\'Ondata (Come Attaccare)' : '2. Wave HP Bar (How to Attack)'}
              </h4>
              <p className="text-xs sm:text-sm">
                {isIt
                    ? 'Ogni Ondata ha una propria riserva di HP. Quando nel Fight Step giochi una carta d\'attacco, il danno non va a un lottatore specifico dell\'avversario, ma si sottrae direttamente dagli HP dell\'Ondata. Tutto il resto funziona come da regolamento normale (blocchi, potere speso per effetti, ecc.).'
                    : 'Each Wave has its own HP pool. In the Fight Step, your attack damage directly subtracts from the Wave\'s HP. Blocks and power effects function as usual.'}
              </p>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold">
                🎯 {isIt ? 'Superare un\'Ondata = portare i suoi HP a 0 prima che uno dei tuoi due lottatori vada KO!' : 'Clear a Wave = reduce its HP to 0 before any of your 2 fighters go KO!'}
              </div>
            </section>

            {/* Setup & Difficoltà */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {isIt ? '3. Setup & Difficoltà Iniziale' : '3. Setup & Initial Difficulty'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  🟢 {isIt ? 'Apprendista' : 'Apprentice'}
                </span>
                  <p className="text-[11px] text-emerald-200">
                    {isIt ? 'Threat Deck iniziale: Carte 2–6' : 'Initial Threat Deck: Cards 2–6'}
                  </p>
                  <p className="text-[11px] font-bold text-white">
                    {isIt ? 'HP Ondata 1: 10 HP' : 'Wave 1 HP: 10 HP'}
                  </p>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  🟡 {isIt ? 'Veterano' : 'Veteran'}
                </span>
                  <p className="text-[11px] text-amber-200">
                    {isIt ? 'Threat Deck iniziale: Carte 2–10' : 'Initial Threat Deck: Cards 2–10'}
                  </p>
                  <p className="text-[11px] font-bold text-white">
                    {isIt ? 'HP Ondata 1: 14 HP' : 'Wave 1 HP: 14 HP'}
                  </p>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider block">
                  🔴 {isIt ? 'Leggenda' : 'Legend'}
                </span>
                  <p className="text-[11px] text-rose-200">
                    {isIt ? 'Threat Deck iniziale: Mazzo intero con figure e assi' : 'Initial Threat Deck: Full deck with face cards & aces'}
                  </p>
                  <p className="text-[11px] font-bold text-white">
                    {isIt ? 'HP Ondata 1: 18 HP' : 'Wave 1 HP: 18 HP'}
                  </p>
                </div>
              </div>
            </section>

            {/* Effetti Carte Threat Deck */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                {isIt ? '4. Effetti Carte del Threat Deck' : '4. Threat Deck Card Effects'}
              </h4>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <div className="divide-y divide-slate-800">
                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-amber-300 shrink-0 sm:w-32">
                    🃏 2 – 10
                  </span>
                    <span className="text-slate-300">
                    {isIt
                        ? 'Attacco diretto pari al valore della carta (2-10 HP): seleziona quale eroe del tuo team subirà i danni. (Nota: Wild Bunch subisce e si cura massimo 1 HP alla volta).'
                        : 'Direct attack equal to card rank value (2-10 HP): select which hero on your team takes damage. (Note: Wild Bunch takes and heals max 1 HP at a time).'}
                  </span>
                  </div>

                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-sky-400 shrink-0 sm:w-32">
                    👑 J / Q / K (Figure)
                  </span>
                    <span className="text-slate-300">
                    {isIt
                        ? '🛡️ Il Threat si difende meglio: la prossima carta d\'attacco che giochi contro l\'Ondata infligge 1 danno in meno (minimo 0).'
                        : '🛡️ Threat defends better: your next attack card played against the Wave deals 1 less damage (minimum 0).'}
                  </span>
                  </div>

                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-rose-400 shrink-0 sm:w-32">
                    🅰️ Asso (Ace)
                  </span>
                    <span className="text-slate-300">
                    {isIt
                        ? '💥 Colpo Speciale: La prossima carta pescata dal Threat Deck infligge danno doppio. Puoi spendere 1 Momentum per annullare subito il raddoppio!'
                        : '💥 Special Move: Double damage on next threat card drawn. You can spend 1 Momentum to cancel this double damage immediately!'}
                  </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabella Ondate & Recupero Infinite */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {isIt ? '5. Ondate Infinite & Scalata (+4 HP a Ondata)' : '5. Infinite Waves & Escalation (+4 HP per Wave)'}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-amber-400 font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">{isIt ? 'Ondata' : 'Wave'}</th>
                    <th className="p-2.5">{isIt ? 'HP dell\'Ondata' : 'Wave HP'}</th>
                    <th className="p-2.5">{isIt ? 'Recupero a Fine Ondata' : 'Post-Wave Recovery'}</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-2.5 font-bold text-white">Ondata 1</td>
                    <td className="p-2.5 text-slate-300">10 / 14 / 18 HP (per difficoltà)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">+3 HP a testa, +1 Potere a testa</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Ondata 2</td>
                    <td className="p-2.5 text-slate-300">+4 HP (14 / 18 / 22 HP)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">+3 HP a testa, +1 Potere a testa</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Ondata 3</td>
                    <td className="p-2.5 text-slate-300">+4 HP (18 / 22 / 26 HP)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">+2 HP a testa, +1 Potere a testa</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Ondata 4+</td>
                    <td className="p-2.5 text-slate-300">+4 HP per ogni nuova ondata</td>
                    <td className="p-2.5 text-amber-400 font-bold">+2 HP a testa, +0 Potere</td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 italic">
                ⚡ <strong>{isIt ? 'Mazzo Completo:' : 'Complete Deck:'}</strong>{' '}
                {isIt
                    ? 'Le carte del Threat Deck si espandono fino all\'ondata 5, dopodiché il mazzo rimane completo per tutte le ondate successive.'
                    : 'The Threat Deck expands up to wave 5, after which the deck remains complete for all subsequent infinite waves.'}
              </p>
            </section>

            {/* Momentum */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {isIt ? '6. Momentum (Riserva Strategica)' : '6. Momentum (Strategic Reserve)'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-400 block">{isIt ? 'Guadagni 1 Momentum quando:' : 'Gain 1 Momentum when:'}</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>{isIt ? 'Porti a 0 gli HP di un\'Ondata (superi l\'ondata)' : 'You reduce Wave HP to 0 (clear wave)'}</li>
                    <li>{isIt ? 'Il Threat Deck si esaurisce e va rimescolato' : 'Threat Deck runs out and is reshuffled'}</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-400 block">{isIt ? 'Spendi 1 Momentum per:' : 'Spend 1 Momentum to:'}</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li><strong>1 Momentum ➔</strong> {isIt ? 'Curare 2 HP a un lottatore a scelta' : 'Heal 2 HP to any fighter'}</li>
                    <li><strong>1 Momentum ➔</strong> {isIt ? 'Pescare 1 carta extra in fase Build (1 tra 4 anziché 3)' : 'Draw 1 extra card in Build phase'}</li>
                    <li><strong>1 Momentum ➔</strong> {isIt ? 'Annullare il raddoppio di danno di un Asso appena pescato' : 'Cancel an Ace\'s double damage multiplier'}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Esito Run */}
            <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                {isIt ? '7. Esito della Run' : '7. Run Outcome'}
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>
                  🏁 <strong>{isIt ? 'Termina Partita:' : 'End Match:'}</strong> {isIt ? 'Puoi premere "Termina Partita" in qualsiasi momento per registrare l\'ondata massima raggiunta dal tuo team.' : 'You can click "End Match" at any point to register the maximum wave reached by your team.'}
                </p>
                <p>
                  💀 <strong>{isIt ? 'Sconfitta (KO):' : 'Defeat (KO):'}</strong> {isIt ? 'Se uno o entrambi i tuoi lottatori vanno KO, la corsa si interrompe e viene registrata l\'ondata raggiunta.' : 'If one or both fighters go KO, the run stops and your reached wave is recorded.'}
                </p>
              </div>
            </section>

          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
            <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {isIt ? 'Capito! Chiudi' : 'Got it! Close'}
            </button>
          </div>

        </div>
      </div>
  );
};
