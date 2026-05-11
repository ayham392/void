import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables, fallback to your provided anon key config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://javrfgkmkqhcwmsarade.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HBRnpcV3iuY5w6iICCeEjA_RKuHFNUo';

export const supabase = createClient(supabaseUrl, supabaseKey);
