"use client";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";

export interface QuizResult {
  score: number;
  interpretation: string;
}

export const useQuizHandlers = (
  categories: Category[] | null,
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>,
  setResults: React.Dispatch<React.SetStateAction<Record<string, QuizResult>>>
) => {
  const handleQuizCompletion = async (
    activeIndex: number,
    activeQuiz: Category,
    score: number,
    interpretation: string
  ): Promise<void> => {
    if (!categories) return;

    // ================================
    // 1) Actualizar categorías localmente
    // ================================
    const updated = [...categories];
    updated[activeIndex] = {
      ...activeQuiz,
      quiz: {
        ...activeQuiz.quiz,
        completed: true,
        unlocked: true,
        completedAt: new Date().toISOString(),
      },
    };

    setCategories(updated);

    // ================================
    // 2) Guardar resultado local
    // ================================
    setResults((prev) => ({
      ...prev,
      [activeQuiz.quiz.id]: { score, interpretation },
    }));

    // ================================
    // 3) Guardar progreso en Supabase
    // ================================
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      const { error } = await supabase.from("quiz_progress").upsert(
        [
          {
            user_id: user.id,
            quiz_id: activeQuiz.quiz.id,
            completed: true,
            unlocked: true,
            score,
            interpretation,
            last_completed_at: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id,quiz_id" }
      );

      if (error) console.error("Error al guardar progreso:", error.message);
    }
  };

  return { handleQuizCompletion };
};
