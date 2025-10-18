
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";
import type { QuizResult } from "./useQuizHandlers";

interface QuizProgress {
  quiz_id: string;
  completed: boolean;
  score: number | null;
  interpretation: string | null;
  completed_at: string | null;
  unlock_date: string | null; // 👈 nuevo campo (calculado o guardado en Supabase)
}

const QUIZ_LOCK_DAYS = 30;

export const useFetchProgress = (initialData: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);

        // ✅ Obtener usuario actual
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);

        const user = userData?.user;
        if (!user) return;

        // ✅ Consultar progreso del usuario
        const { data, error: fetchError } = await supabase
          .from("quiz_progress")
          .select("quiz_id, completed, completed_at, unlock_date, score, interpretation")
          .eq("user_id", user.id);

        if (fetchError) throw new Error(fetchError.message);

        const progressData = (data ?? []) as QuizProgress[];

        // ✅ Calcular días restantes y actualizar categorías
        const now = new Date();
        const updatedCategories = initialData.map(cat => {
          const progress = progressData.find(p => p.quiz_id === cat.quiz.id);

          if (!progress) return cat;

          let remainingDays = 0;
          if (progress.completed_at) {
            const unlockDate = progress.unlock_date
              ? new Date(progress.unlock_date)
              : new Date(new Date(progress.completed_at).getTime() + QUIZ_LOCK_DAYS * 86400000);

            const diff = unlockDate.getTime() - now.getTime();
            remainingDays = diff > 0 ? Math.ceil(diff / 86400000) : 0;
          }

          return {
            ...cat,
            quiz: {
              ...cat.quiz,
              completed: progress.completed ?? false,
              completedAt: progress.completed_at ?? null,
              unlocked: remainingDays === 0, // 🔓 solo si han pasado los 30 días
            },
          };
        });

        // ✅ Guardar resultados
        const savedResults: Record<string, QuizResult> = {};
        progressData.forEach(p => {
          if (p.score !== null && p.interpretation)
            savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
        });

        // ✅ Guardar días restantes
        const daysMap: Record<string, number> = {};
        progressData.forEach(p => {
          if (p.completed_at) {
            const unlockDate = p.unlock_date
              ? new Date(p.unlock_date)
              : new Date(new Date(p.completed_at).getTime() + QUIZ_LOCK_DAYS * 86400000);
            const diff = unlockDate.getTime() - now.getTime();
            daysMap[p.quiz_id] = diff > 0 ? Math.ceil(diff / 86400000) : 0;
          }
        });

        if (isMounted) {
          setCategories(updatedCategories);
          setResults(savedResults);
          setDaysRemaining(daysMap);
        }
      } catch (err) {
        console.error("❌ Error al obtener progreso:", err);
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

  // 🕐 Actualiza cada día (por si el usuario deja abierta la app)
  useEffect(() => {
    const interval = setInterval(() => {
      setDaysRemaining(prev => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach(quizId => {
          updated[quizId] = prev[quizId] > 0 ? prev[quizId] - 1 : 0;
        });
        return updated;
      });
    }, 86400000); // cada 24h
    return () => clearInterval(interval);
  }, []);

  return {
    categories,
    setCategories,
    results,
    setResults,
    loading,
    error,
    daysRemaining,
  };
};
