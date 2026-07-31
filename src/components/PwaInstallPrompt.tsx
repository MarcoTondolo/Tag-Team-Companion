import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallProps {
  language: Language;
}

export const PwaInstallButton: React.FC<PwaInstallProps> = ({ language }) => {
  const t = getTranslation(language);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{t.pwa.installed}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title={t.pwa.installApp}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">{t.pwa.installApp}</span>
      </button>

      {/* Modal for manual install guidance or iOS instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{t.pwa.installTitle}</h3>
                <p className="text-xs text-slate-400">{t.pwa.installDesc}</p>
              </div>
            </div>

            {isIos ? (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 my-4 text-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Share className="w-4 h-4" />
                  <span>Su iPhone / iPad (Safari)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.pwa.iosInstructions}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 my-4 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white">Su Android o PC (Chrome / Edge / Opera):</p>
                <p>
                  1. Apri il menu del browser (3 puntini verticali in alto a destra).
                </p>
                <p>
                  2. Seleziona <strong>&quot;Installa applicazione&quot;</strong> o <strong>&quot;Aggiungi a Schermata Home&quot;</strong>.
                </p>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
