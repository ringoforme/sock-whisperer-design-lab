// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://obmwuieyrhqrgkmjftis.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibXd1aWV5cmhxcmdrbWpmdGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjM2MTcsImV4cCI6MjA2NTc5OTYxN30.zYe4uku7VUbSHnc6APywTa63jriGYhhe_hrOcRLSBA8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);