import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const clean = query.trim().toUpperCase();
  const numericId = isNaN(Number(clean)) ? 0 : Number(clean);

  const { data: certificate, error } = await supabase
    .from('certificates')
    .select('*')
    .or(`certificate_id.ilike.${clean},user_id.eq.${numericId}`)
    .maybeSingle();

  if (error || !certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, certificate });
}