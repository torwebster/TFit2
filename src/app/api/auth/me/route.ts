import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name ?? user.email,
    picture: user.user_metadata?.avatar_url,
    profile,
  });
}
