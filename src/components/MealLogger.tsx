import React from 'react';
import { FoodItem, Language, MealType } from '../types';
import { Trash2, Sun, Sunset, Moon, Coffee, Plus, Camera, Utensils } from 'lucide-react';

interface MealLoggerProps {
  logs: FoodItem[];
  onDeleteLog: (id: string) => void;
  onOpenScanner: () => void;
  onOpenSearch: () => void;
  language: Language;
}

export const MealLogger: React.FC<MealLoggerProps> = ({
  logs,
  onDeleteLog,
  onOpenScanner,
  onOpenSearch,
  language,
}) => {
  const isKu = language === 'ku';

  const mealCategories: { id: MealType; labelKu: string; labelEn: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'breakfast',
      labelKu: 'ژەمی بەیانیان',
      labelEn: 'Breakfast',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30',
    },
    {
      id: 'lunch',
      labelKu: 'ژەمی نیوەڕوان',
      labelEn: 'Lunch',
      icon: <Coffee className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30',
    },
    {
      id: 'dinner',
      labelKu: 'ژەمی ئێواران',
      labelEn: 'Dinner',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/30',
    },
    {
      id: 'snack',
      labelKu: 'سووکەژەم / تێپەڕین',
      labelEn: 'Snacks',
      icon: <Sunset className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-4 my-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {isKu ? 'ژەمە تۆمارکراوەکانی ئەمڕۆ' : 'Today’s Logged Meals'}
          </h3>
          <p className="text-xs text-slate-400">
            {isKu ? `${logs.length} خواردن تۆمارکراوە` : `${logs.length} item(s) logged`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isKu ? 'سکان' : 'Scan'}</span>
          </button>
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isKu ? 'زیادکردن' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealCategories.map((cat) => {
          const catLogs = logs.filter((l) => l.mealType === cat.id);
          const catCalories = catLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
          const catProtein = catLogs.reduce((acc, curr) => acc + (curr.proteinGrams || 0), 0);

          return (
            <div
              key={cat.id}
              className={`bg-slate-900 border ${cat.color} rounded-2xl p-4 space-y-3 shadow-md`}
            >
              {/* Category Header */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {cat.icon}
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {isKu ? cat.labelKu : cat.labelEn}
                  </h4>
                </div>
                <div className="text-right text-xs">
                  <span className="font-extrabold text-white">{catCalories}</span>
                  <span className="text-slate-400 font-normal"> kcal</span>
                  <span className="text-sky-400 font-bold ml-2 rtl:mr-2">({catProtein}g P)</span>
                </div>
              </div>

              {/* Items List */}
              {catLogs.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/30">
                  <p className="text-xs text-slate-500">
                    {isKu ? 'هیچ خواردنێک تۆمار نەکراوە' : 'No items logged yet'}
                  </p>
                  <button
                    onClick={onOpenSearch}
                    className="text-[11px] text-emerald-400 hover:underline mt-1 font-semibold cursor-pointer inline-block"
                  >
                    + {isKu ? 'زیادکردنی خواردن' : 'Add Food Item'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {catLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {log.imageUrl ? (
                          <img
                            src={log.imageUrl}
                            alt={log.foodNameEn}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Utensils className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                            {isKu ? log.foodNameKu : log.foodNameEn}
                          </h5>
                          <span className="text-[11px] text-slate-400 block">
                            {log.portionGrams}g
                          </span>
                          <div className="flex gap-2 text-[10px] mt-0.5">
                            <span className="text-sky-400 font-semibold">{log.proteinGrams}g P</span>
                            <span className="text-amber-400 font-semibold">{log.carbsGrams}g C</span>
                            <span className="text-rose-400 font-semibold">{log.fatGrams}g F</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-black text-sm text-white block">{log.calories}</span>
                          <span className="text-[9px] text-slate-400 block">{isKu ? 'کالۆری' : 'kcal'}</span>
                        </div>
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                          title={isKu ? 'سڕینەوە' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
