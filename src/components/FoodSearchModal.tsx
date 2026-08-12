import React, { useState } from 'react';
import { FoodItem, Language, MealType, PresetFood } from '../types';
import { presetFoods } from '../data/presetFoods';
import { Search, Plus, X, Sparkles, RefreshCw, Utensils, Edit3, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (log: Omit<FoodItem, 'id' | 'timestamp' | 'dateStr'>) => void;
  language: Language;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  onAddLog,
  language,
}) => {
  const isKu = language === 'ku';

  const [activeTab, setActiveTab] = useState<'preset' | 'ai_search' | 'custom'>('preset');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  // AI Search State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    foodNameKu: string;
    foodNameEn: string;
    portionDescriptionKu?: string;
    portionDescriptionEn?: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
    insightKu?: string;
  } | null>(null);

  // Custom Entry State
  const [customName, setCustomName] = useState<string>('');
  const [customCalories, setCustomCalories] = useState<number>(250);
  const [customProtein, setCustomProtein] = useState<number>(20);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(8);
  const [customPortion, setCustomPortion] = useState<number>(150);

  // Selected Preset Quantity State
  const [selectedPreset, setSelectedPreset] = useState<PresetFood | null>(null);
  const [presetGrams, setPresetGrams] = useState<number>(100);

  if (!isOpen) return null;

  // Filtered preset foods
  const filteredPresets = presetFoods.filter((f) => {
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      f.nameKu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // AI Search Execution
  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/search-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || (isKu ? 'شکستی هێنا لە خەمڵاندنی خواردنەکە' : 'Failed to search food'));
      }
      setAiResult(json.data);
    } catch (err: any) {
      setAiError(err.message || (isKu ? 'کێشەیەک ڕوویدا' : 'An error occurred'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddPresetToLog = (food: PresetFood) => {
    const multiplier = presetGrams / food.servingGrams;
    onAddLog({
      mealType: selectedMealType,
      foodNameKu: food.nameKu,
      foodNameEn: food.nameEn,
      portionGrams: presetGrams,
      calories: Math.round(food.calories * multiplier),
      proteinGrams: Math.round(food.proteinGrams * multiplier * 10) / 10,
      carbsGrams: Math.round(food.carbsGrams * multiplier * 10) / 10,
      fatGrams: Math.round(food.fatGrams * multiplier * 10) / 10,
      fiberGrams: Math.round((food.fiberGrams || 0) * multiplier * 10) / 10,
    });
    setSelectedPreset(null);
    onClose();
  };

  const handleAddAIResultToLog = () => {
    if (!aiResult) return;
    onAddLog({
      mealType: selectedMealType,
      foodNameKu: aiResult.foodNameKu,
      foodNameEn: aiResult.foodNameEn,
      portionGrams: 150,
      calories: aiResult.calories,
      proteinGrams: aiResult.proteinGrams,
      carbsGrams: aiResult.carbsGrams,
      fatGrams: aiResult.fatGrams,
      fiberGrams: aiResult.fiberGrams || 0,
      adviceKu: aiResult.insightKu,
    });
    setAiResult(null);
    setAiQuery('');
    onClose();
  };

  const handleAddCustomToLog = () => {
    if (!customName.trim()) return;
    onAddLog({
      mealType: selectedMealType,
      foodNameKu: customName,
      foodNameEn: customName,
      portionGrams: customPortion,
      calories: Number(customCalories),
      proteinGrams: Number(customProtein),
      carbsGrams: Number(customCarbs),
      fatGrams: Number(customFat),
    });
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isKu ? 'زیادکردنی خواردن و کاتۆلۆگ' : 'Add Food & Meal Log'}
              </h3>
              <p className="text-xs text-slate-400">
                {isKu ? 'گەڕان لە خواردنە کوردی و جیهانییەکان یان پرسیار لە ژیری دەستکرد' : 'Select from food library or query AI'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selector */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold px-2">
            {isKu ? 'ژەم:' : 'Meal:'}
          </span>
          <div className="grid grid-cols-4 gap-1.5 flex-1">
            {[
              { id: 'breakfast', ku: 'بەیانیان', en: 'Breakfast' },
              { id: 'lunch', ku: 'نیوەڕوان', en: 'Lunch' },
              { id: 'dinner', ku: 'ئێواران', en: 'Dinner' },
              { id: 'snack', ku: 'سووکەژەم', en: 'Snack' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMealType(m.id as MealType)}
                className={`py-1.5 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  selectedMealType === m.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isKu ? m.ku : m.en}
              </button>
            ))}
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'preset'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isKu ? 'کەتەلۆگی خواردنەکان' : 'Preset Food Library'}
          </button>
          <button
            onClick={() => setActiveTab('ai_search')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_search'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {isKu ? 'پرسیار لە ژیری دەستکرد' : 'Ask AI Calorie Parser'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isKu ? 'زیادکردنی دەستی' : 'Custom Entry'}
          </button>
        </div>

        {/* Tab 1: Preset Food Catalog */}
        {activeTab === 'preset' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Search Input & Category Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isKu ? 'گەڕان بەدوای کەباب، بریانی، مریشک، هێلکە...' : 'Search Kebab, Biryani, Chicken, Rice...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {[
                  { id: 'all', ku: 'هەمووی', en: 'All' },
                  { id: 'kurdish', ku: '🍲 خواردنی کوردی', en: '🍲 Kurdish Dishes' },
                  { id: 'protein', ku: '🍗 پرۆتین و گۆشت', en: '🍗 High Protein' },
                  { id: 'carbs', ku: '🍚 کارب و برنج', en: '🍚 Carbs & Grains' },
                  { id: 'dairy', ku: '🥛 شیرەمەنی', en: '🥛 Dairy' },
                  { id: 'fruits_veg', ku: '🥗 میوە و سەوزە', en: '🥗 Fruits & Veg' },
                  { id: 'sweets', ku: '🥐 شیرینی', en: '🥐 Sweets' },
                  { id: 'fats', ku: '🥜 چەرەسات', en: '🥜 Healthy Fats' },
                  { id: 'fastfood', ku: '🍔 فاست فود', en: '🍔 Fast Food' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(c.id)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all cursor-pointer ${
                      filterCategory === c.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isKu ? c.ku : c.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal popup if preset selected for quantity tweak */}
            {selectedPreset ? (
              <div className="bg-slate-950 border border-emerald-800/60 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {isKu ? selectedPreset.nameKu : selectedPreset.nameEn}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {isKu ? selectedPreset.servingUnitKu : selectedPreset.servingUnitEn}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPreset(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {isKu ? 'گەڕانەوە' : 'Back'}
                  </button>
                </div>

                <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">
                      {isKu ? 'بڕی ژەمەکە (بە گرام):' : 'Serving Size (grams):'}
                    </span>
                    <input
                      type="number"
                      value={presetGrams}
                      onChange={(e) => setPresetGrams(Math.max(10, Number(e.target.value)))}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-emerald-400 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="600"
                    step="10"
                    value={presetGrams}
                    onChange={(e) => setPresetGrams(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[50, 100, 150, 200, 250, 300, 400, 500].map((gramVal) => (
                      <button
                        key={gramVal}
                        type="button"
                        onClick={() => setPresetGrams(gramVal)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                          presetGrams === gramVal
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {gramVal}گ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Macro breakdown preview */}
                {(() => {
                  const m = presetGrams / selectedPreset.servingGrams;
                  return (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{isKu ? 'کالۆری' : 'Calories'}</span>
                        <span className="font-bold text-white">{Math.round(selectedPreset.calories * m)}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{isKu ? 'پرۆتین' : 'Protein'}</span>
                        <span className="font-bold text-sky-400">{Math.round(selectedPreset.proteinGrams * m)}g</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{isKu ? 'کارب' : 'Carbs'}</span>
                        <span className="font-bold text-amber-400">{Math.round(selectedPreset.carbsGrams * m)}g</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{isKu ? 'چەوری' : 'Fat'}</span>
                        <span className="font-bold text-rose-400">{Math.round(selectedPreset.fatGrams * m)}g</span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => handleAddPresetToLog(selectedPreset)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isKu ? 'زیادکردن بۆ تۆماری ڕۆژانە' : 'Confirm & Add to Log'}</span>
                </button>
              </div>
            ) : (
              /* Preset List Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPresets.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedPreset(food);
                      setPresetGrams(food.servingGrams);
                    }}
                    className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {isKu ? food.nameKu : food.nameEn}
                      </h5>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isKu ? food.servingUnitKu : food.servingUnitEn}
                      </span>
                      <div className="flex gap-2 text-[10px] mt-1 text-slate-400">
                        <span className="text-sky-400 font-semibold">{food.proteinGrams}g P</span>
                        <span className="text-amber-400 font-semibold">{food.carbsGrams}g C</span>
                        <span className="text-rose-400 font-semibold">{food.fatGrams}g F</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white block">{food.calories}</span>
                      <span className="text-[10px] text-slate-500 block">{isKu ? 'کالۆری' : 'kcal'}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mt-1 ml-auto group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-500 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Query Search */}
        {activeTab === 'ai_search' && (
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                {isKu ? 'نووسینی ڕوونکردنەوەی ژەمەکەت بۆ کاتیژمێری ژیری دەستکرد:' : 'Describe your food in plain Kurdish or English:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={
                    isKu
                      ? 'نموونە: ٣ هێلکەی نێو کەرە لەگەڵ پاچەیەک نانی میری و کەمێک پەنیر'
                      : 'e.g. 3 fried eggs in olive oil with 1 slice flatbread'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAISearch}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isKu ? 'حیسابکردن' : 'Calculate'}</span>
                </button>
              </div>
            </div>

            {aiError && <p className="text-xs text-red-400">{aiError}</p>}

            {/* AI Result View */}
            {aiResult && (
              <div className="bg-slate-950 border border-emerald-800/60 p-4 rounded-xl space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {isKu ? aiResult.foodNameKu : aiResult.foodNameEn}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isKu ? aiResult.portionDescriptionKu : aiResult.portionDescriptionEn}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isKu ? 'کالۆری' : 'Calories'}</span>
                    <span className="text-base font-bold text-white">{aiResult.calories}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isKu ? 'پرۆتین' : 'Protein'}</span>
                    <span className="text-base font-bold text-sky-400">{aiResult.proteinGrams}g</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isKu ? 'کارب' : 'Carbs'}</span>
                    <span className="text-base font-bold text-amber-400">{aiResult.carbsGrams}g</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isKu ? 'چەوری' : 'Fat'}</span>
                    <span className="text-base font-bold text-rose-400">{aiResult.fatGrams}g</span>
                  </div>
                </div>

                {aiResult.insightKu && (
                  <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                    💡 {aiResult.insightKu}
                  </p>
                )}

                <button
                  onClick={handleAddAIResultToLog}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  {isKu ? 'زیادکردن بۆ تۆماری ڕۆژانە' : 'Add to Log'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom Manual Entry */}
        {activeTab === 'custom' && (
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isKu ? 'ناوى خواردنەکە:' : 'Food Name:'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={isKu ? 'نموونە: شەربەتی مۆز یان سوپ' : 'e.g. Banana Shake'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'کالۆری (kcal):' : 'Calories (kcal):'}
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'کێش (گرام):' : 'Portion (grams):'}
                  </label>
                  <input
                    type="number"
                    value={customPortion}
                    onChange={(e) => setCustomPortion(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'پرۆتین (گ):' : 'Protein (g):'}
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-sky-400 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'کاربۆهیدرات (گ):' : 'Carbs (g):'}
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isKu ? 'چەوری (گ):' : 'Fat (g):'}
                  </label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-rose-400 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCustomToLog}
                disabled={!customName.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {isKu ? 'تۆمارکردن' : 'Save Custom Meal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
