"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export const useLogout = () => {
  const router = useRouter();

  return async () => {
    try {
      const { error } = await supabase.auth.signOut();

      // Ignoramos el error si es "Auth session missing!"
      if (error && error.message !== "Auth session missing!") {
        console.error("Error al cerrar sesión:", error.message);
      }
    } catch (err) {
      console.error("Error inesperado al cerrar sesión:", err);
    } finally {
      // Siempre redirige al login
      router.replace("/auth");
    }
  };
};
