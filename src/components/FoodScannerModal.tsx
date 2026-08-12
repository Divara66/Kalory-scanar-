import React, { useState, useRef } from 'react';
import { FoodItem, Language, MealType } from '../types';
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Flame, Dumbbell, Wheat, Droplets, ArrowRight } from 'lucide-react';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (log: Omit<FoodItem, 'id' | 'timestamp' | 'dateStr'>) => void;
  language: Language;
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  onAddLog,
  language,
}) => {
  const isKu = language === 'ku';

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Result state from Gemini
  const [scanResult, setScanResult] = useState<{
    foodNameKu: string;
    foodNameEn: string;
    estimatedWeightGrams: number;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
    healthScore?: number;
    ingredientsKu?: string[];
    ingredientsEn?: string[];
    adviceKu?: string;
    adviceEn?: string;
    tags?: string[];
  } | null>(null);

  // User adjustable fields before saving
  const [customWeight, setCustomWeight] = useState<number>(100);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError(null);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera handling
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError(isKu ? 'دەستگەیشتن بە کامێرا لەکارخراوە. تکایە بەکاری بهێنە لە ڕێگەی بارکردنی وێنە.' : 'Camera permission denied or unavailable. Please upload an image instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        setMimeType('image/jpeg');
        stopCamera();
        setScanResult(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          mimeType,
          notes,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || (isKu ? 'کێشەیەک ڕوویدا لە کاتی خەمڵاندنی وێنەکە' : 'Failed to analyze food image'));
      }

      setScanResult(json.data);
      setCustomWeight(json.data.estimatedWeightGrams || 200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isKu ? 'تکایە دڵنیابەوە لە هەبوونی پێوەندی و هەوڵبدەرەوە.' : 'Connection error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Adjust macros scaled by user custom weight vs estimated weight
  const multiplier = scanResult ? (customWeight / (scanResult.estimatedWeightGrams || 100)) : 1;

  const scaledCalories = scanResult ? Math.round(scanResult.calories * multiplier) : 0;
  const scaledProtein = scanResult ? Math.round((scanResult.proteinGrams || 0) * multiplier * 10) / 10 : 0;
  const scaledCarbs = scanResult ? Math.round((scanResult.carbsGrams || 0) * multiplier * 10) / 10 : 0;
  const scaledFat = scanResult ? Math.round((scanResult.fatGrams || 0) * multiplier * 10) / 10 : 0;
  const scaledFiber = scanResult ? Math.round((scanResult.fiberGrams || 0) * multiplier * 10) / 10 : 0;

  const handleSaveToLog = () => {
    if (!scanResult) return;

    onAddLog({
      mealType: selectedMealType,
      foodNameKu: scanResult.foodNameKu,
      foodNameEn: scanResult.foodNameEn,
      portionGrams: customWeight,
      calories: scaledCalories,
      proteinGrams: scaledProtein,
      carbsGrams: scaledCarbs,
      fatGrams: scaledFat,
      fiberGrams: scaledFiber,
      healthScore: scanResult.healthScore,
      imageUrl: imagePreview || undefined,
      ingredientsKu: scanResult.ingredientsKu,
      ingredientsEn: scanResult.ingredientsEn,
      adviceKu: scanResult.adviceKu,
      adviceEn: scanResult.adviceEn,
      tags: scanResult.tags,
    });

    handleCloseModal();
  };

  const handleCloseModal = () => {
    stopCamera();
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isKu ? 'سکانکەر و شیکارکەری خواردن بە وێنە' : 'AI Food Photo Scanner'}
              </h3>
              <p className="text-xs text-slate-400">
                {isKu ? 'وێنەی خواردنەکە بگرە تا ڕێژەی کالۆری و پرۆتینت پێ بڵێت' : 'Snap or upload a meal photo for calorie & macro calculation'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera View or Image Selector */}
          {!scanResult && (
            <div className="space-y-4">
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button
                      onClick={capturePhoto}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isKu ? 'وێنەگرتن' : 'Capture'}</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-full text-sm cursor-pointer"
                    >
                      {isKu ? 'داخستن' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-64 flex justify-center items-center">
                  <img src={imagePreview} alt="Food preview" className="max-h-64 object-contain" />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full border border-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Take Photo Button */}
                  <button
                    onClick={startCamera}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-950/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">
                      {isKu ? 'کامێرا بکەرەوە' : 'Take a Photo'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {isKu ? 'وێنەی سەر زەرف یان قاپەکە بگرە' : 'Use your device camera'}
                    </span>
                  </button>

                  {/* Upload Image Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 bg-slate-950/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">
                      {isKu ? 'هەڵبژاردنی وێنە' : 'Upload Image'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {isKu ? 'وێنەیەک لە گەلەریدا بپۆستە' : 'Select JPEG/PNG photo'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* Optional User Context Notes */}
              {imagePreview && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {isKu ? 'تێبینی یان بڕی خواردنەکە (ئارەزوومەندانە):' : 'Additional details or portion size (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isKu
                        ? 'نموونە: قاپێک برنجی ڕەش لەگەڵ مریشکی برژاو'
                        : 'e.g. 1 plate of white rice with grilled chicken'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Scan Action Button */}
              {imagePreview && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{isKu ? 'شیکارکردنی وێنە لەگەڵ هۆشی دەستکرد...' : 'Analyzing photo with Gemini AI...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{isKu ? 'شیکارکردنی کالۆری و پرۆتین' : 'Analyze Calories & Macros'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* AI RESULT DISPLAY */}
          {scanResult && (
            <div className="space-y-5 animate-fade-in">
              {/* Title & Identified Food */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 border border-emerald-800/60 px-2.5 py-0.5 rounded-full mb-1 inline-block">
                    {isKu ? 'دەستنیشانکراو لە وێنەکەوە' : 'Identified Food'}
                  </span>
                  <h4 className="text-xl font-bold text-white">
                    {isKu ? scanResult.foodNameKu : scanResult.foodNameEn}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isKu ? scanResult.foodNameEn : scanResult.foodNameKu}
                  </p>
                </div>

                {scanResult.healthScore && (
                  <div className="text-right bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {isKu ? 'نمرەی تەندروستی' : 'Health Score'}
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      {scanResult.healthScore}/10
                    </span>
                  </div>
                )}
              </div>

              {/* Editable Portion Weight */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block">
                    {isKu ? 'کێش و ڕێژەی خواردنەکە (بە گرام):' : 'Adjust Portion Weight (Grams):'}
                  </label>
                  <p className="text-[11px] text-slate-400">
                    {isKu ? `خەمڵاندنی ژیری دەستکرد: ${scanResult.estimatedWeightGrams}گ` : `AI estimated: ${scanResult.estimatedWeightGrams}g`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-300 font-bold">{isKu ? 'گرام' : 'grams'}</span>
                </div>
              </div>

              {/* Calculated Macros Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Calories */}
                <div className="bg-slate-950 border border-orange-900/30 p-3.5 rounded-xl text-center">
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <span className="text-2xl font-black text-white">{scaledCalories}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{isKu ? 'کالۆری (kcal)' : 'Calories'}</span>
                </div>

                {/* Protein */}
                <div className="bg-slate-950 border border-sky-900/30 p-3.5 rounded-xl text-center">
                  <Dumbbell className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <span className="text-2xl font-black text-sky-400">{scaledProtein}g</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{isKu ? 'پرۆتین' : 'Protein'}</span>
                </div>

                {/* Carbs */}
                <div className="bg-slate-950 border border-amber-900/30 p-3.5 rounded-xl text-center">
                  <Wheat className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-2xl font-black text-amber-400">{scaledCarbs}g</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{isKu ? 'کاربۆهیدرات' : 'Carbs'}</span>
                </div>

                {/* Fat */}
                <div className="bg-slate-950 border border-rose-900/30 p-3.5 rounded-xl text-center">
                  <Droplets className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <span className="text-2xl font-black text-rose-400">{scaledFat}g</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{isKu ? 'چەوری' : 'Fats'}</span>
                </div>
              </div>

              {/* Meal Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  {isKu ? 'دیاریکردنی جۆری ژەم:' : 'Select Meal Category:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
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
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        selectedMealType === m.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isKu ? m.ku : m.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Advice & Ingredients */}
              {(scanResult.adviceKu || scanResult.adviceEn) && (
                <div className="bg-emerald-950/30 border border-emerald-800/40 p-3.5 rounded-xl text-xs text-emerald-200">
                  <span className="font-bold block mb-1">
                    {isKu ? '💡 ڕێنمایی خۆراکی ژیری دەستکرد:' : '💡 AI Nutritional Advice:'}
                  </span>
                  <p className="leading-relaxed">
                    {isKu ? scanResult.adviceKu || scanResult.adviceEn : scanResult.adviceEn || scanResult.adviceKu}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setScanResult(null)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  {isKu ? 'دووبارە سکانکردن' : 'Scan Again'}
                </button>
                <button
                  onClick={handleSaveToLog}
                  className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isKu ? 'زیادکردن بۆ لیستی خۆراکی ڕۆژانە' : 'Add to Daily Food Log'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
