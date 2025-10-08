"use client";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import "../../styles/auth.css";
import type { User } from "@supabase/supabase-js";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // 🔹 Escuchar cambios de sesión
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    };
    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const traducirError = (code: string, msg: string) => {
    switch (code) {
      case "invalid_credentials":
      case "invalid_login_credentials":
        return "❌ Usuario o contraseña incorrectos.";
      case "user_not_found":
        return "❌ No existe una cuenta con este correo.";
      case "user_already_exists":
      case "email_exists":
        return "⚠️ Ya existe una cuenta registrada con este correo.";
      case "invalid_email":
        return "⚠️ El correo ingresado no tiene un formato válido.";
      case "email_not_confirmed":
        return "⚠️ Debes confirmar tu correo antes de iniciar sesión.";
      case "weak_password":
      case "password_length_invalid":
        return "⚠️ La contraseña es demasiado débil. Usa al menos 6 caracteres.";
      default:
        return "⚠️ " + msg;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!isLogin && !termsAccepted) {
      setMessage("⚠️ Debes aceptar los términos y condiciones para registrarte.");
      setMessageType("warning");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data?.user) {
          setMessage("✅ Inicio de sesión correcto");
          setMessageType("success");
          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data?.user) {
          setMessage("✅ Registro exitoso, revisa tu correo para confirmar.");
          setMessageType("success");
          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1500);
        }
      }
    } catch (err: unknown) {
      // 🔹 Tipado seguro del error
      const e = err as { code?: string; message?: string };
      const errorCode = e.code || "";
      const errorMsg = e.message || "Error desconocido.";
      setMessage(traducirError(errorCode, errorMsg));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Redirigir si ya hay usuario
  useEffect(() => {
    if (user) router.push("/home");
  }, [user, router]);

  return (
    <>
      <Head>
        <title>{isLogin ? "Iniciar Sesión" : "Registrarse"}</title>
      </Head>

      <div className="page">
        {!redirecting ? (
          <div className="container">
            <img src="logo.jpg" alt="Logo Mentana" className="logo-container" />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Correo electrónico"
                  required
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    aria-label="Contraseña"
                    required
                    minLength={6}
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {!isLogin ? (
                <div className="terms">
                  <label>
                    &nbsp;
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />{" "}
                    Acepto los{" "}
                    <Link href="/terminos" target="_blank">
                      Términos y Condiciones
                    </Link>
                  </label>
                </div>
              ) : (
                <div className="terms2">
                  <label>
                    <Link href="/reset-password" target="_blank">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </label>
                </div>
              )}

              <div className="button-row">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Cargando..." : isLogin ? "Inicia Sesión" : "Regístrate"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={loading}
                >
                  {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
                </button>
              </div>
            </form>

            {message && <p className={`message ${messageType}`}>{message}</p>}

            <p>
              <strong>&copy; 2025 Mentana 🧠</strong>
            </p>
          </div>
        ) : (
          <div className="loading-screen">
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
            <p className="message">{isLogin ? "Iniciando Sesión..." : "Registrando usuario..."}</p>
          </div>
        )}
      </div>
    </>
  );
}
