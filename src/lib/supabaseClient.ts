import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjfroaccfbtpovivsrxr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZnJvYWNjZmJ0cG92aXZzcnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NDAxNTYsImV4cCI6MjEwNzQxNjE1Nn0.scaXJNlJGR7ggGHGv03zBdTnKiLR8JIzUW3rTxujVa0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);