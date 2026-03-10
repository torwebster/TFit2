import type {
  EngineContext,
  ReadinessResult,
  TrainingPlanResult,
  TrainingBlock,
  Exercise,
  Explanation,
} from '@/types';

// ---------------------------------------------------------------------------
// Exercise library
// ---------------------------------------------------------------------------

interface ExerciseTemplate {
  name: string;
  muscle_groups: string[];
  equipment: string[];
  category: string; // "push", "pull", "legs", "core", "cardio", "mobility"
}

const EXERCISE_DB: ExerciseTemplate[] = [
  // Push
  { name: 'Bench Press', muscle_groups: ['chest', 'triceps'], equipment: ['barbell', 'bench'], category: 'push' },
  { name: 'Overhead Press', muscle_groups: ['shoulders', 'triceps'], equipment: ['barbell'], category: 'push' },
  { name: 'Dumbbell Incline Press', muscle_groups: ['chest', 'shoulders'], equipment: ['dumbbells', 'bench'], category: 'push' },
  { name: 'Push-ups', muscle_groups: ['chest', 'triceps'], equipment: [], category: 'push' },
  { name: 'Dips', muscle_groups: ['chest', 'triceps'], equipment: ['dip_bars'], category: 'push' },
  { name: 'Lateral Raises', muscle_groups: ['shoulders'], equipment: ['dumbbells'], category: 'push' },
  { name: 'Tricep Pushdowns', muscle_groups: ['triceps'], equipment: ['cable_machine'], category: 'push' },

  // Pull
  { name: 'Barbell Rows', muscle_groups: ['back', 'biceps'], equipment: ['barbell'], category: 'pull' },
  { name: 'Pull-ups', muscle_groups: ['back', 'biceps'], equipment: ['pull_up_bar'], category: 'pull' },
  { name: 'Dumbbell Rows', muscle_groups: ['back', 'biceps'], equipment: ['dumbbells'], category: 'pull' },
  { name: 'Face Pulls', muscle_groups: ['rear_delts', 'upper_back'], equipment: ['cable_machine', 'bands'], category: 'pull' },
  { name: 'Bicep Curls', muscle_groups: ['biceps'], equipment: ['dumbbells'], category: 'pull' },
  { name: 'Lat Pulldowns', muscle_groups: ['back'], equipment: ['cable_machine'], category: 'pull' },

  // Legs
  { name: 'Squats', muscle_groups: ['quads', 'glutes'], equipment: ['barbell'], category: 'legs' },
  { name: 'Romanian Deadlifts', muscle_groups: ['hamstrings', 'glutes'], equipment: ['barbell'], category: 'legs' },
  { name: 'Leg Press', muscle_groups: ['quads', 'glutes'], equipment: ['leg_press'], category: 'legs' },
  { name: 'Lunges', muscle_groups: ['quads', 'glutes'], equipment: [], category: 'legs' },
  { name: 'Goblet Squats', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells'], category: 'legs' },
  { name: 'Calf Raises', muscle_groups: ['calves'], equipment: [], category: 'legs' },
  { name: 'Leg Curls', muscle_groups: ['hamstrings'], equipment: ['machine'], category: 'legs' },
  { name: 'Bulgarian Split Squats', muscle_groups: ['quads', 'glutes'], equipment: ['dumbbells'], category: 'legs' },

  // Core
  { name: 'Plank', muscle_groups: ['core'], equipment: [], category: 'core' },
  { name: 'Dead Bug', muscle_groups: ['core'], equipment: [], category: 'core' },
  { name: 'Hanging Leg Raises', muscle_groups: ['core'], equipment: ['pull_up_bar'], category: 'core' },
  { name: 'Ab Wheel Rollout', muscle_groups: ['core'], equipment: ['ab_wheel'], category: 'core' },

  // Cardio
  { name: 'Treadmill Run', muscle_groups: ['cardio'], equipment: ['treadmill'], category: 'cardio' },
  { name: 'Cycling', muscle_groups: ['cardio', 'quads'], equipment: ['bike'], category: 'cardio' },
  { name: 'Rowing Machine', muscle_groups: ['cardio', 'back'], equipment: ['rowing_machine'], category: 'cardio' },
  { name: 'Jump Rope', muscle_groups: ['cardio', 'calves'], equipment: ['jump_rope'], category: 'cardio' },
  { name: 'Brisk Walking', muscle_groups: ['cardio'], equipment: [], category: 'cardio' },

  // Mobility
  { name: 'Foam Rolling', muscle_groups: ['recovery'], equipment: ['foam_roller'], category: 'mobility' },
  { name: 'Hip Flexor Stretch', muscle_groups: ['hip_flexors'], equipment: [], category: 'mobility' },
  { name: 'Cat-Cow Stretch', muscle_groups: ['spine'], equipment: [], category: 'mobility' },
  { name: 'World\'s Greatest Stretch', muscle_groups: ['hips', 'thoracic'], equipment: [], category: 'mobility' },
  { name: 'Shoulder Dislocates', muscle_groups: ['shoulders'], equipment: ['bands'], category: 'mobility' },
  { name: 'Pigeon Stretch', muscle_groups: ['hips', 'glutes'], equipment: [], category: 'mobility' },
];

// ---------------------------------------------------------------------------
// Rep scheme by goal
// ---------------------------------------------------------------------------

function getRepScheme(
  goal: string,
  experience: string
): { sets: number; reps: string } {
  if (goal === 'muscle_gain') {
    return experience === 'beginner'
      ? { sets: 3, reps: '8-12' }
      : { sets: 4, reps: '8-12' };
  }
  if (goal === 'fat_loss') {
    return experience === 'advanced'
      ? { sets: 4, reps: '12-15' }
      : { sets: 3, reps: '12-15' };
  }
  if (goal === 'endurance') {
    return { sets: 3, reps: '15-20' };
  }
  // maintenance / general_health
  return experience === 'beginner'
    ? { sets: 2, reps: '10-12' }
    : { sets: 3, reps: '10-12' };
}

// ---------------------------------------------------------------------------
// Select workout type
// ---------------------------------------------------------------------------

const SPLIT_ROTATION = ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'full_body'];

