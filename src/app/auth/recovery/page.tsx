"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { AuthError } from "@supabase/supabase-js";
import styles from "./RecoveryPage.module.css"; // ✅ Importamos el CSS modular
import Footer from "../../../components/Footer";
import Image from "next/image";

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
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) throw error;

      setMessage("✅ Revisa tu correo para restablecer la contraseña.");
      setMessageType("success");
    } catch (err) {
      const e = err as AuthError;
      setMessage(e.message || "Ocurrió un error.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleRecovery} className={styles.form}>
        <Image
  src="/logo.png"
  alt="Logo Mentana"
  width={150}      // ajusta según tu diseño
  height={150}
  className={styles.logoContainer}
/>
        <h2 className={styles.title}>Recuperar contraseña</h2>
        <p className={styles.description}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          disabled={loading}
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        {message && (
          <p className={messageType === "success" ? styles.success : styles.error}>
            {message}
          </p>
        )}
        <Footer />
      </form>
      
    </div>
  );
}
