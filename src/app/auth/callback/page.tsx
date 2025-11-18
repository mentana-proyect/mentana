"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Detectamos el token correcto automáticamente
      const code =
        params.get("code") ||
        params.get("token_hash") ||
        params.get("token") ||
        params.get("access_token");

      if (!code) {
        console.error("No auth code found in URL");
        router.push("/auth");
        return;
      }

      // 2. Intercambiamos el código por la sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error al intercambiar código:", error);
        router.push("/auth");
        return;
      }

      // 3. Si existe sesión → éxito
      if (data.session) {
        router.push("/home");
        return;
      }

      router.push("/auth");
    };

    handleCallback();
  }, [params, router]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      <h2>Confirmando tu cuenta...</h2>
      <p>Por favor espera un momento.</p>
    </div>
  );
}
