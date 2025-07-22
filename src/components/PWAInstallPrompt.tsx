"use client";

import React, { useEffect, useState } from "react";

// Composant bannière d'installation PWA
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Détecter si l'app est déjà installée
    const checkInstalled = () => {
      // iOS
      if ((window.navigator as any).standalone) return true;
      // Autres navigateurs
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      return false;
    };
    setIsInstalled(checkInstalled());

    // Écoute de l'événement beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Écoute de l'installation effective
    const installHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center">
      <div className="bg-accent text-white rounded-t-xl shadow-lg px-6 py-4 flex items-center gap-4 animate-slideInUp">
        <span className="font-semibold">Installer Trash Mboa sur votre appareil&nbsp;?</span>
        <button
          className="bg-white text-accent font-bold px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === 'accepted') {
                setShowPrompt(false);
              } else {
                setShowPrompt(false);
              }
              setDeferredPrompt(null);
            }
          }}
        >
          Installer
        </button>
        <button
          className="ml-2 text-white/80 hover:text-white text-sm underline"
          onClick={() => setShowPrompt(false)}
        >
          Plus tard
        </button>
      </div>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInUp { animation: slideInUp 0.4s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
} 