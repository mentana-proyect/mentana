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
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // ==========================
  // Obtener sesión y cambios de auth
  // ==========================
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    };
    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // ==========================
  // Traducción de errores
  // ==========================
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
      case "no_email_provided":
        return "⚠️ Debes ingresar un correo electrónico.";
      case "no_phone_provided":
        return "⚠️ Debes ingresar un número de teléfono.";
      case "anonymous_sign_in_disabled":
        return "⚠️ El inicio de sesión anónimo está deshabilitado.";
      default:
        return "⚠️ " + msg;
    }
  };

  // ==========================
  // Manejo de submit (login / registro)
  // ==========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType(null);

    // ✅ Validaciones previas
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
      setMessage("⚠️ Debes aceptar los términos y condiciones para registrarte.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 🔹 Iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data?.user) {
          setMessage("✅ Inicio de sesión correcto.");
          setMessageType("success");
          setRedirecting(true);
          setTimeout(() => router.push("/home"), 1500);
        }
      } else {
        // 🔹 Verificar si el usuario ya existe
        const { error: checkError } = await supabase.auth.signInWithPassword({
          email,
          password: "contraseña_incorrecta_de_prueba",
        });

        // Si no hay error o el error indica credenciales inválidas, significa que ya existe
        if (!checkError || checkError.message.toLowerCase().includes("invalid login credentials")) {
          setMessage("⚠️ Este correo ya está registrado. Si olvidaste tu contraseña, puedes recuperarla desde la opción '¿Olvidaste tu contraseña?'.");
          setMessageType("error");
          setLoading(false);
          return;
        }

        // 🆕 Crear cuenta si el correo realmente no existe
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setMessage("✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
          setMessageType("success");
        } else {
          setMessage("⚠️ No se pudo completar el registro. Intenta nuevamente más tarde.");
          setMessageType("error");
        }
      }
    } catch (err: unknown) {
      const e = err as AuthError;
      setMessage(traducirError(e.code || "", e.message || "Error desconocido."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Redirigir si ya está logueado
  // ==========================
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
