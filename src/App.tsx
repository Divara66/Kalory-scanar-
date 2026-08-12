import React, { useState, useEffect } from 'react';
import { FoodItem, ExerciseLog, UserProfile, Language, MacroTargets } from './types';
import { defaultProfile, calculateMacroTargets } from './utils/calculator';
import { Navbar } from './components/Navbar';
import { MacroSummary } from './components/MacroSummary';
import { FoodScannerModal } from './components/FoodScannerModal';
import { FoodSearchModal } from './components/FoodSearchModal';
import { CalorieCalculatorModal } from './components/CalorieCalculatorModal';
import { MealPlanGeneratorModal } from './components/MealPlanGeneratorModal';
import { StepPedometerModal } from './components/StepPedometerModal';
import { FastingTrackerModal } from './components/FastingTrackerModal';
import { WeightTrackerModal } from './components/WeightTrackerModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { MealLogger } from './components/MealLogger';
import { WaterTracker } from './components/WaterTracker';
import { Sparkles, Utensils, Camera, Calculator, ShieldCheck, HeartPulse, Crown, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ku');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // User Profile State with local storage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('user_profile_v1');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  // Food Logs State keyed by Date (YYYY-MM-DD)
  const [logsByDate, setLogsByDate] = useState<Record<string, FoodItem[]>>(() => {
    try {
      const saved = localStorage.getItem('food_logs_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Exercise / Step Logs State keyed by Date
  const [exerciseByDate, setExerciseByDate] = useState<Record<string, ExerciseLog[]>>(() => {
    try {
      const saved = localStorage.getItem('exercise_logs_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Water Intake State keyed by Date
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('water_logs_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isMealPlanOpen, setIsMealPlanOpen] = useState<boolean>(false);
  const [isPedometerOpen, setIsPedometerOpen] = useState<boolean>(false);
  const [isFastingOpen, setIsFastingOpen] = useState<boolean>(false);
  const [isWeightTrackerOpen, setIsWeightTrackerOpen] = useState<boolean>(false);
  const [isPwaInstallOpen, setIsPwaInstallOpen] = useState<boolean>(false);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('user_profile_v1', JSON.stringify(userProfile));
  }, [userProfile]);

  // Sync logs to localStorage
  useEffect(() => {
    localStorage.setItem('food_logs_v1', JSON.stringify(logsByDate));
  }, [logsByDate]);

  // Sync exercise to localStorage
  useEffect(() => {
    localStorage.setItem('exercise_logs_v1', JSON.stringify(exerciseByDate));
  }, [exerciseByDate]);

  // Sync water to localStorage
  useEffect(() => {
    localStorage.setItem('water_logs_v1', JSON.stringify(waterByDate));
  }, [waterByDate]);

  const isKu = language === 'ku';

  // Calculate target macros for current user profile
  const targets: MacroTargets = calculateMacroTargets(userProfile);

  // Current day logs, exercises & water
  const currentLogs = logsByDate[selectedDate] || [];
  const currentExercises = exerciseByDate[selectedDate] || [];
  const currentWater = waterByDate[selectedDate] || 0;

  // Add Food Log Handler
  const handleAddLog = (newLog: Omit<FoodItem, 'id' | 'timestamp' | 'dateStr'>) => {
    const item: FoodItem = {
      ...newLog,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      dateStr: selectedDate,
    };

    setLogsByDate((prev) => ({
      ...prev,
      [selectedDate]: [item, ...(prev[selectedDate] || [])],
    }));
  };

  // Delete Food Log Handler
  const handleDeleteLog = (id: string) => {
    setLogsByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((item) => item.id !== id),
    }));
  };

  // Add Exercise Handler
  const handleAddExercise = (newEx: Omit<ExerciseLog, 'id' | 'timestamp' | 'dateStr'>) => {
    const item: ExerciseLog = {
      ...newEx,
      id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      dateStr: selectedDate,
    };

    setExerciseByDate((prev) => ({
      ...prev,
      [selectedDate]: [item, ...(prev[selectedDate] || [])],
    }));
  };

  // Delete Exercise Handler
  const handleDeleteExercise = (id: string) => {
    setExerciseByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((item) => item.id !== id),
    }));
  };

  // Water Handler
  const handleWaterChange = (count: number) => {
    setWaterByDate((prev) => ({
      ...prev,
      [selectedDate]: count,
    }));
  };

  return (
    <div
      dir={isKu ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 pb-12"
    >
      {/* Top Bar Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenMealPlan={() => setIsMealPlanOpen(true)}
        onOpenPedometer={() => setIsPedometerOpen(true)}
        onOpenFasting={() => setIsFastingOpen(true)}
        onOpenWeightTracker={() => setIsWeightTrackerOpen(true)}
        onOpenPwaInstall={() => setIsPwaInstallOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {/* Juula Free VIP Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{isKu ? 'تایبەتمەندییەکانی بەرنامەی ژوولا (Juula VIP) – ١٠٠٪ بەخۆڕایی' : 'All Juula VIP Premium Features – 100% Free Forever'}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {isKu
                  ? 'سکانکردنی وێنە بە هۆشی دەستکرد، پلانی ژەمەکان، بژمێری هەنگاو، و ڕیمۆتی ڕۆژووگرتن بە بێ هیچ ئابوونەیەک.'
                  : 'AI Photo Food Scan, Fasting Timer, Meal Plan Generator & Step Pedometer with zero paywalls.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isKu ? 'ئابوونە نییە' : 'No Subscriptions'}</span>
            </span>
          </div>
        </div>

        {/* Banner Action CTA for First-time / Quick Photo Scan */}
        {currentLogs.length === 0 && (
          <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-5 mb-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isKu ? 'وێنەی ژەمەکەت بگرە بۆ خەمڵاندنی دروستی کالۆری!' : 'Snap your food to calculate exact calories!'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isKu
                    ? 'ژیری دەستکرد وێنەکەت شیکار دەکات و بڕی پرۆتین، کاربۆهیدرات، و چەوریت پێ دەڵێت.'
                    : 'Gemini AI will identify items and extract calories, protein, carbs & fat.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isKu ? 'دەستپێکردنی وێنەگرتن' : 'Start Photo Scan'}</span>
            </button>
          </div>
        )}

        {/* Daily Calorie & Macro Summary Dashboard */}
        <MacroSummary
          logs={currentLogs}
          exerciseLogs={currentExercises}
          targets={targets}
          language={language}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenPedometer={() => setIsPedometerOpen(true)}
        />

        {/* Water Intake Hydration Tracker */}
        <WaterTracker
          glasses={currentWater}
          onGlassesChange={handleWaterChange}
          language={language}
        />

        {/* Meals Log Section */}
        <MealLogger
          logs={currentLogs}
          onDeleteLog={handleDeleteLog}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          language={language}
        />
      </main>

      {/* MODALS */}
      <FoodScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddLog={handleAddLog}
        language={language}
      />

      <FoodSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddLog={handleAddLog}
        language={language}
      />

      <CalorieCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        userProfile={userProfile}
        onSaveProfile={setUserProfile}
        language={language}
      />

      <MealPlanGeneratorModal
        isOpen={isMealPlanOpen}
        onClose={() => setIsMealPlanOpen(false)}
        targets={targets}
        language={language}
      />

      <StepPedometerModal
        isOpen={isPedometerOpen}
        onClose={() => setIsPedometerOpen(false)}
        userProfile={userProfile}
        exerciseLogs={currentExercises}
        onAddExercise={handleAddExercise}
        onDeleteExercise={handleDeleteExercise}
        language={language}
      />

      <FastingTrackerModal
        isOpen={isFastingOpen}
        onClose={() => setIsFastingOpen(false)}
        language={language}
      />

      <WeightTrackerModal
        isOpen={isWeightTrackerOpen}
        onClose={() => setIsWeightTrackerOpen(false)}
        userProfile={userProfile}
        onUpdateProfileWeight={(newWeight) =>
          setUserProfile((prev) => ({ ...prev, weightKg: newWeight }))
        }
        language={language}
      />

      <PwaInstallModal
        isOpen={isPwaInstallOpen}
        onClose={() => setIsPwaInstallOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <p className="flex items-center gap-1 mx-auto sm:mx-0">
          <HeartPulse className="w-4 h-4 text-emerald-500 inline" />
          <span>{isKu ? 'حاسیبە و شیکارکەری تەندروست بۆ خواردن و وەرزش' : 'Health & Fitness Calorie & Macro Tracker'}</span>
        </p>
        <p className="mx-auto sm:mx-0">
          {isKu ? 'بە تواناسازی هۆشی دەستکردی گۆگڵ جێبەجێ کراوە' : 'Powered by Google Gemini AI'}
        </p>
      </footer>
    </div>
  );
}

