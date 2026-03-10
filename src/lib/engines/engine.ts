import type { EngineContext, DailyPlan, ActionItem } from '@/types';
import { computeReadiness } from './readiness';
import { computeTargets } from './targets';
import { computeTrainingPlan } from './training';

/**
 * Build a complete daily plan from user context.
 *
 * Pipeline:
 *   EngineContext → readiness → targets → training → DailyPlan
 *
 * All functions are pure — no side effects, no DB calls.
 */
export function buildDailyPlan(ctx: EngineContext): DailyPlan {
  const readiness = computeReadiness(ctx);
  const targets = computeTargets(ctx, readiness);
  const training = computeTrainingPlan(ctx, readiness);

  // Build action items
  const actions: ActionItem[] = [];
  let priority = 1;

  // Training action
  if (training.workout_type !== 'mobility' || readiness.level !== 'rest') {
    actions.push({
      category: 'training',
      action: `Complete ${training.title}`,
      priority: priority++,
    });
  }

  // Step action
  actions.push({
    category: 'steps',
    action: `Hit ${targets.step_target.toLocaleString()} steps`,
    priority: priority++,
  });

  // Nutrition actions
  if (targets.protein_target_g) {
    actions.push({
      category: 'nutrition',
      action: `Eat ${targets.protein_target_g}g protein across meals`,
      priority: priority++,
    });
  }

  if (targets.calorie_target) {
    actions.push({
      category: 'nutrition',
      action: `Target ~${targets.calorie_target} kcal today`,
      priority: priority++,
    });
  }

  // Recovery actions
  if (readiness.level === 'low' || readiness.level === 'rest') {
    actions.push({
      category: 'recovery',
      action: 'Prioritize sleep — aim for 8+ hours tonight',
      priority: priority++,
    });
  }

  // Hydration
  actions.push({
    category: 'hydration',
    action: 'Drink 2-3L water throughout the day',
    priority: priority++,
  });

  // Confidence calculation
  let confidence = 0.5;
  const metricCount = [
    ctx.sleep_score,
    ctx.sleep_hours,
    ctx.hrv,
    ctx.steps,
    ctx.subjective_energy,
    ctx.body_battery,
  ].filter((v) => v != null).length;

  confidence += metricCount * 0.07; // up to +0.42 for all 6 metrics
  if (ctx.weight_kg && ctx.height_cm && ctx.age) confidence += 0.05;
  if (ctx.recent_workouts.length > 0) confidence += 0.03;
  confidence = Math.min(confidence, 1);

  // Combine all explanations
  const allExplanations = [
    ...readiness.explanations,
    ...targets.explanations,
    ...training.explanations,
  ];

  return {
    date: ctx.date,
    readiness,
    targets,
    training,
    actions,
    overall_confidence: Math.round(confidence * 100) / 100,
    explanations: allExplanations,
  };
}
