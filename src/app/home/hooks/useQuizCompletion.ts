import { Category } from "../../../components/useProgress";

export const useQuizCompletion = (
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setResults: React.Dispatch<React.SetStateAction<Record<string, { score: number; interpretation: string }>>>,
  setShowConfetti: (v: boolean) => void,
  setModalMode: (v: "quiz" | "result") => void
) => {
  const handleQuizCompletion = (
    index: number | null,
    quiz: Category | null,
    score: number,
    interpretation: string
  ) => {
    if (index === null || !quiz) return;

    const updated = [...categories];
    updated[index].quiz.completed = true;
    updated[index].quiz.completedAt = new Date().toISOString();
    setCategories(updated);

    setResults(prev => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    setShowConfetti(true);
    setModalMode("result");
  };

  return handleQuizCompletion;
};
