export type Language = 'ku' | 'en';

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type FitnessGoal = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'extreme_loss';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DietPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'fasting';
export type JobType = 'desk' | 'standing' | 'physical_labor';
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph' | 'unspecified';
export type TargetSpeed = 'slow' | 'moderate' | 'aggressive';

export interface UserProfile {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
  targetSpeed?: TargetSpeed;
  waistCm?: number;
  bodyFatPercentage?: number;
  workoutDaysPerWeek?: number;
  workoutType?: 'gym' | 'cardio' | 'mixed' | 'home' | 'none';
  jobType?: JobType;
  sleepHours?: number;
  dietPreference?: DietPreference;
  bodyType?: BodyType;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  customCalories?: number;
  customProtein?: number;
  customCarbs?: number;
  customFat?: number;
}

export interface MacroTargets {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  fiber: number;    // g
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategoryKu: string;
  bmiCategoryEn: string;
  bodyFatEstimate?: number;
  leanBodyMassKg?: number;
  idealWeightMinKg: number;
  idealWeightMaxKg: number;
  recommendedWaterLiters: number;
  targetWeightKg?: number;
  weeklyWeightChangeKg: number;
  estimatedWeeksToTarget?: number;
  dailyDeficitSurplusKcal: number;
}

export interface FoodItem {
  id: string;
  timestamp: number; // Date.now()
  dateStr: string;   // YYYY-MM-DD
  mealType: MealType;
  foodNameKu: string;
  foodNameEn: string;
  portionGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  healthScore?: number;
  imageUrl?: string;
  ingredientsKu?: string[];
  ingredientsEn?: string[];
  adviceKu?: string;
  adviceEn?: string;
  tags?: string[];
}

export interface PresetFood {
  id: string;
  nameKu: string;
  nameEn: string;
  category: 'kurdish' | 'protein' | 'carbs' | 'fats' | 'fruits_veg' | 'dairy' | 'sweets' | 'fastfood';
  servingGrams: number;
  servingUnitKu: string;
  servingUnitEn: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  icon?: string;
}

export interface MealPlanItem {
  mealType: string;
  mealTypeKu: string;
  nameKu: string;
  nameEn: string;
  descriptionKu: string;
  descriptionEn: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  prepTipKu?: string;
  prepTipEn?: string;
}

export interface GeneratedMealPlan {
  titleKu: string;
  titleEn: string;
  summaryKu: string;
  summaryEn: string;
  meals: MealPlanItem[];
}

export type ExerciseType = 'steps' | 'walking' | 'running' | 'cycling' | 'gym' | 'swimming' | 'dabke' | 'sleep' | 'heart_rate' | 'stairs' | 'custom';

export interface ExerciseLog {
  id: string;
  timestamp: number;
  dateStr: string;
  type: ExerciseType;
  nameKu: string;
  nameEn: string;
  stepsCount?: number;
  durationMinutes?: number;
  distanceKm?: number;
  caloriesBurned: number;
  restingCalories?: number;
  heartRateBpm?: number;
  sleepHours?: number;
  stairsFlights?: number;
  spo2Percentage?: number;
}

export interface HealthMetricsSync {
  steps: number;
  distanceKm: number;
  activeCalories: number;
  restingCalories: number;
  heartRateAvg: number;
  heartRateResting: number;
  heartRateMax: number;
  sleepHoursTotal: number;
  deepSleepMin: number;
  remSleepMin: number;
  stairsFlights: number;
  activeMinutes: number;
  spo2Percentage: number;
  standHours: number;
  lastSyncedAt?: number;
}

