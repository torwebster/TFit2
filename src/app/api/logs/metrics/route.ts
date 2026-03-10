import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('daily_metrics')
    .upsert(
      {
        user_id: user.id,
        date: body.date,
        sleep_score: body.sleep_score,
        sleep_hours: body.sleep_hours,
        hrv: body.hrv,
        steps: body.steps,
        weight_kg: body.weight_kg,
        body_battery: body.body_battery,
        subjective_energy: body.subjective_energy,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase
    .from('daily_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(7);

  if (date) {
    query = supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .limit(1);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
