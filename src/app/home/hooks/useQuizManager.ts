import { useState } from "react";
import { Category } from "../../../components/useProgress";

interface ResultsMap {
  [key: string]: {
    score: number;
    interpretation: string;
  };
}

type SetCategories = React.Dispatch<React.SetStateAction<Category[] | null>>;
type SetResults = React.Dispatch<React.SetStateAction<ResultsMap>>;

type BaseHandleQuizCompletion = (
  index: number,
  quiz: Category,
  score: number,
  interpretation: string,
  setShowConfetti: (v: boolean) => void,
  toggleModals: (mode: "quiz" | "result") => void
) => void;

interface UseQuizManagerReturn {
  activeQuiz: Category | null;
  activeIndex: number | null;
  setActiveQuiz: (quiz: Category | null) => void;
  setActiveIndex: (index: number | null) => void;
  showConfetti: boolean;
  handleQuizCompletion: (
    index: number,
    quiz: Category,
    score: number,
    interpretation: string
  ) => void;
}

export const useQuizManager = (
  categories: Category[] | null,
  setCategories: SetCategories,
  results: ResultsMap,
  setResults: SetResults,
  baseHandleQuizCompletion: BaseHandleQuizCompletion,
  setQuizModalOpen: (v: boolean) => void,
  setResultModalOpen: (v: boolean) => void
): UseQuizManagerReturn => {
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

    setCategories((prev) =>
      prev
        ? prev.map((cat, i) =>
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
        : prev
    );

    setResults((prev) => ({
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
      (mode) => {
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
