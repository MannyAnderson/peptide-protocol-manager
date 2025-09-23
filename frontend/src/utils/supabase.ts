// Frontend Supabase client: safe to use with the public anon key.
import { createClient } from "@supabase/supabase-js";

// Configure these in your Expo app config (.env or app.json/app.config.js)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


