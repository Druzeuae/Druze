import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase environment variables are not set. Auth and data calls will fail until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in .env."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
