"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";
import type { QuizResult } from "./useQuizHandlers";

interface QuizProgress {
  quiz_id: string;
  completed: boolean;
  unlocked: boolean;
  score: number | null;
  interpretation: string | null;
}

export const useFetchProgress = (initialData: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);

        const user = userData?.user;
        if (!user) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("quiz_progress")
          .select("quiz_id, completed, unlocked, score, interpretation")
          .eq("user_id", user.id);

        if (fetchError) throw new Error(fetchError.message);

        const progressData = (data ?? []) as QuizProgress[];

        // 🔄 Actualiza categorías según el progreso obtenido
        const updatedCategories = initialData.map((cat) => {
          const progress = progressData.find((p) => p.quiz_id === cat.quiz.id);
          return {
            ...cat,
            quiz: {
              ...cat.quiz,
              completed: progress?.completed ?? cat.quiz.completed,
              unlocked: true, // desbloquear quiz al cargar
            },
          };
        });

        // 🧮 Crea resultados guardados
        const savedResults: Record<string, QuizResult> = {};
        progressData.forEach((p) => {
          if (p.score !== null && p.interpretation)
            savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
        });

        if (isMounted) {
          setCategories(updatedCategories);
          setResults(savedResults);
        }
      } catch (err) {
        console.error("Error al obtener progreso:", err);
        if (isMounted) setError("No se pudo cargar el progreso del usuario.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgress();

    // Cleanup para evitar memory leaks si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  return { categories, setCategories, results, setResults, loading, error };
};
