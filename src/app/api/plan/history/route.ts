import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: plans, error } = await supabase
    .from('plans')
    .select('id, date, confidence, rationale, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(7);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans });
}
