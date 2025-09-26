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

/**
 * Decode la URL en caso de que Render haya bloqueado caracteres especiales
 */
const decodedUrl = decodeURIComponent(supabaseUrl);

/**
 * Cliente Supabase listo para usar en Client Components
 */
export const supabase = createClient(decodedUrl, supabaseAnonKey);
