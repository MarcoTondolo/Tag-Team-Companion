import React from 'react';
import { X, Bot, BookOpen, ShieldAlert, Zap, Award, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
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
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                {isIt ? 'Regolamento Solitario Tag Team (vs AI)' : 'Tag Team Solo Rules (vs AI)'}
              </h3>
              <p className="text-xs text-amber-400 font-semibold">
                {isIt ? 'di Michael Kelley (One Stop Co-Op Shop)' : 'by Michael Kelley (One Stop Co-Op Shop)'}
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
          
          {/* Section 1: Preparazione e Draft */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {isIt ? '1. Preparazione & Draft' : '1. Setup & Draft'}
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <strong>{isIt ? 'Pesca 6 Lottatori:' : 'Draw 6 Fighters:'}</strong> {isIt ? 'Pesca 6 dei 12 lottatori disponibili nel roster.' : 'Draw 6 of the 12 available fighters.'}
              </li>
              <li>
                <strong>{isIt ? 'Crea 2 Coppie:' : 'Form 2 Pairs:'}</strong> {isIt ? 'Crea 2 coppie equilibrate e sinergiche con i 6 lottatori pescati.' : 'Form 2 balanced, synergistic pairs using the 6 drawn fighters.'}
              </li>
              <li>
                <strong>{isIt ? 'Assegnazione Casuale:' : 'Random Assignment:'}</strong> {isIt ? 'Mescola 1 carta da ciascuna coppia e pescane 1 a caso: quella sarà la TUA coppia, mentre il Bot controllerà l\'altra.' : 'Shuffle 1 card from each pair and pick 1 at random: that becomes YOUR pair, while the Bot controls the other.'}
              </li>
              <li>
                <strong>{isIt ? 'Preparazione Mazzo:' : 'Deck Setup:'}</strong> {isIt ? 'Prepara il gioco normalmente e mescola le 2 carte iniziali del Bot.' : 'Set up the game as usual and shuffle the Bot\'s 2 starting cards.'}
              </li>
            </ul>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
              💡 <em>{isIt ? 'Nota:' : 'Note:'}</em> {isIt ? 'Puoi escludere i lottatori meno adatti al Bot prima di pescare i 6 lottatori.' : 'You can exclude fighters less suited for Bot play before drawing your 6 fighters.'}
            </div>
          </section>

          {/* Section 2: Fase di Costruzione & Difficoltà */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {isIt ? '2. Fase di Costruzione & Livelli di Difficoltà' : '2. Building Phase & Difficulty Levels'}
            </h4>
            <p className="text-xs sm:text-sm">
              {isIt
                ? 'Il Bot NON aggiunge carte al mazzo di combattimento durante la fase di costruzione. Aggiungerà invece una carta durante la fase di combattimento se si verifica un Disaccordo.'
                : 'The Bot does NOT add cards to its combat deck during the building phase. Instead, it adds a card during the combat phase when resolving a Mismatch.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  🟢 {isIt ? 'Facile' : 'Easy'}
                </span>
                <p className="text-[11px] text-emerald-200 mt-1">
                  {isIt
                    ? 'Pesca 1 carta coperta dal mazzo di costruzione. Se arriva a fine mazzo senza averla usata, ne gira una seconda per avere 2 opzioni.'
                    : 'Draw 1 face-down card. If reaching end of deck without adding, reveal a 2nd card for 2 choices.'}
                </p>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  🟡 {isIt ? 'Normale' : 'Normal'}
                </span>
                <p className="text-[11px] text-amber-200 mt-1">
                  {isIt
                    ? 'Pesca 2 carte coperte dal mazzo di costruzione e posizionale vicino al mazzo di combattimento.'
                    : 'Draw 2 face-down cards from construction deck and place them near the combat deck.'}
                </p>
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider block">
                  🔴 {isIt ? 'Difficile' : 'Hard'}
                </span>
                <p className="text-[11px] text-rose-200 mt-1">
                  {isIt
                    ? 'Pesca 3 carte coperte dal mazzo di costruzione, dando al Bot maggiore versatilità nei disaccordi.'
                    : 'Draw 3 face-down cards from construction deck, granting maximum resolution choices.'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Fase di Combattimento e Disaccordi */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              {isIt ? '3. Fase di Combattimento & Disaccordi (Mismatch)' : '3. Combat Phase & Mismatches'}
            </h4>
            
            <p className="text-xs sm:text-sm">
              {isIt
                ? 'Gira le carte dei mazzi di combattimento normalmente. Se la carta del Bot è in "Disaccordo" con quella del giocatore, il Bot tenta di risolverlo usando le carte del mazzo di costruzione preparate.'
                : 'Flip cards from combat decks normally. If the Bot card is in a "Mismatch" with yours, the Bot attempts to resolve it using its prepared construction cards.'}
            </p>

            {/* Mismatch Solutions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-950 p-2.5 font-bold text-amber-400 border-b border-slate-800">
                {isIt ? 'Tipi di Disaccordo e Carte Soluzione' : 'Mismatch Types & Solutions'}
              </div>
              <div className="divide-y divide-slate-800">
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className="font-bold text-rose-300">
                    {isIt ? '1. Bot subisce 3+ danni in più del giocatore' : '1. Bot takes 3+ more damage than player'}
                  </span>
                  <span className="text-slate-300">
                    ➔ <strong>{isIt ? 'Soluzione:' : 'Solution:'}</strong> {isIt ? 'Una carta Blocco (Non usa cure o attacchi per risolverlo).' : 'A Block card (Won\'t use heal or attack).'}
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className="font-bold text-red-400">
                    {isIt ? '2. Bot viene sconfitto (K.O.) dall\'attacco' : '2. Bot is knocked out (K.O.) by attack'}
                  </span>
                  <span className="text-slate-300">
                    ➔ <strong>{isIt ? 'Soluzione:' : 'Solution:'}</strong> {isIt ? 'Qualsiasi carta che lo salvi (cambio personaggio, blocco, cura, ecc.).' : 'Anything that saves it (character swap, block, heal, etc.).'}
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className="font-bold text-amber-300">
                    {isIt ? '3. Carta del Bot viene "sprecata"' : '3. Bot\'s card is "wasted"'}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {isIt ? '(es. blocco senza attacco, attacco bloccato, annullo inutile)' : '(e.g. block vs no attack, attack blocked, useless cancel)'}
                    </span>
                  </span>
                  <span className="text-slate-300">
                    ➔ <strong>{isIt ? 'Soluzione:' : 'Solution:'}</strong> {isIt ? 'Qualsiasi carta con effetto positivo (danni, cura, potenziamento).' : 'Any card with positive effect (damage, heal, buff).'}
                  </span>
                </div>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pt-2">
              <li>
                {isIt
                  ? 'Se la carta preparata risolve il disaccordo, la carta originale torna in cima al mazzo del Bot e viene giocata la carta risolutiva.'
                  : 'If a prepared card resolves the mismatch, the original card goes back on top of the Bot deck and the resolving card is played.'}
              </li>
              <li>
                {isIt
                  ? 'Le carte di costruzione non usate vanno in fondo al mazzo di costruzione del Bot.'
                  : 'Unused construction cards go to the bottom of the Bot\'s construction deck.'}
              </li>
              <li>
                {isIt
                  ? 'Se nessuna carta risolve il disaccordo, restano scoperte e si risolve la carta originaria. Il Bot le conserva per il prossimo disaccordo.'
                  : 'If no card resolves it, keep them face up and resolve original card. Bot keeps them for next mismatch.'}
              </li>
              <li className="text-amber-400 font-semibold">
                ⚠️ {isIt ? 'Il Bot può aggiungere al massimo 1 CARTA per fase di combattimento!' : 'Bot can only add MAX 1 CARD per combat phase!'}
              </li>
            </ul>
          </section>

          {/* Section 4: Priorità per la Carta Aggiunta */}
          <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {isIt ? '4. Priorità per la Scelta della Carta del Bot' : '4. Priority Order for Bot Card Choice'}
            </h4>
            <p className="text-xs text-slate-400">
              {isIt
                ? 'Quando entrambe le carte del Bot potrebbero risolvere il disaccordo (o alla fine del mazzo), usa questa scala di priorità (dalla più alta alla più bassa):'
                : 'When multiple cards resolve a mismatch (or at deck end), use this priority order (highest to lowest):'}
            </p>

            <ol className="space-y-2 text-xs">
              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">1</span>
                <div>
                  <strong>{isIt ? 'Contrattacco Diretto:' : 'Direct Counter:'}</strong> {isIt ? 'Un blocco all\'attacco del giocatore, o un annullamento per una carta avversaria con effetto forte.' : 'A block against player attack, or cancel for a strong player card.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">2</span>
                <div>
                  <strong>{isIt ? 'Attacco Pesante (3+ Danni):' : 'Heavy Attack (3+ Damage):'}</strong> {isIt ? 'Un attacco che infligge 3 o più danni, dando priorità all\'opzione più forte.' : 'An attack dealing 3+ damage, prioritizing strongest attack.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">3</span>
                <div>
                  <strong>{isIt ? 'Cura Efficiente (2+ HP / Potere):' : 'Efficient Heal (2+ HP / Power):'}</strong> {isIt ? 'Cura 2+ danni e/o fornisce un potenziamento (recupero potere), dando priorità al guadagno maggiore.' : 'Heals 2+ HP and/or gives power boost, prioritizing larger gain.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">4</span>
                <div>
                  <strong>{isIt ? 'Potenziamento / Avanzamento:' : 'Direct Buff / Advancement:'}</strong> {isIt ? 'Aumento di rabbia, guadagno di potere, ecc.' : 'Rage increase, power boost, etc.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">5</span>
                <div>
                  <strong>{isIt ? 'Effetto Minore:' : 'Minor Effect:'}</strong> {isIt ? 'Attacco con meno di 3 danni, o cura quando il lottatore non è ferito.' : 'Attack dealing < 3 damage, or healing when not hurt.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">6</span>
                <div>
                  <strong>{isIt ? 'Blocco Passivo:' : 'Passive Block:'}</strong> {isIt ? 'Un blocco quando il giocatore non sta attaccando.' : 'A block card when player is not attacking.'}
                </div>
              </li>

              <li className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs">7</span>
                <div>
                  <strong>{isIt ? 'Carta Contrastata:' : 'Countered Card:'}</strong> {isIt ? 'Una carta che il giocatore contrasterà immediatamente.' : 'A card that player will immediately counter.'}
                </div>
              </li>
            </ol>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-400 block">{isIt ? 'Criteri di Parità (Tie-Breakers):' : 'Tie-Breakers:'}</span>
              <p>
                1. {isIt ? 'Scegli la carta del lottatore del Bot con **più vita (HP) rimanente**.' : 'Pick card belonging to Bot fighter with **highest remaining HP**.'}
              </p>
              <p>
                2. {isIt ? 'Se c\'è ancora parità, scegli **casualmente**.' : 'If still tied, choose **randomly**.'}
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
