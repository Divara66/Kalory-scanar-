import React, { useState } from 'react';
import { MacroTargets, Language, GeneratedMealPlan } from '../types';
import { Sparkles, X, RefreshCw, Utensils, Check, ChefHat, Dumbbell, Flame, Wheat, Droplets } from 'lucide-react';

interface MealPlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: MacroTargets;
  language: Language;
}

export const MealPlanGeneratorModal: React.FC<MealPlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  targets,
  language,
}) => {
  const isKu = language === 'ku';

  const [dietPref, setDietPref] = useState<string>('kurdish');
  const [loading, setLoading] = useState<boolean>(false);
  const [mealPlan, setMealPlan] = useState<GeneratedMealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: targets.calories,
          targetProtein: targets.protein,
          targetCarbs: targets.carbs,
          targetFat: targets.fat,
          goal: 'High Protein Fitness',
          dietPreference: dietPref,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || (isKu ? 'شکستی هێنا لە دروستکردنی پلانەکە' : 'Failed to generate meal plan'));
      }

      setMealPlan(json.data);
    } catch (err: any) {
      setError(err.message || (isKu ? 'کێشەیەک ڕوویدا' : 'Error generating plan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isKu ? 'دروستکەری پلانی خواردنی ژیری دەستکرد' : 'AI Custom Meal Plan Generator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isKu
                  ? `داڕشتنی ژەمی گونجاو بۆ ${targets.calories} کالۆری و ${targets.protein}گ پرۆتین`
                  : `Tailored meal plan matching ${targets.calories} kcal & ${targets.protein}g protein`}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Preferences Selector */}
          {!mealPlan && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {isKu ? 'جۆری خواردن و ئارەزوو:' : 'Dietary Style & Preference:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'kurdish', ku: 'خواردنی کوردی و باو', en: 'Kurdish & Local' },
                    { id: 'high_protein', ku: 'پڕ لە پرۆتین (یانەی وەرزش)', en: 'High Protein Gym' },
                    { id: 'keto_lowcarb', ku: 'کیتۆ / کاربی کەم', en: 'Low Carb / Keto' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDietPref(p.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        dietPref === p.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isKu ? p.ku : p.en}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isKu ? 'دروستکردنی ژەمەکان بە هۆشی دەستکرد...' : 'Generating custom plan...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isKu ? 'دروستکردنی پلانی خواردن' : 'Generate Meal Plan'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Generated Plan Result */}
          {mealPlan && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-800/40 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-base text-white">
                    {isKu ? mealPlan.titleKu : mealPlan.titleEn}
                  </h4>
                  <p className="text-xs text-indigo-200 mt-1">
                    {isKu ? mealPlan.summaryKu : mealPlan.summaryEn}
                  </p>
                </div>
                <button
                  onClick={() => setMealPlan(null)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                >
                  {isKu ? 'پلانی نوێ' : 'New Plan'}
                </button>
              </div>

              {/* Meals List */}
              <div className="space-y-3">
                {mealPlan.meals?.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full inline-block mb-1">
                          {isKu ? m.mealTypeKu || m.mealType : m.mealType}
                        </span>
                        <h5 className="font-bold text-sm text-white">{isKu ? m.nameKu : m.nameEn}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{isKu ? m.descriptionKu : m.descriptionEn}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-white">{m.calories}</span>
                        <span className="text-[10px] text-slate-400 block">{isKu ? 'کالۆری' : 'kcal'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-[11px] pt-1 border-t border-slate-800/80">
                      <span className="text-sky-400 font-semibold">{m.proteinGrams}g Protein</span>
                      <span className="text-amber-400 font-semibold">{m.carbsGrams}g Carbs</span>
                      <span className="text-rose-400 font-semibold">{m.fatGrams}g Fat</span>
                    </div>

                    {(m.prepTipKu || m.prepTipEn) && (
                      <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg italic">
                        💡 {isKu ? m.prepTipKu : m.prepTipEn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
