// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type Goal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'endurance'
  | 'general_health';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// ---------------------------------------------------------------------------
// Engine input types
// ---------------------------------------------------------------------------

export interface Injury {
  location: string;
  severity: number; // 0-10
  notes?: string;
}

export interface RecentWorkout {
  days_ago: number;
  workout_type: string;
  rpe?: number;
  duration_minutes?: number;
}

export interface RecentSymptom {
  pain_location: string;
  severity: number;
  days_ago: number;
}

export interface NutritionSummary {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  meal_count: number;
}

export interface EngineContext {
  date: string; // ISO date

  // User profile
  primary_goal: Goal;
  experience_level: ExperienceLevel;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  available_equipment: string[];
  available_days: string[];
  minutes_available: number;
  training_style?: string;
  injuries: Injury[];
  dietary_preferences: string[];

  // Today's metrics
  sleep_score?: number;
  sleep_hours?: number;
  hrv?: number;
  steps?: number;
  subjective_energy?: number;
  body_battery?: number;

  // Recent history
  recent_workouts: RecentWorkout[];
  recent_symptoms: RecentSymptom[];
  yesterday_nutrition?: NutritionSummary;
  compliance_rate_7d: number; // 0-1
}

// ---------------------------------------------------------------------------
// Engine output types
// ---------------------------------------------------------------------------

export interface Explanation {
  factor: string;
  observation: string;
  impact: string;
}

export interface ReadinessResult {
  score: number; // 0-100
  level: 'high' | 'moderate' | 'low' | 'rest';
  explanations: Explanation[];
}

export interface TargetsResult {
  step_target: number;
  calorie_target?: number;
  protein_target_g?: number;
  carb_target_g?: number;
  fat_target_g?: number;
  explanations: Explanation[];
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string; // e.g. "8-12" or "30s"
  notes?: string;
}

export interface TrainingBlock {
  name: string; // "Warm-up", "Main Work", "Finisher", "Cool-down"
  exercises: Exercise[];
  duration_minutes?: number;
}

export interface TrainingPlanResult {
  workout_type: string;
  title: string;
  blocks: TrainingBlock[];
  target_rpe: number;
  estimated_duration_minutes: number;
  explanations: Explanation[];
}

export interface ActionItem {
  category: string; // "training", "nutrition", "recovery", "steps", "hydration"
  action: string;
  priority: number; // 1 = highest
}

export interface DailyPlan {
  date: string;
  readiness: ReadinessResult;
  targets: TargetsResult;
  training: TrainingPlanResult;
  actions: ActionItem[];
  overall_confidence: number; // 0-1
  explanations: Explanation[];
}

// ---------------------------------------------------------------------------
// Coach types
// ---------------------------------------------------------------------------

export type MessageIntent =
  | 'meal_log'
  | 'workout_log'
  | 'symptom_log'
  | 'schedule_update'
  | 'goal_update'
  | 'plan_question'
  | 'motivation'
  | 'chat';

export interface IntentResult {
  intent: MessageIntent;
  confidence: number;
  keywords_matched: string[];
}

export interface ExtractedUpdate {
  type: string;
  data: Record<string, unknown>;
  confidence: number;
}

export interface CoachResponse {
  message: string;
  actions: string[];
  follow_up?: string;
  updates: ExtractedUpdate[];
}

// ---------------------------------------------------------------------------
// Profile / forms
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  primary_goal: Goal;
  experience_level: ExperienceLevel;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  injuries: Injury[];
  available_equipment: string[];
  available_days: string[];
  minutes_per_session: number;
  training_style?: string;
  dietary_preferences: string[];
  onboarding_completed: boolean;
}

export interface DailyMetrics {
  date: string;
  sleep_score?: number;
  sleep_hours?: number;
  hrv?: number;
  steps?: number;
  weight_kg?: number;
  body_battery?: number;
  subjective_energy?: number;
}
