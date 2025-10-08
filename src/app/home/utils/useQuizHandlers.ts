"use client";
import { supabase } from "../../../lib/supabaseClient";
import { Category } from "../../../components/useProgress";

export const useQuizHandlers = (
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setResults: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  closeModal: () => void
) => {
  const handleQuizCompletion = async (
    activeIndex: number | null,
    activeQuiz: Category | null,
    score: number,
    interpretation: string,
    setShowConfetti: (v: boolean) => void,
    setModalMode: (v: "quiz" | "result") => void
  ) => {
    setShowConfetti(true);
    if (activeIndex === null || !activeQuiz) return;

    const updated = [...categories];
    updated[activeIndex] = {
      ...activeQuiz,
      quiz: { ...activeQuiz.quiz, completed: true, unlocked: true },
    };

    setCategories(updated);
    setResults((prev) => ({ ...prev, [activeQuiz.quiz.id]: { score, interpretation } }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_progress").upsert({
        quiz_id: activeQuiz.quiz.id,
        completed: true,
        unlocked: true,
        score,
        interpretation,
        user_id: user.id,
      });
    }

    setModalMode("result");
    setTimeout(() => closeModal(), 2000);
  };

  return { handleQuizCompletion };
};
