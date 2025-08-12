import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase env değişkenleri eksik: VITE_SUPABASE_URL veya VITE_SUPABASE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
