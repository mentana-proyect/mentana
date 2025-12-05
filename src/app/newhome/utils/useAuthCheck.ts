"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthCheck = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (!data?.user) {
          setUser(null);
          router.replace("/auth");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al verificar la sesión";

        // ⚠️ Caso: token JWT inválido o usuario inexistente
        if (message.includes("User from sub claim in JWT does not exist")) {
          console.warn("⚠️ Sesión inválida o expirada. Cerrando sesión silenciosamente...");
          await supabase.auth.signOut(); // 🧹 Limpia la sesión local
          setUser(null);
          setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
          router.replace("/auth");
          return; // ⬅️ Detenemos aquí, no mostramos error en consola
        }

        // 🔸 Otros errores de autenticación
        console.error("Error de autenticación:", message);
        setError(message);
        setUser(null);
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 🔄 Escucha cambios de autenticación (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        router.replace("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading, error };
};
