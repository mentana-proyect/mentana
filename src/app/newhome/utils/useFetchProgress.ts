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

  // 🔹 Fetch inicial y carga de progreso
  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          if (isMounted) setCategories(initialData);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("quiz_responses")
          .select("quiz_id, score, interpretation, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false });

        if (fetchError) throw new Error(fetchError.message);

        const responseData = (data ?? []) as QuizResponse[];

        // 🔹 Diccionario para acceso rápido
        const responseDict: Record<string, QuizResponse> = {};
        responseData.forEach(r => { responseDict[r.quiz_id] = r; });

        // 🔹 Mapear categorías
        const updatedCategories = initialData.map(cat => {
          const latest = responseDict[cat.quiz.id];
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

        // 🔹 Crear resultados
        const latestResults: Record<string, QuizResult> = {};
        responseData.forEach(r => {
          if (r.score !== null && r.interpretation)
            latestResults[r.quiz_id] = {
              score: r.score,
              interpretation: r.interpretation,
            };
        });

        // 🔹 Cargar timers
        const loadedTimers = initialData.reduce((acc, cat) => {
          const stored = localStorage.getItem(`quiz_timer_${cat.quiz.id}`);
          acc[cat.quiz.id] = stored ? parseInt(stored, 10) : 0;
          return acc;
        }, {} as Record<string, number>);

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
    return () => { isMounted = false; };
  }, [initialData]);

  // 🔹 Temporizadores automáticos
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next: Record<string, number> = {};
        Object.keys(prev).forEach(quizId => {
          const newTime = prev[quizId] + 1;
          localStorage.setItem(`quiz_timer_${quizId}`, newTime.toString());
          next[quizId] = newTime;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 Reset de timer
  const resetTimer = (quizId: string) => {
    setTimers(prev => {
      localStorage.removeItem(`quiz_timer_${quizId}`);
      return { ...prev, [quizId]: 0 };
    });
  };

  // 🔹 Persistencia automática de resultados en Supabase
  useEffect(() => {
    const saveResults = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      for (const [quiz_id, result] of Object.entries(results)) {
        await supabase.from("quiz_responses").upsert({
          user_id: user.id,
          quiz_id,
          score: result.score,
          interpretation: result.interpretation,
          completed_at: new Date().toISOString(),
        });
      }
    };
    if (Object.keys(results).length > 0) saveResults();
  }, [results]);

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
