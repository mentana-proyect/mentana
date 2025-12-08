import { useState } from "react";
import { Category } from "../../../components/useProgress";

export const useQuizManager = (
  categories: Category[],
  setCategories: any,
  results: any,
  setResults: any,
  baseHandleQuizCompletion: any,
  setQuizModalOpen: any,
  setResultModalOpen: any
) => {
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleQuizCompletion = (
    index: number,
    quiz: Category,
    score: number,
    interpretation: string
  ) => {
    if (index == null) return;

    setCategories((prev: any) =>
      prev.map((cat: any, i: number) =>
        i === index
          ? {
              ...cat,
              quiz: {
                ...cat.quiz,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            }
          : cat
      )
    );

    setResults((prev: any) => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    setShowConfetti(true);
    setResultModalOpen(true);

    baseHandleQuizCompletion(
      index,
      quiz,
      score,
      interpretation,
      setShowConfetti,
      (mode: "quiz" | "result") => {
        setQuizModalOpen(mode === "quiz");
        setResultModalOpen(mode === "result");
      }
    );
  };

  return {
    activeQuiz,
    activeIndex,
    setActiveQuiz,
    setActiveIndex,
    showConfetti,
    handleQuizCompletion,
  };
};
