import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      primary_goal: body.primary_goal,
      experience_level: body.experience_level,
      age: body.age,
      weight_kg: body.weight_kg,
      height_cm: body.height_cm,
      injuries: body.injuries ?? [],
      available_equipment: body.available_equipment ?? [],
      available_days: body.available_days ?? [],
      minutes_per_session: body.minutes_per_session ?? 45,
      training_style: body.training_style,
      dietary_preferences: body.dietary_preferences ?? [],
      onboarding_completed: body.onboarding_completed ?? false,
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
