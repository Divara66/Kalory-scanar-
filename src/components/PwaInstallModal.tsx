import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  QrCode,
  ArrowDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isKu = language === 'ku';

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [activeOS, setActiveOS] = useState<'ios' | 'android'>('ios');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    // Detect if user is on iOS or Android
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveOS('ios');
    } else {
      setActiveOS('android');
    }

    // Detect if app is already running in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Catch PWA beforeinstallprompt event (Chrome, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyAppUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentAppUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentAppUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white my-6 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>{isKu ? 'دابەزاندنی بەرنامە لەسەر مۆبایلەکەت' : 'Install App on Mobile Phone'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {isKu ? 'خۆڕایی' : 'Free App'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isKu
                  ? 'وەک بەرنامەیەکی ڕاستەقینە زیاد بکە بۆ سەر پەڕەی سەرەکی مۆبایلەکەت'
                  : 'Add directly to your iPhone or Android home screen'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Direct Install Button if supported */}
          {deferredPrompt && !isInstalled && (
            <div className="bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-amber-500/20 border border-orange-500/40 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{isKu ? 'مۆبایلەکەت ئامادەیە بۆ دابەزاندنی ڕاستەوخۆ!' : 'One-Tap Install Available!'}</span>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isKu ? 'کلیک بکه بۆ دابەزاندنی دەستبەجێ' : 'Tap Here to Install App Now'}</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-300">
                {isKu ? 'بەرنامەکە لەسەر مۆبایلەکەت دابەزیوە!' : 'App is Already Installed!'}
              </h4>
              <p className="text-xs text-slate-300">
                {isKu
                  ? 'دەتوانیت ڕاستەوخۆ لە ڕێگەی ئایکۆنی بەرنامەکە لەسەر شاشەی مۆبایلەکەت بیکەیتەوە.'
                  : 'You can now open MacroScan directly from your phone home screen.'}
              </p>
            </div>
          )}

          {/* OS Switcher Tabs */}
          <div className="space-y-3">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveOS('ios')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeOS === 'ios'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🍎 iPhone (iOS / Safari)</span>
              </button>
              <button
                onClick={() => setActiveOS('android')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeOS === 'android'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🟢 Android (Chrome)</span>
              </button>
            </div>

            {/* iOS Instructions */}
            {activeOS === 'ios' && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-rose-400" />
                  <span>{isKu ? 'ڕێنمایی بەکارهێنەرانی ئایفۆن (iPhone):' : 'iPhone Safari Step-by-Step Instructions:'}</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {isKu
                          ? 'بەرنامەکە لە وێبگەڕی Safari بکارەوە'
                          : 'Open this link in Safari browser'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {isKu
                          ? 'دڵنیابەوە کە لە وێبگەڕی سۆشیال میدیا (Instagram/TikTok) نیت، Safari بیکەرەوە.'
                          : 'Ensure you are using Apple Safari browser.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span>{isKu ? 'کرتە لە دوگمەی 📤 (Share) بکە لە خوارەوە' : 'Tap the Share icon 📤 at the bottom'}</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {isKu
                          ? 'دوگمەی ناردن/پەخشکردن لە ناوەڕاستی خوارەوەی شاشەی ئایفۆنەکەتدا هەیە.'
                          : 'Located at the bottom center of Safari.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span>{isKu ? 'هەڵبژاردنی "Add to Home Screen" ➕' : 'Select "Add to Home Screen" ➕'}</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {isKu
                          ? 'بچۆ خوارەوە و هەڵبژاردنی (زیادکردن بۆ پەڕەی سەرەکی) هەڵبژێرە و پاشان (Add).'
                          : 'Scroll down, tap "Add to Home Screen", then tap "Add".'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {activeOS === 'android' && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{isKu ? 'ڕێنمایی بەکارهێنەرانی ئەندرۆید (Android):' : 'Android Chrome Instructions:'}</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {isKu ? 'کلیک لەسەر سێ خاڵەکەی سەرەوە (⋮) بکە' : 'Tap the top 3 dots (⋮) in Chrome'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {isKu
                          ? 'لە لای ڕاست یان چەپی سەرەوەی Chrome دەستت بنێ بە سێ خاڵەکەدا.'
                          : 'Located at the top corner of your Chrome browser.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {isKu
                          ? 'هەڵبژاردنی "Install app" یان "Add to Home Screen"'
                          : 'Tap "Install App" or "Add to Home Screen"'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {isKu
                          ? 'لە لیستی هەڵبژاردنەکان، دابەزاندنی بەرنامە هەڵبژێرە.'
                          : 'Confirm installation prompt to create mobile app icon.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop QR Code Scan & Share Link */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>{isKu ? 'یان سکانی ئەم کۆدە (QR Code) بکە بە کامێرای مۆبایلەکەت:' : 'Or Scan QR Code with Phone Camera:'}</span>
            </div>

            <div className="p-3 bg-white rounded-xl inline-block shadow-md">
              <img
                src={qrCodeUrl}
                alt="Scan to open on mobile"
                className="w-36 h-36 mx-auto object-contain"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentAppUrl}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyAppUrl}
                className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isKu ? 'کۆپی کراوە' : 'Copied!') : isKu ? 'کۆپیکردن' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center shrink-0">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isKu ? 'بەرنامەکە ١٠٠٪ پارێزراوە و خێرایە لەسەر مۆبایلەکەت' : '100% Secure, Fast Mobile Progressive Web App'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
