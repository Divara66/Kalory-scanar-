import React from 'react';
import { Language } from '../types';
import { Droplet, Plus, Minus } from 'lucide-react';

interface WaterTrackerProps {
  glasses: number;
  onGlassesChange: (count: number) => void;
  language: Language;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  onGlassesChange,
  language,
}) => {
  const isKu = language === 'ku';
  const targetGlasses = 8; // 2 Liters

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-white my-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Droplet className="w-5 h-5 fill-sky-400 text-sky-400" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <span>{isKu ? 'ئاوی خوراوەی ڕۆژانە' : 'Daily Water Hydration'}</span>
            <span className="text-xs font-semibold text-sky-400 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded-full">
              {glasses * 0.25} / 2 {isKu ? 'لیتر' : 'Liters'}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            {isKu ? 'پێویستبوون: هەشت پەرداخ ئاو لە ڕۆژێکدا' : 'Recommended: 8 glasses (2.0 L) per day'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Visual Glass Indicators */}
        <div className="hidden sm:flex gap-1.5">
          {Array.from({ length: targetGlasses }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-7 rounded-sm border transition-all ${
                i < glasses
                  ? 'bg-sky-400 border-sky-300 shadow-sm shadow-sky-400/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => onGlassesChange(Math.max(0, glasses - 1))}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-black px-2 text-sky-400">{glasses}</span>
          <button
            onClick={() => onGlassesChange(glasses + 1)}
            className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
