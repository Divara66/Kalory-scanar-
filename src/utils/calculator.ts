import { UserProfile, MacroTargets, FitnessGoal, ActivityLevel } from '../types';

/**
 * Calculates BMR using Mifflin-St Jeor or Katch-McArdle (if body fat is known)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  bodyFatPercentage?: number
): { bmr: number; leanBodyMassKg?: number } {
  if (bodyFatPercentage && bodyFatPercentage > 3 && bodyFatPercentage < 60) {
    const lbm = weightKg * (1 - bodyFatPercentage / 100);
    // Katch-McArdle Formula
    const bmr = Math.round(370 + 21.6 * lbm);
    return { bmr, leanBodyMassKg: Math.round(lbm * 10) / 10 };
  }

  // Mifflin-St Jeor
  let bmr = 0;
  if (gender === 'male') {
    bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return { bmr };
}

/**
 * Activity Multipliers for TDEE
 */
export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // Little or no exercise
  light: 1.375,         // Exercise 1-3 times/week
  moderate: 1.55,       // Exercise 3-5 times/week
  active: 1.725,        // Exercise 6-7 times/week
  very_active: 1.9,     // Intense exercise / physical job
};

/**
 * Goal Adjustment Percentage for Calories
 */
export const goalMultipliers: Record<FitnessGoal, number> = {
  extreme_loss: 0.75, // 25% deficit
  weight_loss: 0.85,  // 15% deficit
  maintenance: 1.0,   // Maintenance
  muscle_gain: 1.15,  // 15% surplus
};

export function getBMICategory(bmi: number): { ku: string; en: string } {
  if (bmi < 18.5) return { ku: 'کەمتر لە سروشتی (لاواز)', en: 'Underweight' };
  if (bmi < 24.9) return { ku: 'کێشی نموونەیی و سروشتی', en: 'Normal Weight' };
  if (bmi < 29.9) return { ku: 'سەرەتای زیادبوونی کێش', en: 'Overweight' };
  if (bmi < 34.9) return { ku: 'قەڵەوی پلە یەک', en: 'Obesity Class I' };
  return { ku: 'قەڵەوی پلە بەرز', en: 'Obesity Class II+' };
}

/**
 * Calculates Target Calories, Macros and full body metrics forecast
 */
