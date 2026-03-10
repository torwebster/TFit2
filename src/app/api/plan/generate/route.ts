import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { buildDailyPlan } from '@/lib/engines/engine';

export const dynamic = 'force-dynamic';
import { todayISO } from '@/lib/utils';
import type { EngineContext, Injury, RecentWorkout, RecentSymptom, NutritionSummary } from '@/types';

export async function POST() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = todayISO();

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Load today's metrics
  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // Load recent workouts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: workouts } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', sevenDaysAgo.toISOString())
    .order('logged_at', { ascending: false });

  // Load recent symptoms (last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const { data: symptoms } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', threeDaysAgo.toISOString());

  // Load yesterday's nutrition
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const { data: yesterdayMeals } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${yesterdayStr}T00:00:00`)
    .lt('logged_at', `${today}T00:00:00`);

  // Build yesterday nutrition summary
  let yesterdayNutrition: NutritionSummary | undefined;
  if (yesterdayMeals && yesterdayMeals.length > 0) {
    yesterdayNutrition = {
      total_calories: yesterdayMeals.reduce((s, m) => s + (m.calories ?? 0), 0),
      total_protein_g: yesterdayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0),
      total_carbs_g: yesterdayMeals.reduce((s, m) => s + (m.carbs_g ?? 0), 0),
      total_fat_g: yesterdayMeals.reduce((s, m) => s + (m.fat_g ?? 0), 0),
      meal_count: yesterdayMeals.length,
    };
  }

  // Build recent workouts
  const recentWorkouts: RecentWorkout[] = (workouts ?? []).map((w) => ({
    days_ago: Math.floor(
      (Date.now() - new Date(w.logged_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    workout_type: w.workout_type,
    rpe: w.rpe ?? undefined,
    duration_minutes: w.duration_minutes ?? undefined,
  }));

  // Build recent symptoms
  const recentSymptoms: RecentSymptom[] = (symptoms ?? []).map((s) => ({
    pain_location: s.pain_location,
    severity: s.severity,
    days_ago: Math.floor(
      (Date.now() - new Date(s.logged_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  // Build engine context
  const ctx: EngineContext = {
    date: today,
    primary_goal: profile.primary_goal as EngineContext['primary_goal'],
    experience_level: profile.experience_level as EngineContext['experience_level'],
    weight_kg: profile.weight_kg ?? undefined,
    height_cm: profile.height_cm ?? undefined,
    age: profile.age ?? undefined,
    available_equipment: profile.available_equipment ?? [],
    available_days: profile.available_days ?? [],
    minutes_available: profile.minutes_per_session ?? 45,
    training_style: profile.training_style ?? undefined,
    injuries: (profile.injuries as Injury[]) ?? [],
    dietary_preferences: profile.dietary_preferences ?? [],
    sleep_score: metrics?.sleep_score ?? undefined,
    sleep_hours: metrics?.sleep_hours ?? undefined,
    hrv: metrics?.hrv ?? undefined,
    steps: metrics?.steps ?? undefined,
    subjective_energy: metrics?.subjective_energy ?? undefined,
    body_battery: metrics?.body_battery ?? undefined,
    recent_workouts: recentWorkouts,
    recent_symptoms: recentSymptoms,
    yesterday_nutrition: yesterdayNutrition,
    compliance_rate_7d: 0.5, // TODO: calculate from plan completion
  };

  const plan = buildDailyPlan(ctx);

  // Upsert plan
  const { data: savedPlan, error } = await supabase
    .from('plans')
    .upsert(
      {
        user_id: user.id,
        date: today,
        plan_json: plan as unknown as Record<string, unknown>,
        rationale: plan.explanations.map((e) => `${e.factor}: ${e.impact}`).join('; '),
        confidence: plan.overall_confidence,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan, saved: savedPlan });
}
