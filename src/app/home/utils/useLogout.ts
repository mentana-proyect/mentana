"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export const useLogout = () => {
  const router = useRouter();
  return async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error al cerrar sesión:", error.message);
    else router.replace("/auth");
  };
};
