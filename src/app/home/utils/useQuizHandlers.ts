"use client";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";

export interface QuizResult {
  score: number;
  interpretation: string;
}

export const useQuizHandlers = (
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setResults: React.Dispatch<React.SetStateAction<Record<string, QuizResult>>>,
  closeModal: () => void
) => {
  const handleQuizCompletion = async (
    activeIndex: number | null,
    activeQuiz: Category | null,
    score: number,
    interpretation: string,
    setShowConfetti: (v: boolean) => void,
    setModalMode: (v: "quiz" | "result") => void
  ): Promise<void> => {
    setShowConfetti(true);
    if (activeIndex === null || !activeQuiz) return;

    // ✅ Actualizar lista local de categorías
    const updated = [...categories];
    updated[activeIndex] = {
      ...activeQuiz,
      quiz: { ...activeQuiz.quiz, completed: true, unlocked: true },
    };

    setCategories(updated);

    // ✅ Guardar resultado localmente
    setResults((prev) => ({
      ...prev,
      [activeQuiz.quiz.id]: { score, interpretation },
    }));

    // ✅ Guardar progreso en Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("quiz_progress").upsert({
        quiz_id: activeQuiz.quiz.id,
        completed: true,
        unlocked: true,
        score,
        interpretation,
        user_id: user.id,
      });

      if (error) console.error("Error al guardar progreso:", error.message);
    }

    // ✅ Mostrar resultado y cerrar modal
    setModalMode("result");
    setTimeout(() => closeModal(), 2000);
  };

  return { handleQuizCompletion };
};
