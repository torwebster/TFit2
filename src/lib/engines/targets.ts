import type { EngineContext, TargetsResult, Explanation, ReadinessResult } from '@/types';

/**
 * Compute daily step, calorie, and macro targets.
 *
 * Uses Mifflin-St Jeor for TDEE, adjusted by goal and readiness.
 */
export function computeTargets(
  ctx: EngineContext,
  readiness: ReadinessResult
): TargetsResult {
  const explanations: Explanation[] = [];

  // --- Step target ---
  let stepTarget = 8000;

  if (ctx.steps != null && ctx.steps < 5000 && readiness.level !== 'rest') {
    stepTarget = 10000;
    explanations.push({
      factor: 'Step target',
      observation: `Recent steps low (~${ctx.steps})`,
      impact: 'Increased step target to 10,000',
    });
  }

  if (readiness.level === 'rest') {
    stepTarget = 5000;
    explanations.push({
      factor: 'Step target',
      observation: 'Rest day readiness',
      impact: 'Reduced step target to 5,000',
    });
  } else if (readiness.level === 'low') {
    stepTarget = Math.min(stepTarget, 7000);
  }

  // --- Calorie target (Mifflin-St Jeor) ---
  let calorieTarget: number | undefined;
  let proteinTarget: number | undefined;
  let carbTarget: number | undefined;
  let fatTarget: number | undefined;

  if (ctx.weight_kg && ctx.height_cm && ctx.age) {
    // BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161 (female avg offset)
    // Using a gender-neutral midpoint: subtract 78
    const bmr = 10 * ctx.weight_kg + 6.25 * ctx.height_cm - 5 * ctx.age - 78;

    // Activity multiplier based on readiness
    let activityFactor = 1.55; // moderate
    if (readiness.level === 'high') activityFactor = 1.725;
    else if (readiness.level === 'low') activityFactor = 1.375;
    else if (readiness.level === 'rest') activityFactor = 1.2;

    let tdee = bmr * activityFactor;

    // Goal adjustment
    switch (ctx.primary_goal) {
      case 'fat_loss':
        calorieTarget = tdee - 400;
        explanations.push({
          factor: 'Calorie target',
          observation: `TDEE ~${Math.round(tdee)} kcal, fat loss goal`,
          impact: '-400 kcal deficit',
        });
        break;
      case 'muscle_gain':
        calorieTarget = tdee + 300;
        explanations.push({
          factor: 'Calorie target',
          observation: `TDEE ~${Math.round(tdee)} kcal, muscle gain goal`,
          impact: '+300 kcal surplus',
        });
        break;
      default:
        calorieTarget = tdee;
        explanations.push({
          factor: 'Calorie target',
          observation: `TDEE ~${Math.round(tdee)} kcal`,
          impact: 'Maintenance calories',
        });
    }

    calorieTarget = Math.round(calorieTarget);

    // --- Macro targets ---
    // Protein: 1.6-2.2 g/kg depending on goal
    const proteinPerKg =
      ctx.primary_goal === 'muscle_gain'
        ? 2.0
        : ctx.primary_goal === 'fat_loss'
          ? 2.2
          : 1.6;
    proteinTarget = Math.round(ctx.weight_kg * proteinPerKg);

    // Fat: 25-30% of calories
    const fatCalories = calorieTarget * 0.27;
    fatTarget = Math.round(fatCalories / 9);

    // Carbs: remaining calories
    const proteinCalories = proteinTarget * 4;
    const remainingCalories = calorieTarget - proteinCalories - fatCalories;
    carbTarget = Math.round(Math.max(remainingCalories, 0) / 4);

    explanations.push({
      factor: 'Macros',
      observation: `${proteinPerKg}g/kg protein for ${ctx.primary_goal}`,
      impact: `P:${proteinTarget}g  C:${carbTarget}g  F:${fatTarget}g`,
    });

    // Yesterday nutrition adjustment
    if (ctx.yesterday_nutrition) {
      if (
        ctx.yesterday_nutrition.total_protein_g <
        proteinTarget * 0.8
      ) {
        proteinTarget = Math.round(proteinTarget * 1.1);
        explanations.push({
          factor: 'Protein catch-up',
          observation: `Yesterday's protein (${Math.round(ctx.yesterday_nutrition.total_protein_g)}g) was low`,
          impact: `Bumped today's target to ${proteinTarget}g`,
        });
      }
    }
  }

  return {
    step_target: stepTarget,
    calorie_target: calorieTarget,
    protein_target_g: proteinTarget,
    carb_target_g: carbTarget,
    fat_target_g: fatTarget,
    explanations,
  };
}
