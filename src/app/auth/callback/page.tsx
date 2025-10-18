"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Maneja el token de confirmación que llega en la URL
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
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
  }, [router]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      <h2>Confirmando tu cuenta...</h2>
      <p>Por favor espera un momento.</p>
    </div>
  );
}
