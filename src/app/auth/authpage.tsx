'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  // 🔹 Escuchar cambios de sesión
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Redirige si usuario logueado
 // useEffect(() => {
   // if (user) router.push("/home");
  //}, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("✅ Inicio de sesión correcto");
        setMessageType("success");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("✅ Registro exitoso");
        setMessageType("success");
      }
    } catch (err: any) {
      setMessage(err.message || "❌ Error desconocido");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageinicio">
      <div className="container">
        <h1>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            disabled={loading}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            minLength={6}
            value={password}
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Inicia Sesión" : "Regístrate"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
        </button>
        {message && <p className={messageType}>{message}</p>}
      </div>
    </div>
  );
}
