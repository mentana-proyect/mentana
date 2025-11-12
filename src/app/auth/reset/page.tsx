"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import styles from "./ResetPage.module.css";
import Footer from "../../../components/Footer";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ nuevo estado

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
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
    return <p className={styles.loadingText}>{message || "Cargando..."}</p>;

  return (
    <div className={styles.container}>
      <form onSubmit={handleReset} className={styles.form}>
        <svg
          id="Capa_4"
          data-name="Capa 4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 1200"
          width={150}
          height={150}
        >
          <path
            fill="#79e7d3"
            d="M695.33,448.57c-2.76-6.23-6.52-11.02-11.31-14.35..."
          />
          <path
            fill="#ff8cd3"
            d="M1098.2,506.41c-.27-2.52-.59-4.78-.99-6.9..."
          />
          <circle fill="#ff8cd3" cx="454.93" cy="625.36" r="37.24" />
          <circle fill="#ff8cd3" cx="596.8" cy="625.41" r="37.24" />
        </svg>

        <h2 className={styles.title}>Restablecer contraseña</h2>
        <p className={styles.description}>
          Ingresa tu nueva contraseña y serás redirigido a tu PEP.
        </p>

        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={styles.eyeButton}
            aria-label="Mostrar u ocultar contraseña"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="white"
                viewBox="0 0 30 18"
              >
                <path d="M12 5c7.633 0 12 7 12 7s-4.367 7-12 7-12-7-12-7 4.367-7 12-7zm0 
                          12c2.761 0 5-2.239 5-5s-2.239-5-5-5c-2.761 
                          0-5 2.239-5 5s2.239 5 5 5z"/>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="white"
                viewBox="0 0 30 18"
              >
                <path d="M12 5c-7.633 0-12 7-12 7s4.367 7 12 7 12-7 12-7-4.367-7-12-7zm0 12c-2.761 
                          0-5-2.239-5-5s2.239-5 5-5c2.761 0 5 2.239 
                          5 5s-2.239 5-5 5zm0-8c-1.657 0-3 
                          1.343-3 3s1.343 3 3 3 3-1.343 
                          3-3-1.343-3-3-3z"/>
              </svg>
            )}
          </button>
        </div>

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
        )}

        <Footer />
      </form>
    </div>
  );
}
