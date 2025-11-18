"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (!code) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error al intercambiar el código:", error.message);
        router.push("/auth");
        return;
      }

      if (data.session) {
        router.push("/home");
      } else {
        router.push("/auth");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return null; // ⬅️ Nada de UI, pasa directo
}
