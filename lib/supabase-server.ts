import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = serviceRoleKey ?? anonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration for server access");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
