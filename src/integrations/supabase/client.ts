// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mzgtckvtrxnuhzpqzyyg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Z3Rja3Z0cnhudWh6cHF6eXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzA3MjgsImV4cCI6MjA2MTQwNjcyOH0.eSFj9HwRBKy2Wr6c4RQqNuryUmrGruIpOUBt337yLAc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);