export function calculateMacroTargets(profile: UserProfile): MacroTargets {
  // 1. BMI & Ideal Weight
  const heightMeters = profile.heightCm / 100;
  const bmi = Math.round((profile.weightKg / (heightMeters * heightMeters)) * 10) / 10;
  const bmiCategory = getBMICategory(bmi);

  const idealWeightMinKg = Math.round(18.5 * heightMeters * heightMeters);
  const idealWeightMaxKg = Math.round(24.9 * heightMeters * heightMeters);

  // 2. Estimate Body Fat if waist is supplied
  let bodyFatEst = profile.bodyFatPercentage;
  if (!bodyFatEst && profile.waistCm && profile.waistCm > 40) {
    // Rough estimate based on Waist to Height ratio
    const whtr = profile.waistCm / profile.heightCm;
    if (profile.gender === 'male') {
      bodyFatEst = Math.round(Math.max(5, (whtr * 100 - 28) * 1.2));
    } else {
      bodyFatEst = Math.round(Math.max(10, (whtr * 100 - 22) * 1.2));
    }
  }

  // 3. BMR calculation
  const { bmr, leanBodyMassKg } = calculateBMR(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    bodyFatEst
  );

  // 4. Job & Workout fine-tuning on Activity Multiplier
  let actMultiplier = activityMultipliers[profile.activityLevel] || 1.55;
  if (profile.jobType === 'standing') actMultiplier += 0.05;
  if (profile.jobType === 'physical_labor') actMultiplier += 0.15;
  if (profile.workoutDaysPerWeek) {
    if (profile.workoutDaysPerWeek >= 6) actMultiplier = Math.max(actMultiplier, 1.725);
    else if (profile.workoutDaysPerWeek >= 3) actMultiplier = Math.max(actMultiplier, 1.55);
  }

  const tdee = Math.round(bmr * actMultiplier);

  // 5. Target Speed & Deficit/Surplus
  let targetCalories = Math.round(tdee * goalMultipliers[profile.goal]);
  let weeklyWeightChangeKg = 0;

  const targetSpeed = profile.targetSpeed || 'moderate';
  if (profile.goal === 'weight_loss' || profile.goal === 'extreme_loss') {
    const kgPerWk = targetSpeed === 'slow' ? 0.25 : targetSpeed === 'aggressive' ? 0.75 : 0.5;
    weeklyWeightChangeKg = -kgPerWk;
    const dailyDeficit = Math.round(kgPerWk * 1100); // ~7700 kcal per kg = ~1100 kcal/day for 1kg/wk
    targetCalories = Math.max(bmr, tdee - dailyDeficit);
  } else if (profile.goal === 'muscle_gain') {
    const kgPerWk = targetSpeed === 'slow' ? 0.25 : 0.4;
    weeklyWeightChangeKg = kgPerWk;
    const dailySurplus = Math.round(kgPerWk * 1000);
    targetCalories = tdee + dailySurplus;
  }

  if (profile.customCalories) {
    targetCalories = profile.customCalories;
  }

  const dailyDeficitSurplusKcal = targetCalories - tdee;

  // 6. Target Weight Forecast
  const targetWeightKg = profile.targetWeightKg || (profile.goal === 'weight_loss' ? idealWeightMaxKg : profile.weightKg);
  let estimatedWeeksToTarget: number | undefined = undefined;

  const weightDiff = Math.abs(profile.weightKg - targetWeightKg);
  if (weightDiff > 0.5 && weeklyWeightChangeKg !== 0) {
    estimatedWeeksToTarget = Math.ceil(weightDiff / Math.abs(weeklyWeightChangeKg));
  }

  // 7. Diet Preference & Macro Breakdown
  let proteinPerKg = 1.8;
  if (profile.goal === 'muscle_gain') proteinPerKg = 2.2;
  if (profile.goal === 'extreme_loss' || profile.goal === 'weight_loss') proteinPerKg = 2.0;
  if (profile.dietPreference === 'high_protein') proteinPerKg = 2.3;

  let proteinGrams = Math.round(profile.weightKg * proteinPerKg);
  if (profile.customProtein) {
    proteinGrams = profile.customProtein;
  }

  // Fat percentage depending on diet preference
  let fatPct = 0.25;
  if (profile.dietPreference === 'low_carb') fatPct = 0.35;
  if (profile.dietPreference === 'keto') fatPct = 0.65;

  let fatGrams = Math.round((targetCalories * fatPct) / 9);
  if (profile.customFat) {
    fatGrams = profile.customFat;
  }

  // Carbs calculation
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);

  let carbsGrams = Math.round(carbCalories / 4);
  if (profile.customCarbs) {
    carbsGrams = profile.customCarbs;
  }

  // Fiber
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  // Water recommendation (in Liters)
  const workoutAddLiters = (profile.workoutDaysPerWeek || 3) > 0 ? 0.6 : 0;
  const recommendedWaterLiters = Math.round((profile.weightKg * 0.035 + workoutAddLiters) * 10) / 10;

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    fiber: fiberGrams,
    bmr,
    tdee,
    bmi,
    bmiCategoryKu: bmiCategory.ku,
    bmiCategoryEn: bmiCategory.en,
    bodyFatEstimate: bodyFatEst,
    leanBodyMassKg,
    idealWeightMinKg,
    idealWeightMaxKg,
    recommendedWaterLiters,
    targetWeightKg,
    weeklyWeightChangeKg,
    estimatedWeeksToTarget,
    dailyDeficitSurplusKcal,
  };
}

export const defaultProfile: UserProfile = {
  age: 25,
  gender: 'male',
  weightKg: 75,
  heightCm: 175,
  targetWeightKg: 70,
  targetSpeed: 'moderate',
  activityLevel: 'moderate',
  goal: 'weight_loss',
  workoutDaysPerWeek: 3,
  workoutType: 'mixed',
  jobType: 'desk',
  dietPreference: 'balanced',
};
