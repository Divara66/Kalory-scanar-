import React, { useState, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Target, Award, Calendar, AlertCircle } from 'lucide-react';

interface WeightLogEntry {
  id: string;
  dateStr: string;
  weightKg: number;
  waistCm?: number;
  notes?: string;
}

interface WeightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfileWeight: (newWeight: number) => void;
  language: Language;
}

export const WeightTrackerModal: React.FC<WeightTrackerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfileWeight,
  language,
}) => {
  const isKu = language === 'ku';

  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('juula_weight_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    // default seed log with current profile weight
    return [
      {
        id: 'seed_1',
        dateStr: new Date().toISOString().split('T')[0],
        weightKg: userProfile.weightKg || 75,
        notes: isKu ? 'کێشی سەرەتایی' : 'Initial Weight',
      },
    ];
  });

  const [newWeightInput, setNewWeightInput] = useState<string>(
    userProfile.weightKg ? String(userProfile.weightKg) : ''
  );
  const [newWaistInput, setNewWaistInput] = useState<string>(
    userProfile.waistCm ? String(userProfile.waistCm) : ''
  );
  const [newDateInput, setNewDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notesInput, setNotesInput] = useState<string>('');

  // Persist weight logs to local storage
  useEffect(() => {
    localStorage.setItem('juula_weight_logs_v1', JSON.stringify(weightLogs));
  }, [weightLogs]);

  if (!isOpen) return null;

  // Add new weight entry
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeightInput);
    if (isNaN(w) || w <= 20 || w >= 300) {
      alert(isKu ? 'تکایە ژمارەیەکی دروست بۆ کێش بنووسە' : 'Please enter a valid weight in kg');
      return;
    }

    const entry: WeightLogEntry = {
      id: 'w_' + Date.now(),
      dateStr: newDateInput || new Date().toISOString().split('T')[0],
      weightKg: w,
      waistCm: newWaistInput ? parseFloat(newWaistInput) : undefined,
      notes: notesInput.trim() || undefined,
    };

    const updated = [entry, ...weightLogs.filter((l) => l.dateStr !== entry.dateStr)].sort(
      (a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()
    );

    setWeightLogs(updated);
    onUpdateProfileWeight(w);
    setNotesInput('');
  };

  // Delete weight log
  const handleDeleteLog = (id: string) => {
    setWeightLogs((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : userProfile.weightKg;
  const initialWeight =
    weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : userProfile.weightKg;

  const totalDiff = Math.round((latestWeight - initialWeight) * 10) / 10;
  const targetWeight = userProfile.targetWeightKg || latestWeight;
  const remainingToTarget = Math.round(Math.abs(latestWeight - targetWeight) * 10) / 10;

  // Calculate BMI
  const heightM = (userProfile.heightCm || 170) / 100;
  const bmi = Math.round((latestWeight / (heightM * heightM)) * 10) / 10;

  let bmiLabelKu = 'کێشی ئاسایی';
  let bmiLabelEn = 'Normal Weight';
  let bmiColor = 'text-emerald-400';

  if (bmi < 18.5) {
    bmiLabelKu = 'کەم کێش (Underweight)';
    bmiLabelEn = 'Underweight';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 25 && bmi < 30) {
    bmiLabelKu = 'کێشی زیادە (Overweight)';
    bmiLabelEn = 'Overweight';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 30) {
    bmiLabelKu = 'قەڵەوی (Obese)';
    bmiLabelEn = 'Obese';
    bmiColor = 'text-rose-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {isKu ? 'تۆمار و بەدواداچوونی کێشی جەستە' : 'Body Weight Progress Tracker'}
                </h3>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Juula VIP Free
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isKu
                  ? 'چاودێریکردنی گۆڕانکاریی کێش، BMI و نزیکبوونەوە لە ئامانج'
                  : 'Track weight history, BMI index & progress towards goal'}
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">{isKu ? 'کێشی ئێستا' : 'Current Weight'}</span>
            <span className="text-xl font-black text-white">{latestWeight} <span className="text-xs font-normal text-slate-400">کگ</span></span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">{isKu ? 'ئامانج' : 'Target Goal'}</span>
            <span className="text-xl font-black text-emerald-400">{targetWeight} <span className="text-xs font-normal text-slate-400">کگ</span></span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">{isKu ? 'نیشاندەری BMI' : 'BMI Index'}</span>
            <span className={`text-xl font-black ${bmiColor}`}>{bmi}</span>
            <span className="text-[10px] text-slate-400 block truncate">{isKu ? bmiLabelKu : bmiLabelEn}</span>
          </div>
        </div>

        {/* Add Weight Form */}
        <form onSubmit={handleAddWeight} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{isKu ? 'تۆمارکردنی کێشی نوێ:' : 'Log New Weight Record:'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isKu ? 'کێش (کیلۆگرام):' : 'Weight (kg):'}</label>
              <input
                type="number"
                step="0.1"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                placeholder="75"
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isKu ? 'دێوربەری کەمەر (سم) (ئیختیاری):' : 'Waist (cm) (Opt):'}</label>
              <input
                type="number"
                step="0.5"
                value={newWaistInput}
                onChange={(e) => setNewWaistInput(e.target.value)}
                placeholder="82"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">{isKu ? 'بەروار:' : 'Date:'}</label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">{isKu ? 'تێبینی (بۆ نموونە: بەیانیان بە بێنانخواردن):' : 'Notes:'}</label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder={isKu ? 'تێبینییەک بنووسە...' : 'Optional notes...'}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isKu ? 'پاشەکەوتکردنی کێشی نوێ' : 'Save Weight Entry'}</span>
          </button>
        </form>

        {/* History Log List */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>{isKu ? 'مێژووی تۆمارکردنی کێش:' : 'Weight Log History:'}</span>
            <span className="text-[10px] text-slate-500 font-normal">{weightLogs.length} {isKu ? 'تۆمار' : 'entries'}</span>
          </h4>

          {weightLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{isKu ? 'هیچ تۆمارێک نییە.' : 'No entries yet.'}</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {weightLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{log.weightKg} کگ</span>
                        {log.waistCm && (
                          <span className="text-xs text-slate-400">({log.waistCm} سم کەمەر)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">{log.dateStr} {log.notes ? `• ${log.notes}` : ''}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title={isKu ? 'سڕینەوە' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
