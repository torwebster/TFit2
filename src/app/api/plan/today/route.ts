import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { todayISO } from '@/lib/utils';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', todayISO())
    .single();

  if (!plan) {
    return NextResponse.json({ plan: null });
  }

  return NextResponse.json({ plan: plan.plan_json, meta: { id: plan.id, confidence: plan.confidence, rationale: plan.rationale } });
}
