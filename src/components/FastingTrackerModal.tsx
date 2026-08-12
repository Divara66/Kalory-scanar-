import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Timer, Play, Square, Flame, Zap, ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface FastingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export type FastingPlan = '16_8' | '14_10' | '18_6' | '20_4' | '24_0';

interface FastingPlanDetail {
  id: FastingPlan;
  fastHours: number;
  eatHours: number;
  nameKu: string;
  nameEn: string;
  descKu: string;
  descEn: string;
}

const FASTING_PLANS: FastingPlanDetail[] = [
  {
    id: '16_8',
    fastHours: 16,
    eatHours: 8,
    nameKu: '١٦ : ٨ (باوترین)',
    nameEn: '16 : 8 (Popular)',
    descKu: '١٦ کاتژمێر ڕۆژووگرتن و ٨ کاتژمێر نانخواردن. گونجاوە بۆ دابەزاندنی کێش.',
    descEn: '16 hours fasting and 8 hours eating window. Ideal for weight loss.',
  },
  {
    id: '14_10',
    fastHours: 14,
    eatHours: 10,
    nameKu: '١٤ : ١٠ (سەرەتایی)',
    nameEn: '14 : 10 (Beginner)',
    descKu: '١٤ کاتژمێر ڕۆژوو و ١٠ کاتژمێر خواردن. زۆر ئاسانە بۆ دەستپێک.',
    descEn: '14 hours fasting and 10 hours eating window. Very easy for beginners.',
  },
  {
    id: '18_6',
    fastHours: 18,
    eatHours: 6,
    nameKu: '١٨ : ٦ (پێشکەوتوو)',
    nameEn: '18 : 6 (Advanced)',
    descKu: '١٨ کاتژمێر ڕۆژوو و ٦ کاتژمێر خواردن. سووتاندنی زۆرتری چەوری.',
    descEn: '18 hours fasting and 6 hours eating. Accelerated fat burning.',
  },
  {
    id: '20_4',
    fastHours: 20,
    eatHours: 4,
    nameKu: '٢٠ : ٤ (جەنگاوەر Warrior)',
    nameEn: '20 : 4 (Warrior)',
    descKu: '٢٠ کاتژمێر ڕۆژوو و ٤ کاتژمێر نانخواردن. بۆ پاککردنەوەی جەستە.',
    descEn: '20 hours fasting and 4 hours eating window. Deep detox & focus.',
  },
];

