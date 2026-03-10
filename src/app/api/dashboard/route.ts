import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { todayISO } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = todayISO();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch all data in parallel
  const [profileRes, metricsRes, todayPlanRes, workoutsRes, nutritionRes] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabase
        .from('plans')
        .select('plan_json, confidence')
        .eq('user_id', user.id)
        .eq('date', today)
        .single(),
      supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false }),
      supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgo.toISOString())
        .order('logged_at', { ascending: false }),
    ]);

  return NextResponse.json({
    profile: profileRes.data,
    metrics: metricsRes.data ?? [],
    today_plan: todayPlanRes.data?.plan_json ?? null,
    recent_workouts: workoutsRes.data ?? [],
    recent_nutrition: nutritionRes.data ?? [],
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      picture: user.user_metadata?.avatar_url,
    },
  });
}
