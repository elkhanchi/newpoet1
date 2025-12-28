import React, { useState, useEffect } from 'react';
import { DownloadCloud } from 'lucide-react';

// This is a simplified type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export const InstallPWAButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    setInstallPrompt(null); // The prompt can only be used once.
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-deep-green text-gold shadow-lg hover:bg-emerald-900 transition-all duration-300 border border-gold/30 flex items-center gap-2 animate-fade-in-up"
      title="تثبيت التطبيق على جهازك"
    >
      <DownloadCloud className="w-5 h-5" />
      <span className="font-tajawal text-sm hidden sm:inline">تثبيت التطبيق</span>
    </button>
  );
};