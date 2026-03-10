import type { EngineContext, ReadinessResult, Explanation } from '@/types';

/**
 * Compute a 0-100 readiness score from today's metrics and recent history.
 *
 * Factors:
 *   - Sleep quality & quantity
 *   - HRV
 *   - Recent symptoms (pain severity)
 *   - Subjective energy (1-10)
 *   - Body battery
 *   - Fatigue from recent high-RPE workouts
 */
export function computeReadiness(ctx: EngineContext): ReadinessResult {
  let score = 70; // default baseline
  const explanations: Explanation[] = [];

  // --- Sleep ---
  if (ctx.sleep_score != null) {
    if (ctx.sleep_score >= 80) {
      score += 10;
      explanations.push({
        factor: 'Sleep quality',
        observation: `Sleep score ${ctx.sleep_score}/100 — excellent`,
        impact: '+10 readiness',
      });
    } else if (ctx.sleep_score < 50) {
      score -= 15;
      explanations.push({
        factor: 'Sleep quality',
        observation: `Sleep score ${ctx.sleep_score}/100 — poor`,
        impact: '-15 readiness',
      });
    }
  }

  if (ctx.sleep_hours != null) {
    if (ctx.sleep_hours < 6) {
      score -= 10;
      explanations.push({
        factor: 'Sleep duration',
        observation: `Only ${ctx.sleep_hours}h sleep`,
        impact: '-10 readiness',
      });
    } else if (ctx.sleep_hours >= 8) {
      score += 5;
      explanations.push({
        factor: 'Sleep duration',
        observation: `${ctx.sleep_hours}h sleep — well rested`,
        impact: '+5 readiness',
      });
    }
  }

  // --- HRV ---
  if (ctx.hrv != null) {
    if (ctx.hrv >= 60) {
      score += 5;
      explanations.push({
        factor: 'HRV',
        observation: `HRV ${ctx.hrv}ms — good recovery`,
        impact: '+5 readiness',
      });
    } else if (ctx.hrv < 30) {
      score -= 10;
      explanations.push({
        factor: 'HRV',
        observation: `HRV ${ctx.hrv}ms — stressed / under-recovered`,
        impact: '-10 readiness',
      });
    }
  }

  // --- Recent symptoms ---
  const recentPain = ctx.recent_symptoms.filter((s) => s.days_ago <= 2);
  if (recentPain.length > 0) {
    const maxSeverity = Math.max(...recentPain.map((s) => s.severity));
    if (maxSeverity >= 7) {
      score -= 20;
      explanations.push({
        factor: 'Pain/injury',
        observation: `Severe pain reported (${maxSeverity}/10)`,
        impact: '-20 readiness — prioritize recovery',
      });
    } else if (maxSeverity >= 4) {
      score -= 10;
      explanations.push({
        factor: 'Pain/injury',
        observation: `Moderate pain (${maxSeverity}/10)`,
        impact: '-10 readiness',
      });
    }
  }

  // --- Subjective energy ---
  if (ctx.subjective_energy != null) {
    if (ctx.subjective_energy <= 3) {
      score -= 10;
      explanations.push({
        factor: 'Energy level',
        observation: `Self-rated energy ${ctx.subjective_energy}/10 — low`,
        impact: '-10 readiness',
      });
    } else if (ctx.subjective_energy >= 8) {
      score += 5;
      explanations.push({
        factor: 'Energy level',
        observation: `Self-rated energy ${ctx.subjective_energy}/10 — great`,
        impact: '+5 readiness',
      });
    }
  }

  // --- Body battery ---
  if (ctx.body_battery != null) {
    if (ctx.body_battery < 25) {
      score -= 10;
      explanations.push({
        factor: 'Body battery',
        observation: `Body battery ${ctx.body_battery}% — depleted`,
        impact: '-10 readiness',
      });
    } else if (ctx.body_battery >= 75) {
      score += 5;
      explanations.push({
        factor: 'Body battery',
        observation: `Body battery ${ctx.body_battery}% — charged`,
        impact: '+5 readiness',
      });
    }
  }

  // --- Recent workout fatigue ---
  const highRpeWorkouts = ctx.recent_workouts.filter(
    (w) => w.rpe != null && w.rpe >= 8 && w.days_ago <= 2
  );
  if (highRpeWorkouts.length >= 2) {
    score -= 15;
    explanations.push({
      factor: 'Training fatigue',
      observation: `${highRpeWorkouts.length} high-intensity sessions in last 2 days`,
      impact: '-15 readiness — consider deload',
    });
  } else if (highRpeWorkouts.length === 1) {
    score -= 5;
    explanations.push({
      factor: 'Training fatigue',
      observation: 'High-intensity session yesterday',
      impact: '-5 readiness',
    });
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: ReadinessResult['level'];
  if (score >= 75) level = 'high';
  else if (score >= 50) level = 'moderate';
  else if (score >= 25) level = 'low';
  else level = 'rest';

  return { score, level, explanations };
}
