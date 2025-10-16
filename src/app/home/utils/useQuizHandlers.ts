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
    setShowConfetti: (value: boolean) => void,
    setModalMode: (mode: "quiz" | "result") => void
  ): Promise<void> => {
    setShowConfetti(true);
    if (activeIndex === null || !activeQuiz) return;

    // 🕐 Calcular fechas
    const completedAt = new Date();
    const unlockDate = new Date(completedAt.getTime() + QUIZ_LOCK_DAYS * 86400000);

    // ✅ Actualizar categorías localmente
    const updatedCategories = [...categories];
    updatedCategories[activeIndex] = {
      ...activeQuiz,
      quiz: {
        ...activeQuiz.quiz,
        completed: true,
        completedAt: completedAt.toISOString(),
        unlocked: false, // Bloqueado hasta que pase unlockDate
      },
    };
    setCategories(updatedCategories);

    // ✅ Guardar resultado localmente
    setResults(prev => ({
      ...prev,
      [activeQuiz.quiz.id]: { score, interpretation },
    }));

    // ✅ Guardar progreso en Supabase
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData?.user;
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.from("quiz_progress").upsert(
        {
          user_id: user.id,
          quiz_id: activeQuiz.quiz.id,
          completed: true,
          completed_at: completedAt.toISOString(),
          unlock_date: unlockDate.toISOString(),
          unlocked: false,
          score,
          interpretation,
        },
        { onConflict: "user_id,quiz_id" }
      );

      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error al guardar progreso:", err.message);
      } else {
        console.error("❌ Error inesperado:", err);
      }
    }

    // ✅ Mostrar resultado y cerrar modal
    setModalMode("result");
    setTimeout(() => closeModal(), 2000);
  };

  return { handleQuizCompletion };
};