function selectWorkoutType(ctx: EngineContext, readiness: ReadinessResult): string {
  if (readiness.level === 'rest') return 'mobility';

  // If severe injuries, do mobility
  const severeInjury = ctx.injuries.some((i) => i.severity >= 8);
  if (severeInjury) return 'mobility';

  if (readiness.level === 'low') return 'cardio';

  // Determine based on recent workouts
  const recentTypes = ctx.recent_workouts
    .filter((w) => w.days_ago <= 3)
    .map((w) => w.workout_type);

  // Find next in rotation that hasn't been done recently
  for (const type of SPLIT_ROTATION) {
    if (!recentTypes.includes(type)) return type;
  }

  // Fallback: full body
  return 'full_body';
}

// ---------------------------------------------------------------------------
// Filter exercises
// ---------------------------------------------------------------------------

function filterExercises(
  category: string,
  equipment: string[],
  injuries: { location: string; severity: number }[]
): ExerciseTemplate[] {
  const injuredParts = new Set(
    injuries.filter((i) => i.severity >= 4).map((i) => i.location.toLowerCase())
  );

  return EXERCISE_DB.filter((ex) => {
    if (ex.category !== category && category !== 'full_body') return false;
    if (
      category === 'full_body' &&
      !['push', 'pull', 'legs', 'core'].includes(ex.category)
    )
      return false;

    // Equipment check — exercises with no equipment requirement always pass
    if (
      ex.equipment.length > 0 &&
      !ex.equipment.some((eq) => equipment.includes(eq) || equipment.length === 0)
    )
      return false;

    // Injury check
    for (const mg of ex.muscle_groups) {
      if (injuredParts.has(mg)) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Main: compute training plan
// ---------------------------------------------------------------------------

export function computeTrainingPlan(
  ctx: EngineContext,
  readiness: ReadinessResult
): TrainingPlanResult {
  const explanations: Explanation[] = [];
  const workoutType = selectWorkoutType(ctx, readiness);

  // Check for deload
  const consecutiveHighRpe = ctx.recent_workouts.filter(
    (w) => w.rpe != null && w.rpe >= 8 && w.days_ago <= 3
  ).length;
  const needsDeload = consecutiveHighRpe >= 2;

  if (needsDeload) {
    explanations.push({
      factor: 'Deload',
      observation: `${consecutiveHighRpe} high-RPE sessions in last 3 days`,
      impact: 'Reducing intensity — deload session',
    });
  }

  // Mobility / rest day
  if (workoutType === 'mobility') {
    const mobilityExercises = EXERCISE_DB.filter(
      (ex) => ex.category === 'mobility' && ex.equipment.length === 0
    );
    const selected = mobilityExercises.slice(0, 5).map(
      (ex): Exercise => ({
        name: ex.name,
        sets: 2,
        reps: '30s hold',
        notes: 'Focus on breathing and relaxation',
      })
    );

    return {
      workout_type: 'mobility',
      title: 'Recovery & Mobility Session',
      blocks: [
        { name: 'Mobility Work', exercises: selected, duration_minutes: 20 },
      ],
      target_rpe: 3,
      estimated_duration_minutes: 20,
      explanations: [
        ...explanations,
        {
          factor: 'Workout selection',
          observation: 'Low readiness or injury',
          impact: 'Mobility session for active recovery',
        },
      ],
    };
  }

  // Cardio
  if (workoutType === 'cardio') {
    const cardioOptions = filterExercises('cardio', ctx.available_equipment, ctx.injuries);
    const mainCardio: Exercise = cardioOptions.length > 0
      ? { name: cardioOptions[0].name, reps: '20-30 min', notes: 'Zone 2, conversational pace' }
      : { name: 'Brisk Walking', reps: '30 min', notes: 'Moderate pace' };

    return {
      workout_type: 'cardio',
      title: 'Low-Impact Cardio Session',
      blocks: [
        {
          name: 'Warm-up',
          exercises: [{ name: 'Light walking', reps: '5 min' }],
          duration_minutes: 5,
        },
        {
          name: 'Main Cardio',
          exercises: [mainCardio],
          duration_minutes: Math.min(ctx.minutes_available - 10, 30),
        },
        {
          name: 'Cool-down',
          exercises: [{ name: 'Gentle stretching', reps: '5 min' }],
          duration_minutes: 5,
        },
      ],
      target_rpe: 5,
      estimated_duration_minutes: Math.min(ctx.minutes_available, 40),
      explanations: [
        ...explanations,
        {
          factor: 'Workout selection',
          observation: 'Moderate-low readiness',
          impact: 'Light cardio to stay active without overloading',
        },
      ],
    };
  }

  // Strength training (push/pull/legs/full_body)
  const available = filterExercises(workoutType, ctx.available_equipment, ctx.injuries);
  const scheme = getRepScheme(ctx.primary_goal, ctx.experience_level);

  // Adjust for deload
  const adjSets = needsDeload ? Math.max(scheme.sets - 1, 2) : scheme.sets;
  const targetRpe = needsDeload ? 5 : readiness.level === 'high' ? 8 : 7;

  // Select exercises — scale count by available time
  const exerciseCount = Math.min(
    Math.floor((ctx.minutes_available - 15) / 7), // ~7 min per exercise
    available.length,
    ctx.experience_level === 'beginner' ? 4 : 6
  );

  const selectedExercises = available.slice(0, Math.max(exerciseCount, 2));

  // Split into blocks
  const blocks: TrainingBlock[] = [];

  // Warm-up
  blocks.push({
    name: 'Warm-up',
    exercises: [
      { name: 'Light cardio', reps: '5 min', notes: 'Get heart rate up' },
      { name: 'Dynamic stretches', reps: '3 min', notes: 'Target working muscles' },
    ],
    duration_minutes: 8,
  });

  // Main work
  const mainExercises = selectedExercises.map(
    (ex): Exercise => ({
      name: ex.name,
      sets: adjSets,
      reps: scheme.reps,
      notes: needsDeload ? 'Lighter weight — deload' : '',
    })
  );

  blocks.push({
    name: 'Main Work',
    exercises: mainExercises,
    duration_minutes: exerciseCount * 7,
  });

  // Core finisher (if time allows)
  if (ctx.minutes_available >= 35) {
    const coreExercises = EXERCISE_DB.filter(
      (ex) => ex.category === 'core' && ex.equipment.length === 0
    );
    if (coreExercises.length > 0) {
      blocks.push({
        name: 'Finisher',
        exercises: coreExercises.slice(0, 2).map(
          (ex): Exercise => ({
            name: ex.name,
            sets: 2,
            reps: ex.name === 'Plank' ? '30-45s' : '12-15',
          })
        ),
        duration_minutes: 5,
      });
    }
  }

  // Cool-down
  blocks.push({
    name: 'Cool-down',
    exercises: [
      { name: 'Static stretching', reps: '5 min', notes: 'Hold each stretch 20-30s' },
    ],
    duration_minutes: 5,
  });

  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration_minutes ?? 0), 0);

  const titleMap: Record<string, string> = {
    push: 'Push Day — Chest, Shoulders & Triceps',
    pull: 'Pull Day — Back & Biceps',
    legs: 'Leg Day — Quads, Hamstrings & Glutes',
    full_body: 'Full Body Strength Session',
  };

  explanations.push({
    factor: 'Workout selection',
    observation: `${workoutType} selected based on recent training history`,
    impact: `${selectedExercises.length} exercises, ~${totalDuration} min`,
  });

  return {
    workout_type: workoutType,
    title: titleMap[workoutType] ?? `${workoutType} Session`,
    blocks,
    target_rpe: targetRpe,
    estimated_duration_minutes: totalDuration,
    explanations,
  };
}
