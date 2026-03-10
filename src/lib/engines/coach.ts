import type {
  MessageIntent,
  IntentResult,
  ExtractedUpdate,
  CoachResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Intent classification (keyword-based, no LLM)
// ---------------------------------------------------------------------------

const INTENT_PATTERNS: Record<MessageIntent, RegExp[]> = {
  meal_log: [
    /\b(ate|eaten|had|lunch|dinner|breakfast|snack|meal|protein shake|smoothie|calories|macros)\b/i,
  ],
  workout_log: [
    /\b(workout|trained|training|bench|squat|deadlift|ran|run|lifted|sets|reps|exercise|gym)\b/i,
  ],
  symptom_log: [
    /\b(pain|hurts|sore|soreness|injury|injured|ache|aching|stiff|tight|tweaked|pulled)\b/i,
  ],
  schedule_update: [
    /\b(available|busy|can't make it|limited time|schedule|free on|only have|minutes today)\b/i,
  ],
  goal_update: [
    /\b(goal|want to|trying to|lose weight|gain muscle|bulk|cut|get lean|get stronger)\b/i,
  ],
  plan_question: [
    /\b(plan|what should|recommend|suggestion|today|workout today|what do I do)\b/i,
  ],
  motivation: [
    /\b(tired|exhausted|struggling|unmotivated|don't feel like|need motivation|can't be bothered)\b/i,
  ],
  chat: [],
};

export function classifyIntent(message: string): IntentResult {
  let bestIntent: MessageIntent = 'chat';
  let bestConfidence = 0;
  const matchedKeywords: string[] = [];

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [
    MessageIntent,
    RegExp[],
  ][]) {
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const confidence = 0.8;
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestIntent = intent;
          matchedKeywords.push(match[0]);
        }
      }
    }
  }

  if (bestConfidence === 0) {
    bestConfidence = 0.3;
  }

  return {
    intent: bestIntent,
    confidence: bestConfidence,
    keywords_matched: matchedKeywords,
  };
}

// ---------------------------------------------------------------------------
// Extract structured data from messages
// ---------------------------------------------------------------------------

export function extractUpdates(
  message: string,
  intent: IntentResult
): ExtractedUpdate[] {
  const updates: ExtractedUpdate[] = [];

  switch (intent.intent) {
    case 'meal_log': {
      // Try to extract calorie info
      const calMatch = message.match(/(\d{2,4})\s*(?:cal|kcal|calories)/i);
      const proteinMatch = message.match(/(\d{1,3})\s*g?\s*protein/i);

      updates.push({
        type: 'nutrition_log',
        data: {
          items: message,
          calories: calMatch ? parseInt(calMatch[1]) : null,
          protein_g: proteinMatch ? parseInt(proteinMatch[1]) : null,
        },
        confidence: calMatch || proteinMatch ? 0.7 : 0.5,
      });
      break;
    }

    case 'workout_log': {
      const rpeMatch = message.match(/(?:rpe|intensity)\s*(\d{1,2})/i);
      const durationMatch = message.match(/(\d{1,3})\s*(?:min|minutes)/i);

      // Try to detect workout type
      let workoutType = 'general';
      if (/bench|press|push/i.test(message)) workoutType = 'push';
      else if (/pull|row|back/i.test(message)) workoutType = 'pull';
      else if (/squat|leg|lunge/i.test(message)) workoutType = 'legs';
      else if (/run|ran|cardio|cycling/i.test(message)) workoutType = 'cardio';

      updates.push({
        type: 'workout_log',
        data: {
          workout_type: workoutType,
          rpe: rpeMatch ? parseInt(rpeMatch[1]) : null,
          duration_minutes: durationMatch ? parseInt(durationMatch[1]) : null,
        },
        confidence: 0.6,
      });
      break;
    }

    case 'symptom_log': {
      const severityMatch = message.match(/(\d{1,2})\s*(?:\/\s*10|out of 10)/i);

      // Try to detect location
      const locations = [
        'shoulder', 'knee', 'back', 'lower back', 'hip', 'ankle',
        'wrist', 'elbow', 'neck', 'hamstring', 'quad', 'calf',
      ];
      const detectedLocation =
        locations.find((loc) =>
          message.toLowerCase().includes(loc)
        ) ?? 'unspecified';

      updates.push({
        type: 'symptom_log',
        data: {
          pain_location: detectedLocation,
          severity: severityMatch ? parseInt(severityMatch[1]) : 5,
          notes: message,
        },
        confidence: 0.6,
      });
      break;
    }

    case 'goal_update': {
      let goal = 'general_health';
      if (/lose weight|cut|lean|fat loss/i.test(message)) goal = 'fat_loss';
      else if (/gain muscle|bulk|build muscle|mass/i.test(message))
        goal = 'muscle_gain';
      else if (/endurance|stamina|cardio/i.test(message)) goal = 'endurance';
      else if (/maintain/i.test(message)) goal = 'maintenance';

      updates.push({
        type: 'goal_update',
        data: { primary_goal: goal },
        confidence: 0.7,
      });
      break;
    }
  }

  return updates;
}

// ---------------------------------------------------------------------------
// Build coach response
// ---------------------------------------------------------------------------

export function buildCoachResponse(
  message: string,
  intent: IntentResult,
  updates: ExtractedUpdate[]
): CoachResponse {
  const actions: string[] = [];
  let responseText = '';
  let followUp: string | undefined;

  switch (intent.intent) {
    case 'meal_log':
      responseText = "Got it! I've logged your meal.";
      actions.push('Created nutrition log entry');
      if (!updates[0]?.data.calories) {
        followUp =
          'Could you estimate the calories? That helps me fine-tune your targets.';
      }
      break;

    case 'workout_log':
      responseText = 'Nice work! Training session logged.';
      actions.push('Created workout log entry');
      if (!updates[0]?.data.rpe) {
        followUp =
          'How hard was it on a scale of 1-10 (RPE)? This helps me adjust tomorrow\'s plan.';
      }
      break;

    case 'symptom_log':
      responseText =
        "I've noted that. I'll factor this into your plan so we don't aggravate it.";
      actions.push('Created symptom log entry');
      followUp = 'Has this been getting better or worse over the past few days?';
      break;

    case 'schedule_update':
      responseText =
        "Schedule noted. I'll adjust your plan accordingly.";
      break;

    case 'goal_update':
      responseText =
        "Goal updated! I'll recalibrate your training and nutrition targets.";
      actions.push('Updated user goal');
      break;

    case 'plan_question':
      responseText =
        'Head to the "Today" tab for your full personalized plan! It updates based on your latest metrics and recent activity.';
      break;

    case 'motivation':
      responseText = getMotivationalResponse();
      break;

    default:
      responseText =
        "I hear you! I'm here to help with logging meals, workouts, symptoms, or answering questions about your plan. What would you like to do?";
  }

  return {
    message: responseText,
    actions,
    follow_up: followUp,
    updates,
  };
}

function getMotivationalResponse(): string {
  const responses = [
    "Everyone has tough days — showing up matters more than being perfect. Even a 15-minute walk counts. You've got this!",
    "Remember why you started. Progress isn't always linear, but consistency is what separates people who reach their goals from those who don't.",
    "Your body needs rest days too. If you're truly exhausted, a recovery day IS part of the plan. Listen to your body.",
    "Think about how far you've come already. One off day doesn't erase your progress. Tomorrow is a fresh start.",
    "Sometimes the hardest part is just starting. Commit to 10 minutes — you'll often find you want to keep going.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
