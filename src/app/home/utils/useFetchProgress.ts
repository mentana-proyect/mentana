"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";
import type { QuizResult } from "./useQuizHandlers";

interface QuizProgress {
  quiz_id: string;
  completed: boolean;
  unlocked: boolean;
  score: number | null;
  interpretation: string | null;
  completed_at: string | null;
}

export const useFetchProgress = (initialData: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);

        // ✅ Obtener sesión primero
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
          console.warn("No hay sesión activa de usuario");
          if (isMounted) setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("quiz_progress")
          .select("quiz_id, completed, completed_at, score, interpretation, unlocked")
          .eq("user_id", user.id);

        if (fetchError) throw new Error(fetchError.message);

        const progressData = (data ?? []) as QuizProgress[];

        // Actualizar categorías incluyendo completed_at
        const updatedCategories = initialData.map(cat => {
          const progress = progressData.find(p => p.quiz_id === cat.quiz.id);
          return {
            ...cat,
            quiz: {
              ...cat.quiz,
              completed: progress?.completed ?? cat.quiz.completed,
              unlocked: true,
              completedAt: progress?.completed_at ?? null,
            },
          };
        });

        // Guardar resultados
        const savedResults: Record<string, QuizResult> = {};
        progressData.forEach(p => {
          if (p.score !== null && p.interpretation)
            savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
        });

        // Cargar timers desde localStorage
        const loadedTimers: Record<string, number> = {};
        initialData.forEach(cat => {
          const stored = localStorage.getItem(`quiz_timer_${cat.quiz.id}`);
          loadedTimers[cat.quiz.id] = stored ? parseInt(stored, 10) : 0;
        });

        if (isMounted) {
          setCategories(updatedCategories);
          setResults(savedResults);
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

  // Actualización de temporizadores (cada 1 segundo)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next: Record<string, number> = {};
        Object.keys(prev).forEach(quizId => {
          const newTime = prev[quizId] + 1;
          next[quizId] = newTime;
          localStorage.setItem(`quiz_timer_${quizId}`, newTime.toString());
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const resetTimer = (quizId: string) => {
    setTimers(prev => {
      const newTimers = { ...prev, [quizId]: 0 };
      localStorage.removeItem(`quiz_timer_${quizId}`);
      return newTimers;
    });
  };

  return { categories, setCategories, results, setResults, loading, error, timers, resetTimer };
};
