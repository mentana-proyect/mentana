"use client";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { User, AuthError } from "@supabase/supabase-js";
import "./general.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | ""
  >("");
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

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!isLogin && !termsAccepted) {
      setMessage(
        "⚠️ Debes aceptar los términos y condiciones para registrarte."
      );
      setMessageType("warning");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          setMessage("✅ Inicio de sesión correcto");
          setMessageType("success");
          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          setMessage(
            "✅ Registro exitoso, revisa tu correo para confirmar."
          );
          setMessageType("success");
          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1500);
        }
      }
    } catch (err: unknown) {
      let errorCode = "";
      let errorMsg = "Error desconocido.";

      if (err instanceof AuthError) {
        errorCode = err.name || "";
        errorMsg = err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setMessage(traducirError(errorCode, errorMsg));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Si hay usuario logueado, redirige a /home
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <title>{isLogin ? "Iniciar Sesión" : "Registrarse"}</title>
      </Head>

      <div className="pageinicio">
        {!redirecting ? (
          <div className="container">
            <Image
              src="/logo.jpg"
              alt="Logo Mentana"
              width={120}
              height={120}
              className="logo"
            />

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
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        fill="white"
                        viewBox="0 0 30 18"
                      >
                        <path d="M12 5c-7.633 0-12 7-12 7s4.367 7 12 7 12-7 12-7-4.367-7-12-7zm0 12c-2.761 0-5-2.239-5-5s-2.239-5-5-5c-2.761 0-5 2.239-5 5s2.239 5 5 5zm0-8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        fill="white"
                        viewBox="0 0 30 18"
                      >
                        <path d="M12 5c7.633 0 12 7 12 7s-4.367 7-12 7-12-7-12-7 4.367-7 12-7zm0 12c2.761 0 5-2.239 5-5s-2.239-5-5-5c-2.761 0-5 2.239-5 5s2.239 5 5 5z" />
                      </svg>
                    )}
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
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  {loading
                    ? "Cargando..."
                    : isLogin
                    ? "Inicia Sesión"
                    : "Regístrate"}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
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
            <p className="message">
              {isLogin ? "Iniciando Sesión..." : "Registrando usuario..."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
