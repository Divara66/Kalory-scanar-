import React from 'react';
import { Language, UserProfile } from '../types';
import { Camera, Calculator, Sparkles, Utensils, Calendar, Globe, Footprints, Timer, Scale, Crown } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenScanner: () => void;
  onOpenSearch: () => void;
  onOpenCalculator: () => void;
  onOpenMealPlan: () => void;
  onOpenPedometer: () => void;
  onOpenFasting: () => void;
  onOpenWeightTracker: () => void;
  onOpenPwaInstall: () => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  selectedDate,
  onDateChange,
  onOpenScanner,
  onOpenSearch,
  onOpenCalculator,
  onOpenMealPlan,
  onOpenPedometer,
  onOpenFasting,
  onOpenWeightTracker,
  onOpenPwaInstall,
  userProfile,
}) => {
  const isKu = language === 'ku';

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* App Logo & Title */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Utensils className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {isKu ? 'ژوولا Juula' : 'Juula Free Calorie Tracker'}
              </h1>
              <span className="bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3 fill-slate-950" />
                <span>{isKu ? '١٠٠٪ بەخۆڕایی' : '100% Free VIP'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isKu ? 'کالۆری • ڕۆژوو • بژمێری هەنگاو • سکانەری خواردن' : 'Calories • Fasting • Steps • AI Food Scan'}
            </p>
          </div>
        </div>

        {/* Date Selector & Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 text-sm text-slate-300">
            <Calendar className="w-4 h-4 mr-1.5 rtl:ml-1.5 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs sm:text-sm font-medium"
            />
            {selectedDate === todayStr && (
              <span className="ml-2 rtl:mr-2 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                {isKu ? 'ئەمڕۆ' : 'Today'}
              </span>
            )}
          </div>

          {/* AI Scan Button */}
          <button
            onClick={onOpenScanner}
            id="btn-scan-food"
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold px-3 py-2 rounded-lg text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isKu ? 'سکانکردنی وێنە' : 'Scan Photo'}</span>
          </button>

          {/* Intermittent Fasting Button */}
          <button
            onClick={onOpenFasting}
            id="btn-fasting"
            className="flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-700/60 text-indigo-300 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
            title={isKu ? 'ڕیمۆتی ڕۆژووی پچڕپچڕ' : 'Intermittent Fasting Timer'}
          >
            <Timer className="w-4 h-4 text-indigo-400" />
            <span>{isKu ? 'ڕۆژوو' : 'Fasting'}</span>
          </button>

          {/* Weight Tracker Button */}
          <button
            onClick={onOpenWeightTracker}
            id="btn-weight-tracker"
            className="flex items-center gap-1.5 bg-teal-950/80 hover:bg-teal-900/90 border border-teal-700/60 text-teal-300 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
            title={isKu ? 'تۆمارکردنی کێشی جەستە' : 'Weight Progress Tracker'}
          >
            <Scale className="w-4 h-4 text-teal-400" />
            <span>{isKu ? 'کێشی جەستە' : 'Weight'}</span>
          </button>

          {/* Step Pedometer / Mobile Health Sync Button */}
          <button
            onClick={onOpenPedometer}
            id="btn-pedometer"
            className="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
            title={isKu ? 'تەندروستی مۆبایل و هەنگاوەکان' : 'Mobile Health Sync & Steps'}
          >
            <Footprints className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">{isKu ? 'هەنگاوکان' : 'Steps'}</span>
          </button>

          {/* Search / Log Food Button */}
          <button
            onClick={onOpenSearch}
            id="btn-search-food"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">{isKu ? 'زیادکردن' : 'Add Food'}</span>
          </button>

          {/* Calorie Goal Calculator Button */}
          <button
            onClick={onOpenCalculator}
            id="btn-calculator"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-all cursor-pointer"
            title={isKu ? 'کالۆری و ئامانجی ڕۆژانە' : 'Calorie & Macro Calculator'}
          >
            <Calculator className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">{isKu ? 'حاسیبە' : 'Calc'}</span>
          </button>

          {/* AI Meal Planner */}
          <button
            onClick={onOpenMealPlan}
            id="btn-meal-plan"
            className="flex items-center gap-1.5 bg-indigo-900/40 hover:bg-indigo-800/50 border border-indigo-700/60 text-indigo-200 px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-all cursor-pointer"
            title={isKu ? 'دروستکردنی پلانی خواردن' : 'AI Meal Planner'}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">{isKu ? 'پلانی ژەمەکان' : 'AI Plan'}</span>
          </button>

          {/* Mobile App Install Button */}
          <button
            onClick={onOpenPwaInstall}
            id="btn-install-app"
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-all cursor-pointer animate-pulse"
            title={isKu ? 'دابەزاندنی بەرنامە لەسەر مۆبایلەکەت' : 'Install App on Phone'}
          >
            <span>📱</span>
            <span className="hidden sm:inline">{isKu ? 'دابەزاندن' : 'Install'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(isKu ? 'en' : 'ku')}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            title="گۆڕینی زمان / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{isKu ? 'EN' : 'کوردی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


