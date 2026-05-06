import { createClient } from "@supabase/supabase-js";

// External Supabase connection for Rastreamento_Macaé data
const SUPABASE_URL = "https://ehlpmukjdknnyhkycncb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobHBtdWtqZGtubnloa3ljbmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzQwOTgsImV4cCI6MjA2MjU1MDA5OH0.y3NYzn7hQbuYZ2ZsUm4YGe-dh4GjlFKpTpKyIgrby-E";

export const supabaseExternal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
