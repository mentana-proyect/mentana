"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import styles from "./ResetPage.module.css";
import Footer from "../../../components/Footer";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false); // ✅ Espera hasta tener token

  useEffect(() => {
    // 🔹 Captura el hash de la URL
    const hash = window.location.hash.substring(1); // quitar '#'
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      // 🔹 Establece la sesión temporal
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => setReady(true))
        .catch((err: AuthError) => {
          setMessage(err.message || "Ocurrió un error al iniciar sesión temporal.");
        });
    } else {
      setMessage("⚠️ Enlace inválido o expirado.");
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password) {
      setMessage("⚠️ Ingresa una nueva contraseña.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("✅ Contraseña restablecida correctamente.");
      setTimeout(() => router.push("/home"), 1500);
    } catch (err) {
      const e = err as AuthError;
      setMessage(e.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready)
    return (
      <p className={styles.loadingText}>
        {message || "Cargando..."}
      </p>
    );

  return (
    <div className={styles.container}>
      
      <form onSubmit={handleReset} className={styles.form}>
        <Image
  src="/logo.png"
  alt="Logo Mentana"
  width={150}      // ajusta según tu diseño
  height={150}
  className={styles.logoContainer}
/>
        <h2 className={styles.title}>Restablecer contraseña</h2>
        <p className={styles.description}>
          Ingresa tu nueva contraseña y seras redirigido a tu PEP.
        </p>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={loading}  
        >
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </button>
        {message && (
          <p
            className={`${styles.message} ${
              message.includes("✅") ? styles.success : styles.error
            }`}
          >
            {message}
          </p>
        )}<Footer />
      </form>
    </div>
  );
}
