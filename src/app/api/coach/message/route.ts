import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { classifyIntent, extractUpdates, buildCoachResponse } from '@/lib/engines/coach';

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message, thread_id } = await request.json();
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Get or create thread
  let threadId = thread_id;
  if (!threadId) {
    const { data: thread, error } = await supabase
      .from('conversation_threads')
      .insert({ user_id: user.id, channel: 'web' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    threadId = thread.id;
  }

  // Save user message
  await supabase.from('coach_messages').insert({
    thread_id: threadId,
    user_id: user.id,
    role: 'user',
    content: message,
  });

  // Process with coach engine
  const intent = classifyIntent(message);
  const updates = extractUpdates(message, intent);
  const response = buildCoachResponse(message, intent, updates);

  // Apply extracted updates to database
  for (const update of updates) {
    switch (update.type) {
      case 'nutrition_log':
        await supabase.from('nutrition_logs').insert({
          user_id: user.id,
          items: String(update.data.items ?? message),
          calories: update.data.calories as number | null,
          protein_g: update.data.protein_g as number | null,
          source: 'coach',
        });
        break;
      case 'workout_log':
        await supabase.from('workout_logs').insert({
          user_id: user.id,
          workout_type: String(update.data.workout_type ?? 'general'),
          rpe: update.data.rpe as number | null,
          duration_minutes: update.data.duration_minutes as number | null,
          source: 'coach',
        });
        break;
      case 'symptom_log':
        await supabase.from('symptom_logs').insert({
          user_id: user.id,
          pain_location: String(update.data.pain_location ?? 'unspecified'),
          severity: (update.data.severity as number) ?? 5,
          notes: String(update.data.notes ?? message),
          source: 'coach',
        });
        break;
      case 'goal_update':
        await supabase
          .from('profiles')
          .update({ primary_goal: String(update.data.primary_goal) })
          .eq('id', user.id);
        break;
    }
  }

  // Build full response text
  let fullResponse = response.message;
  if (response.follow_up) {
    fullResponse += `\n\n${response.follow_up}`;
  }

  // Save assistant message
  await supabase.from('coach_messages').insert({
    thread_id: threadId,
    user_id: user.id,
    role: 'assistant',
    content: fullResponse,
    metadata: { intent: intent.intent, confidence: intent.confidence, actions: response.actions },
  });

  return NextResponse.json({
    thread_id: threadId,
    response: fullResponse,
    intent: intent.intent,
    actions: response.actions,
  });
}