export const FastingTrackerModal: React.FC<FastingTrackerModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isKu = language === 'ku';

  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>('16_8');
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Load state from local storage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('juula_fasting_state_v1');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setIsFasting(parsed.isFasting || false);
        setStartTime(parsed.startTime || null);
        setSelectedPlan(parsed.selectedPlan || '16_8');
      }
    } catch {
      // fallback
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(
      'juula_fasting_state_v1',
      JSON.stringify({ isFasting, startTime, selectedPlan })
    );
  }, [isFasting, startTime, selectedPlan]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isFasting && startTime) {
      const updateTimer = () => {
        const now = Date.now();
        const diffInSec = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(diffInSec > 0 ? diffInSec : 0);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFasting, startTime]);

  if (!isOpen) return null;

  const currentPlan = FASTING_PLANS.find((p) => p.id === selectedPlan) || FASTING_PLANS[0];
  const targetSeconds = currentPlan.fastHours * 3600;

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((elapsedSeconds / targetSeconds) * 100))
  );

  const hoursElapsed = Math.floor(elapsedSeconds / 3600);
  const minutesElapsed = Math.floor((elapsedSeconds % 3600) / 60);
  const secondsElapsed = elapsedSeconds % 60;

  const remainingSec = Math.max(0, targetSeconds - elapsedSeconds);
  const remHours = Math.floor(remainingSec / 3600);
  const remMin = Math.floor((remainingSec % 3600) / 60);

  // Biological stages of fasting
  let currentStageKu = 'دەستپێکی سووتاندنی شەکر (Glucose Burn)';
  let currentStageEn = 'Glucose & Blood Sugar Stabilization';
  if (hoursElapsed >= 12 && hoursElapsed < 16) {
    currentStageKu = 'چوونە قۆناغی سووتاندنی چەوری (Ketosis Trigger)';
    currentStageEn = 'Entering Fat-Burning Ketosis Stage';
  } else if (hoursElapsed >= 16 && hoursElapsed < 18) {
    currentStageKu = 'سووتاندنی بەرزی چەوری و دابەزینی ئینسۆلین';
    currentStageEn = 'High Fat Burning & Low Insulin State';
  } else if (hoursElapsed >= 18) {
    currentStageKu = 'قۆناغی پاکبوونه‌وه‌ی خاوێنی خانه‌کان (Autophagy Cell Renewal)';
    currentStageEn = 'Deep Cellular Autophagy & Regeneration';
  }

  const handleStartFasting = () => {
    setIsFasting(true);
    setStartTime(Date.now());
  };

  const handleStopFasting = () => {
    if (
      window.confirm(
        isKu
          ? 'دڵنیایت لە کۆتایی هێنان بە کاتی ڕۆژووگرتن؟'
          : 'Are you sure you want to stop your fasting timer?'
      )
    ) {
      setIsFasting(false);
      setStartTime(null);
      setElapsedSeconds(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {isKu ? 'ڕیمۆتی ڕۆژووی پچڕپچڕ (Intermittent Fasting)' : 'Intermittent Fasting Timer'}
                </h3>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Juula VIP Free
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isKu ? 'کۆنترۆڵکردنی کاتی ڕۆژوو، سووتاندنی چەوری و پاککردنەوەی جەستە' : 'Track fasting window, ketosis stages & fat burn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Plan Selector */}
        {!isFasting && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isKu ? 'سیستەمی ڕۆژووگرتنەکەت هەڵبژێرە:' : 'Select Fasting Plan:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FASTING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-3 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm block text-indigo-300">
                    {isKu ? plan.nameKu : plan.nameEn}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block line-clamp-2">
                    {isKu ? plan.descKu : plan.descEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Timer Display */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-3xl p-6 text-center relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            {isFasting
              ? isKu
                ? `کاتی ڕۆژووگرتن (${currentPlan.fastHours} کاتژمێر)`
                : `Fasting Progress (${currentPlan.fastHours}h Plan)`
              : isKu
              ? 'ئامادەیت بۆ دەستپێکردنی ڕۆژوو؟'
              : 'Ready to start your fast?'}
          </p>

          {/* Circle Ring Animation */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className={`${
                  progressPercent >= 100 ? 'text-emerald-400' : 'text-indigo-500'
                } transition-all duration-700 ease-out`}
                strokeWidth="8"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {String(hoursElapsed).padStart(2, '0')}:{String(minutesElapsed).padStart(2, '0')}:
                {String(secondsElapsed).padStart(2, '0')}
              </span>
              <span className="text-xs text-indigo-300 font-semibold mt-1">
                {progressPercent}% {isKu ? 'تەواوبووە' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Biological Stage Indicator */}
          {isFasting && (
            <div className="bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-3 text-xs text-indigo-200 mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-right rtl:text-right ltr:text-left">
                <span className="font-bold text-white block">
                  {isKu ? 'قۆناغی ئێستای جەستە:' : 'Current Biological State:'}
                </span>
                <span className="text-amber-300">
                  {isKu ? currentStageKu : currentStageEn}
                </span>
              </div>
            </div>
          )}

          {/* Remaining Hours */}
          {isFasting && (
            <div className="mt-3 text-xs text-slate-400">
              {remainingSec > 0 ? (
                <span>
                  {isKu
                    ? `کاتژمێری ماوە بۆ شکاندنی ڕۆژوو: ${remHours} کاتژمێر و ${remMin} خولەک`
                    : `Time remaining: ${remHours}h ${remMin}m`}
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 inline" />
                  {isKu
                    ? 'پیرۆزە! ماوەی ڕۆژووەکەت بە سەرکەوتوویی تەواو بوو.'
                    : 'Congratulations! Fasting goal completed!'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Start / Stop Controls */}
        <div className="flex items-center gap-3">
          {!isFasting ? (
            <button
              onClick={handleStartFasting}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isKu ? 'دەستپێکردنی ڕۆژوو ئێستا' : 'Start Fasting Now'}</span>
            </button>
          ) : (
            <button
              onClick={handleStopFasting}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/25"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>{isKu ? 'کۆتایی هێنان بە ڕۆژوو' : 'End Fasting Session'}</span>
            </button>
          )}
        </div>

        {/* Info Tip */}
        <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            {isKu
              ? 'لە کاتی ڕۆژووی پچڕپچڕدا دەتوانیت ئاو، چای ڕەش یان سەوز بێ شەکر، و قاوەی ڕەش بێ شەکر و شیر بنۆشیت.'
              : 'During your fasting window you can drink water, black coffee, or unsweetened herbal tea without breaking fast.'}
          </p>
        </div>
      </div>
    </div>
  );
};
