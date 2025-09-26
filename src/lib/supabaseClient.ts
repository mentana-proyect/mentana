// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Lee las variables de entorno y asegura que estén definidas.
 * Funciona tanto en desarrollo local como en producción (Render, Vercel, etc.)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "🚨 Las variables de entorno de Supabase no están definidas. " +
    "Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY configuradas."
  );
}

const decodedUrl = decodeURIComponent(supabaseUrl);
export const supabase = createClient(decodedUrl, supabaseAnonKey);
