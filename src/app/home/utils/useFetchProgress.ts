"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";
import type { QuizResult } from "./useQuizHandlers";

interface QuizResponse {
  quiz_id: string;
  score: number | null;
  interpretation: string | null;
  completed_at: string | null;
}

export const useFetchProgress = (initialData: Category[]) => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);

        // 🔹 Esperar sesión primero (sin mostrar initialData)
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
          console.warn("No hay sesión activa de usuario");
          if (isMounted) {
            // ✅ Mostrar quizzes vacíos solo si realmente no hay usuario
            setCategories(initialData);
          }
          return;
        }

        // 🔹 Fetch de progreso desde Supabase
        const { data, error: fetchError } = await supabase
          .from("quiz_responses")
          .select("quiz_id, score, interpretation, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false });

        if (fetchError) throw new Error(fetchError.message);

        const responseData = (data ?? []) as QuizResponse[];

        // 🔹 Mapear progreso a categorías
        const updatedCategories = initialData.map((cat) => {
          const latest = responseData.find((r) => r.quiz_id === cat.quiz.id);
          return {
            ...cat,
            quiz: {
              ...cat.quiz,
              completed: !!latest?.completed_at,
              unlocked: true,
              completedAt: latest?.completed_at ?? null,
            },
          };
        });

        // 🔹 Crear diccionario de resultados
        const latestResults: Record<string, QuizResult> = {};
        responseData.forEach((r) => {
          if (r.score !== null && r.interpretation) {
            latestResults[r.quiz_id] = {
              score: r.score,
              interpretation: r.interpretation,
            };
          }
        });

        // 🔹 Cargar timers desde localStorage
        const loadedTimers: Record<string, number> = {};
        initialData.forEach((cat) => {
          const stored = localStorage.getItem(`quiz_timer_${cat.quiz.id}`);
          loadedTimers[cat.quiz.id] = stored ? parseInt(stored, 10) : 0;
        });

        // 🔹 Guardar en estado solo cuando todo esté listo
        if (isMounted) {
          setCategories(updatedCategories);
          setResults(latestResults);
          setTimers(loadedTimers);
        }
      } catch (err) {
        console.error("Error al obtener progreso:", err);
        if (isMounted) setError("No se pudo cargar el progreso del usuario.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  // 🕒 Actualización de temporizadores cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next: Record<string, number> = {};
        Object.keys(prev).forEach((quizId) => {
          const newTime = prev[quizId] + 1;
          next[quizId] = newTime;
          localStorage.setItem(`quiz_timer_${quizId}`, newTime.toString());
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🧹 Reiniciar temporizador
  const resetTimer = (quizId: string) => {
    setTimers((prev) => {
      const newTimers = { ...prev, [quizId]: 0 };
      localStorage.removeItem(`quiz_timer_${quizId}`);
      return newTimers;
    });
  };

  return {
    categories,
    setCategories,
    results,
    setResults,
    loading,
    error,
    timers,
    resetTimer,
  };
};
