"use client";
import { supabase } from "../../../lib/supabaseClient";
import type { Category } from "../../../components/useProgress";

export interface QuizResult {
  score: number;
  interpretation: string;
}

const QUIZ_LOCK_DAYS = 30;

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

    // 🕐 Calcular fechas
    const completedAt = new Date();
    const unlockDate = new Date(completedAt.getTime() + QUIZ_LOCK_DAYS * 86400000);

    // ✅ Actualizar categorías localmente
    const updated = [...categories];
    updated[activeIndex] = {
      ...activeQuiz,
      quiz: {
        ...activeQuiz.quiz,
        completed: true,
        completedAt: completedAt.toISOString(),
        unlocked: false, // Bloqueado hasta que pasen los 30 días
      },
    };
    setCategories(updated);

    // ✅ Guardar resultado localmente
    setResults(prev => ({
      ...prev,
      [activeQuiz.quiz.id]: { score, interpretation },
    }));

    // ✅ Guardar progreso en Supabase
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.from("quiz_progress").upsert(
        {
          user_id: user.id,
          quiz_id: activeQuiz.quiz.id,
          completed: true,
          completed_at: completedAt.toISOString(),
          unlock_date: unlockDate.toISOString(),
          score,
          interpretation,
        },
        { onConflict: "user_id,quiz_id" }
      );

      if (error) throw error;
    } catch (err: any) {
      console.error("❌ Error al guardar progreso:", err.message);
    }

    // ✅ Mostrar resultado y cerrar modal
    setModalMode("result");
    setTimeout(() => closeModal(), 2000);
  };

  return { handleQuizCompletion };
};
