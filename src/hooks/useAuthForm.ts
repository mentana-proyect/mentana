// hooks/useAuthForm.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface AuthError {
  code?: string;
  message?: string;
}

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // ===============================
  // Obtener sesión inicial
  // ===============================
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ===============================
  // Traducir errores de Supabase
  // ===============================
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
        return "⚠️ El correo ingresado no es válido.";
      case "email_not_confirmed":
        return "⚠️ Debes confirmar tu correo antes de iniciar sesión.";
      case "weak_password":
      case "password_length_invalid":
        return "⚠️ La contraseña es demasiado débil (mínimo 6 caracteres).";
      default:
        return "⚠️ " + msg;
    }
  };

  // ===============================
  // Verificar si existe el usuario
  // Sin redes sociales (solo email/password)
  // ===============================
  const verificarUsuarioExiste = async (email: string) => {
    const { data, error } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) return false;
    return !!data; // true si existe
  };

  // ===============================
  // Manejo del formulario
  // ===============================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setMessageType(null);

    // Validaciones
    if (!email.trim()) {
      setMessage("⚠️ Debes ingresar un correo electrónico.");
      setMessageType("error");
      return;
    }
    if (!password) {
      setMessage("⚠️ Debes ingresar una contraseña.");
      setMessageType("error");
      return;
    }
    if (!isLogin && !termsAccepted) {
      setMessage("⚠️ Debes aceptar los términos y condiciones.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // ================
      // LOGIN
      // ================
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          setMessage("✅ Inicio de sesión correcto.");
          setMessageType("success");

          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1200);
        }
      }

      // ================
      // REGISTRO
      // ================
      else {
        // Verificar si ya existe
        const existe = await verificarUsuarioExiste(email);

        if (existe) {
          setMessage(
            "⚠️ Ya existe una cuenta registrada con este correo. Puedes iniciar sesión o recuperar tu contraseña."
          );
          setMessageType("error");
          return;
        }

        // Crear usuario
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          setMessage(
            "✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta."
          );
          setMessageType("success");
        } else {
          setMessage("⚠️ No se pudo completar el registro.");
          setMessageType("error");
        }
      }
    } catch (err: unknown) {
      const e = err as AuthError;
      setMessage(traducirError(e.code || "", e.message || ""));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Redirección si ya está autenticado
  // ===============================
  useEffect(() => {
    if (user) router.push("/home");
  }, [user, router]);

  return {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    message,
    messageType,
    loading,
    redirecting,
    termsAccepted,
    setTermsAccepted,
    handleSubmit,
  };
};
