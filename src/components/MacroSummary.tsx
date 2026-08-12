import React from 'react';
import { FoodItem, ExerciseLog, MacroTargets, Language } from '../types';
import { Flame, Dumbbell, Wheat, Droplets, Leaf, Trophy, Footprints, Zap } from 'lucide-react';

interface MacroSummaryProps {
  logs: FoodItem[];
  exerciseLogs?: ExerciseLog[];
  targets: MacroTargets;
  language: Language;
  onOpenCalculator: () => void;
  onOpenPedometer?: () => void;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({
  logs,
  exerciseLogs = [],
  targets,
  language,
  onOpenCalculator,
  onOpenPedometer,
}) => {
  const isKu = language === 'ku';

  // Calculate current consumed values
  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.proteinGrams || 0),
      carbs: acc.carbs + (log.carbsGrams || 0),
      fat: acc.fat + (log.fatGrams || 0),
      fiber: acc.fiber + (log.fiberGrams || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const roundedTotals = {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    fiber: Math.round(totals.fiber),
  };

  // Exercise burned calories
  const burnedCalories = exerciseLogs.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
  const netCalories = roundedTotals.calories - burnedCalories;

  const remainingCalories = targets.calories - netCalories;

  // Percentage calculations based on net calories
  const calPercent = Math.min(100, Math.max(0, Math.round((netCalories / targets.calories) * 100)));
  const proteinPercent = Math.min(100, Math.round((roundedTotals.protein / targets.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((roundedTotals.carbs / targets.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((roundedTotals.fat / targets.fat) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white my-4">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>{isKu ? 'پوختەی کالۆری و خۆراکی ڕۆژانە' : 'Daily Macro & Calorie Summary'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isKu
              ? 'چاودێریکردنی کالۆری خواردن و کالۆری سووتاوی بەپێ و وەرزش'
              : 'Track consumed food, exercise burn, and net calories'}
          </p>
        </div>
        <div className="flex gap-2">
          {onOpenPedometer && (
            <button
              onClick={onOpenPedometer}
              className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{isKu ? 'هەنگاو & وەرزش' : 'Steps & Burn'}</span>
            </button>
          )}
          <button
            onClick={onOpenCalculator}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {isKu ? 'دەستکاری ئامانجەکان' : 'Edit Targets'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Main Calorie Ring / Net Display */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{isKu ? 'کالۆریی خاوێن (صافی)' : 'Net Calories'}</span>
          </div>

          <div className="relative my-2 flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className={`${remainingCalories < 0 ? 'text-red-500' : 'text-emerald-500'} transition-all duration-700 ease-out`}
                strokeWidth="10"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * Math.min(100, calPercent)) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner text inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {netCalories}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {targets.calories} {isKu ? 'کالۆری' : 'kcal'}
              </span>
            </div>
          </div>

          {/* Consumed vs Burned stats row */}
          <div className="grid grid-cols-2 gap-2 w-full my-2 text-center text-xs">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">{isKu ? 'خوراو' : 'Food Intake'}</span>
              <span className="font-bold text-white text-sm">+{roundedTotals.calories}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">{isKu ? 'سووتاو (وەرزش)' : 'Exercise Burn'}</span>
              <span className="font-bold text-orange-400 text-sm">-{burnedCalories}</span>
            </div>
          </div>

          {/* Remaining status text */}
          <div className="mt-1 text-center">
            {remainingCalories >= 0 ? (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full inline-block">
                {remainingCalories} {isKu ? 'کالۆری ماوە بۆ ئامانجەکەت' : 'kcal remaining'}
              </span>
            ) : (
              <span className="text-xs font-medium text-red-400 bg-red-950/60 border border-red-800/50 px-3 py-1 rounded-full inline-block">
                {Math.abs(remainingCalories)} {isKu ? 'کالۆری زیاتر خوراوە لە ئامانج' : 'kcal over target'}
              </span>
            )}
          </div>
        </div>

        {/* Macros Breakdown (Protein, Carbs, Fat, Fiber) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Protein Bar */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <Dumbbell className="w-4 h-4" />
                <span>{isKu ? 'پرۆتین' : 'Protein'}</span>
              </div>
              <div className="text-slate-300 font-semibold">
                <span className="text-sky-400 font-bold">{roundedTotals.protein}g</span> / {targets.protein}g ({proteinPercent}%)
              </div>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isKu
                ? `تێبینیکردنی ڕێژەی پرۆتین بۆ دروستکردن و پاراستنی ماسولکە`
                : `Essential for muscle repair & growth`}
            </p>
          </div>

          {/* Carbohydrates Bar */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Wheat className="w-4 h-4" />
                <span>{isKu ? 'کاربۆهیدرات' : 'Carbohydrates'}</span>
              </div>
              <div className="text-slate-300 font-semibold">
                <span className="text-amber-400 font-bold">{roundedTotals.carbs}g</span> / {targets.carbs}g ({carbsPercent}%)
              </div>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isKu ? `سەرچاوەی سەرەکی وزە بۆ لەش و مێشک` : `Primary energy source for brain & muscles`}
            </p>
          </div>

          {/* Fats & Fiber Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fats Bar */}
            <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1">
                <div className="flex items-center gap-1 font-bold text-rose-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{isKu ? 'چەوری' : 'Fats'}</span>
                </div>
                <div className="text-slate-300 text-xs font-semibold">
                  <span className="text-rose-400">{roundedTotals.fat}g</span> / {targets.fat}g
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-1">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Fiber Indicator */}
            <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1">
                <div className="flex items-center gap-1 font-bold text-emerald-400">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{isKu ? 'فایبەر (ئەندامیک)' : 'Fiber'}</span>
                </div>
                <div className="text-slate-300 text-xs font-semibold">
                  <span className="text-emerald-400">{roundedTotals.fiber}g</span> / {targets.fiber}g
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-1">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((roundedTotals.fiber / (targets.fiber || 25)) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

