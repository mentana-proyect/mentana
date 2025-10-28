"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js"; // ✅ Importamos el tipo correcto

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

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!user) {
          setUser(null);
          router.replace("/auth"); // 🔁 Redirige al login si no hay usuario
        } else {
          setUser(user);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al verificar la sesión";
        console.error("Error de autenticación:", message);
        setError(message);
        setUser(null);
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 🔄 Escucha cambios en el estado de autenticación (login/logout)
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
