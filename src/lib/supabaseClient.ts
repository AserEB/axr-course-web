import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlkylgaspnlzleuyygaz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsa3lsZ2FzcG5semxldXl5Z2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Mzg4MTUsImV4cCI6MjA5NDQxNDgxNX0.YPWLE3kKPvpNzMER5kvxVRziLEk-aXLNV4RVb6f72ug';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);