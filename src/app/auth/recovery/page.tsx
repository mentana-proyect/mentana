"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function RecoveryPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType(null);

    if (!email.trim()) {
      setMessage("⚠️ Ingresa tu correo electrónico.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`, // Página donde el usuario redefinirá su contraseña
      });

      if (error) throw error;

      setMessage("✅ Revisa tu correo para restablecer la contraseña.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message || "Ocurrió un error.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#112244", color: "#e5e7eb", padding: "20px" }}>
      <form onSubmit={handleRecovery} style={{ background: "#1f2a44", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", color: "#56dbc4" }}>Recuperar contraseña</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px", margin: "12px 0", borderRadius: "8px", border: "1px solid #374151", background: "#1f2a44", color: "#e5e7eb" }}
          disabled={loading}
        />

        <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#0ea5a4", color: "#fff", fontWeight: 600, marginTop: "12px" }} disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        {message && (
          <p style={{ marginTop: "12px", color: messageType === "success" ? "#10b981" : "#f87171" }}>{message}</p>
        )}
      </form>
    </div>
  );
}
