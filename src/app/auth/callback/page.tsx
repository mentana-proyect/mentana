"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.push("/auth");
        return;
      }

      // 🚀 Después de validar correo → preferencias psicológicas
      router.push("/preferencias");
    };

    handleCallback();
  }, [router]);

  return null;
}
