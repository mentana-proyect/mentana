"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js"; // ✅ Importamos el tipo

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password) {
      setMessage("⚠️ Ingresa una nueva contraseña.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Aquí solo usamos updateUser({ password })
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("✅ Contraseña restablecida correctamente.");
      setTimeout(() => router.push("/auth"), 1500);
    } catch (err) {
      const e = err as AuthError; // ✅ Tipamos correctamente el error
      setMessage(e.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#112244", color: "#e5e7eb", padding: "20px" }}>
      <form onSubmit={handleReset} style={{ background: "#1f2a44", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", color: "#56dbc4" }}>Restablecer contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", margin: "12px 0", borderRadius: "8px", border: "1px solid #374151", background: "#1f2a44", color: "#e5e7eb" }}
          disabled={loading}
        />
        <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#0ea5a4", color: "#fff", fontWeight: 600, marginTop: "12px" }} disabled={loading}>
          {loading ? "Restableciendo..." : "Restablecer"}
        </button>
        {message && (
          <p style={{ marginTop: "12px", color: message.includes("✅") ? "#10b981" : "#f87171" }}>{message}</p>
        )}
      </form>
    </div>
  );
}
