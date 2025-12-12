import { useState } from "react";
import { Category } from "../../../components/useProgress";

export type HandleQuizCompletion = (
  index: number,
  quiz: Category,
  score: number,
  interpretation: string
) => void;

export interface UseQuizManagerReturn {
  activeQuiz: Category | null;
  activeIndex: number | null;
  handleQuizCompletion: HandleQuizCompletion;
  showConfetti: boolean;
  openQuizModal: (quiz: Category, index: number) => void;
}

export const useQuizManager = (
  categories: Category[],
  setCategories: (cats: Category[]) => void,
  results: Record<string, any>,
  setResults: (res: Record<string, any>) => void,
  baseHandleQuizCompletion: any,
  setActiveModal: (
    mode: "quiz" | "resultado" | "recomendacion" | null
  ) => void
): UseQuizManagerReturn => {
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleQuizCompletion: HandleQuizCompletion = async (
    index,
    quiz,
    score,
    interpretation
  ) => {
    await baseHandleQuizCompletion(
      index,
      quiz,
      score,
      interpretation,
      () => setShowConfetti(true),
      () => setActiveModal("resultado")
    );

    setTimeout(() => setShowConfetti(false), 3000);
  };

  const openQuizModal = (quiz: Category, index: number) => {
    setActiveQuiz(quiz);
    setActiveIndex(index);
    setActiveModal("quiz");
  };

  return {
    activeQuiz,
    activeIndex,
    handleQuizCompletion,
    showConfetti,
    openQuizModal,
  };
};
