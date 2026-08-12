import React, { useState } from 'react';
import { UserProfile, Language, ActivityLevel, FitnessGoal, Gender, TargetSpeed, DietPreference, JobType } from '../types';
import { calculateMacroTargets } from '../utils/calculator';
import {
  Calculator,
  X,
  Check,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Target,
  Activity,
  Calendar,
  Scale,
  Sparkles,
  ChevronDown,
  Moon,
  Briefcase,
  HeartPulse,
  Ruler
} from 'lucide-react';

interface CalorieCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  language: Language;
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  language,
}) => {
  const isKu = language === 'ku';

  // Active step or tab mode for clean organization
  const [activeTab, setActiveTab] = useState<'basic' | 'lifestyle' | 'diet'>('basic');

  // Form State
  const [age, setAge] = useState<number>(userProfile.age || 25);
  const [gender, setGender] = useState<Gender>(userProfile.gender || 'male');
  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg || 75);
  const [heightCm, setHeightCm] = useState<number>(userProfile.heightCm || 175);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(userProfile.targetWeightKg || 70);
  const [targetSpeed, setTargetSpeed] = useState<TargetSpeed>(userProfile.targetSpeed || 'moderate');
  const [waistCm, setWaistCm] = useState<number | undefined>(userProfile.waistCm);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | undefined>(userProfile.bodyFatPercentage);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(userProfile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<FitnessGoal>(userProfile.goal || 'weight_loss');
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(userProfile.workoutDaysPerWeek || 3);
  const [workoutType, setWorkoutType] = useState<'gym' | 'cardio' | 'mixed' | 'home' | 'none'>(userProfile.workoutType || 'mixed');
  const [jobType, setJobType] = useState<JobType>(userProfile.jobType || 'desk');
  const [sleepHours, setSleepHours] = useState<number>(userProfile.sleepHours || 7);
  const [dietPreference, setDietPreference] = useState<DietPreference>(userProfile.dietPreference || 'balanced');

  // Custom Overrides
  const [useCustom, setUseCustom] = useState<boolean>(
    Boolean(userProfile.customCalories || userProfile.customProtein)
  );
  const [customCal, setCustomCal] = useState<number>(userProfile.customCalories || 2000);
  const [customProt, setCustomProt] = useState<number>(userProfile.customProtein || 150);

  if (!isOpen) return null;

  // Build current temporary profile for live calculations
  const tempProfile: UserProfile = {
    age,
    gender,
    weightKg,
    heightCm,
    targetWeightKg,
    targetSpeed,
    waistCm,
    bodyFatPercentage,
    activityLevel,
    goal,
    workoutDaysPerWeek,
    workoutType,
    jobType,
    sleepHours,
    dietPreference,
    customCalories: useCustom ? customCal : undefined,
    customProtein: useCustom ? customProt : undefined,
  };

  const calculated = calculateMacroTargets(tempProfile);

  const handleSave = () => {
    onSaveProfile(tempProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isKu ? 'حاسیبە و دیاریکردنی وردی ئامانج' : 'Precision Goal & Macro Calculator'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isKu ? 'پرسیاری خولەک بۆ خەمڵاندنی وردی کێش، کالۆری و کاتی گەیشتن' : 'Detailed body analysis & weekly target timeline'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'basic'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isKu ? '١. زانیاری جەستە و کێش' : '1. Body & Target'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifestyle')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'lifestyle'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isKu ? '٢. وەرزش و شێوازی ژیان' : '2. Exercise & Lifestyle'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diet')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'diet'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isKu ? '٣. سیستەمی خۆراک' : '3. Diet & Result'}</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* TAB 1: BASIC BODY & TARGET WEIGHT */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Gender */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {isKu ? 'ڕەگەز:' : 'Gender:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      gender === 'male'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    👨 {isKu ? 'نێر (پیاو)' : 'Male'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      gender === 'female'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    👩 {isKu ? 'مێ (ئافرەت)' : 'Female'}
                  </button>
                </div>
              </div>

              {/* Age, Current Weight, Height */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'تەمەن (ساڵ):' : 'Age:'}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(12, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'کێشی ئێستا (کگم):' : 'Current Weight (kg):'}
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Math.max(30, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-extrabold text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'باڵا (سم):' : 'Height (cm):'}
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Target Goal Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isKu ? 'ئامانجی سەرەکی:' : 'Main Fitness Goal:'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'weight_loss', ku: 'دابەزاندنی کێش', en: 'Weight Loss' },
                    { id: 'extreme_loss', ku: 'دابەزاندنی خێرا', en: 'Fast Fat Loss' },
                    { id: 'maintenance', ku: 'ڕاگرتنی کێش', en: 'Maintain Weight' },
                    { id: 'muscle_gain', ku: 'زیادکردنی ماسولکە', en: 'Muscle Gain' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as FitnessGoal)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        goal === g.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isKu ? g.ku : g.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Weight & Speed */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    <span>{isKu ? 'کێشی ئامانج (کێشی مەبەست):' : 'Target Weight (kg):'}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-emerald-300 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400">کگم</span>
                  </div>
                </div>

                {/* Progress Speed */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">
                    {isKu ? 'خێرایی گۆڕانکاری کێش لە هەفتەیەدا:' : 'Target Speed per week:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { id: 'slow', ku: 'لەسەرخۆ (٠.٢٥ کگم/هەفتە)', en: 'Slow (0.25kg/wk)' },
                      { id: 'moderate', ku: 'مامناوەند (٠.٥ کگم/هەفتە)', en: 'Steady (0.5kg/wk)' },
                      { id: 'aggressive', ku: 'خێرا (٠.٧٥ کگم/هەفتە)', en: 'Fast (0.75kg/wk)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTargetSpeed(s.id as TargetSpeed)}
                        className={`py-1.5 px-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                          targetSpeed === s.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isKu ? s.ku : s.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body Fat / Waist optional */}
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isKu ? 'پێوانەی زیاتر (ئارەزوومەندانە برای وردیی زیاتر):' : 'Optional Body Fat Metrics:'}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {isKu ? 'دەوری کەمەر (سم):' : 'Waist (cm):'}
                    </label>
                    <input
                      type="number"
                      placeholder="85"
                      value={waistCm || ''}
                      onChange={(e) => setWaistCm(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {isKu ? 'ڕێژەی چەوری (%):' : 'Body Fat (%):'}
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      value={bodyFatPercentage || ''}
                      onChange={(e) => setBodyFatPercentage(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('lifestyle')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{isKu ? 'هەنگاوی دواتر: وەرزش و چالاکی ➔' : 'Next: Lifestyle & Exercise ➔'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: LIFESTYLE & EXERCISE */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Workout Days per week */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isKu ? 'چەند ڕۆژ لە هەفتەیەدا وەرزش دەکەیت؟' : 'Workout Days per Week:'}</span>
                </label>
                <div className="flex gap-1.5 justify-between">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setWorkoutDaysPerWeek(days)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        workoutDaysPerWeek === days
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {days} {isKu ? 'ڕۆژ' : 'd'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Style */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {isKu ? 'جۆری وەرزشکردنەکەت:' : 'Primary Workout Style:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'gym', ku: '🏋️ یاری ئاسن و فیتنس', en: 'Gym / Weightlifting' },
                    { id: 'cardio', ku: '🏃 ڕاکردن / کاردیۆ', en: 'Cardio / Running' },
                    { id: 'mixed', ku: '🥊 تێکەڵاو (ئاسن + کاردیۆ)', en: 'Mixed Gym & Cardio' },
                    { id: 'home', ku: '🏠 وەرزشی ماڵەوە', en: 'Home Workout' },
                    { id: 'none', ku: '🚶 پیادەڕۆیی / بێ یانە', en: 'Walking / No Gym' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorkoutType(w.id as any)}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                        workoutType === w.id
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isKu ? w.ku : w.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Job Type */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isKu ? 'جۆری کاری ڕۆژانەت:' : 'Daily Work / Occupation Activity:'}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'desk', ku: '🖥️ کاری مێز / دانیشتن', en: 'Desk / Sedentary' },
                    { id: 'standing', ku: '🧍 بەپێوە وەستان (دوانگە/فرۆشگا)', en: 'Standing Job' },
                    { id: 'physical_labor', ku: '🔨 کاری قورسی جەستەیی', en: 'Heavy Physical Labor' },
                  ].map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setJobType(j.id as JobType)}
                      className={`p-2.5 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                        jobType === j.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isKu ? j.ku : j.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep duration */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isKu ? 'تێکڕای خەوی شەوانە:' : 'Average Sleep Duration:'}</span>
                  </span>
                  <span className="font-bold text-purple-300">{sleepHours} {isKu ? 'کاتژمێر' : 'hours'}</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                >
                  {isKu ? '⬅ پێشوو' : '⬅ Back'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diet')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{isKu ? 'هەنگاوی دواتر: خۆراک و ئەنجام ➔' : 'Next: Diet & Results ➔'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DIET PREFERENCE & COMPREHENSIVE FORECAST */}
          {activeTab === 'diet' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Diet Preference Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {isKu ? 'سیستەمی خۆراکی پەسەندکراوت:' : 'Diet Preference:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'balanced', ku: '🥗 هاوسەنگی کوردی', en: 'Balanced Kurdish' },
                    { id: 'high_protein', ku: '🍗 پرۆتینی بەرز (فیتنس)', en: 'High Protein (Gym)' },
                    { id: 'low_carb', ku: '🥑 کەم کاربۆهیدرات', en: 'Low Carb' },
                    { id: 'keto', ku: '🥓 کیتۆ (Keto)', en: 'Ketogenic' },
                    { id: 'fasting', ku: '⏱️ ڕۆژووی پچڕپچڕ', en: 'Intermittent Fasting' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDietPreference(d.id as DietPreference)}
                      className={`p-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        dietPreference === d.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isKu ? d.ku : d.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* FULL RESULTS ANALYSIS CARD */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isKu ? 'ئەنجامی شیکاری پێویستی ڕۆژانەت:' : 'Calculated Daily Plan:'}</span>
                  </h4>
                  <span className="text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300 font-semibold">
                    BMI: {calculated.bmi} ({isKu ? calculated.bmiCategoryKu : calculated.bmiCategoryEn})
                  </span>
                </div>

                {/* Daily Macro Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <span className="text-lg font-black text-white block">{calculated.calories}</span>
                    <span className="text-[10px] text-slate-400">{isKu ? 'کالۆری' : 'kcal'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <Dumbbell className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span className="text-lg font-black text-sky-400 block">{calculated.protein}g</span>
                    <span className="text-[10px] text-slate-400">{isKu ? 'پرۆتین' : 'Protein'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <Wheat className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-lg font-black text-amber-400 block">{calculated.carbs}g</span>
                    <span className="text-[10px] text-slate-400">{isKu ? 'کارب' : 'Carbs'}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <Droplets className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                    <span className="text-lg font-black text-rose-400 block">{calculated.fat}g</span>
                    <span className="text-[10px] text-slate-400">{isKu ? 'چەوری' : 'Fat'}</span>
                  </div>
                </div>

                {/* Timeline & Forecast Banner */}
                {calculated.estimatedWeeksToTarget && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300">
                        {isKu
                          ? `پێشبینی گەیشتن: نزیکەی ${calculated.estimatedWeeksToTarget} هەفتە!`
                          : `Timeline Forecast: ~${calculated.estimatedWeeksToTarget} weeks!`}
                      </p>
                      <p className="text-[11px] text-emerald-400/80">
                        {isKu
                          ? `لە کێشی ${weightKg} کگم بە گۆڕانکاری ${calculated.weeklyWeightChangeKg > 0 ? '+' : ''}${calculated.weeklyWeightChangeKg} کگم/هەفتە بۆ کێشی ${calculated.targetWeightKg} کگم.`
                          : `From ${weightKg}kg to ${calculated.targetWeightKg}kg at ${calculated.weeklyWeightChangeKg}kg/week.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Body Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                    <span>{isKu ? 'کێشی تەندروستی نموونەیی:' : 'Ideal Weight Range:'}</span>
                    <span className="font-bold text-white">{calculated.idealWeightMinKg} - {calculated.idealWeightMaxKg} کگم</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                    <span>{isKu ? 'ئاوی پێویستی ڕۆژانە:' : 'Daily Water Needed:'}</span>
                    <span className="font-bold text-sky-400">{calculated.recommendedWaterLiters} {isKu ? 'لیتر' : 'L'}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                    <span>{isKu ? 'ریژەی کالۆری بنەڕەتی (BMR):' : 'Basal Metabolic Rate:'}</span>
                    <span className="font-bold text-slate-300">{calculated.bmr} kcal</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                    <span>{isKu ? 'مەسرەفی سەرفبووی گشتی (TDEE):' : 'Total Daily Energy:'}</span>
                    <span className="font-bold text-slate-300">{calculated.tdee} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSave}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>{isKu ? 'تۆمارکردن و جێبەجێکردنی سیستەمەکە' : 'Save & Apply Goal Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
