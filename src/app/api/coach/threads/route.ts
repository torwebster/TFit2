import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('thread_id');

  if (threadId) {
    // Get messages for a specific thread
    const { data: messages, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ messages });
  }

  // List threads
  const { data: threads, error } = await supabase
    .from('conversation_threads')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ threads });
}
