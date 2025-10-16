import { useState } from "react";

export type Quiz = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  completedAt?: string | null; 
};

export type Category = {
  name: string;
  quiz: Quiz;
};

export function useProgress(initialData: Category[]) {
  const [categories, setCategories] = useState<Category[]>(initialData);

  const completeQuiz = (categoryIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, i) => {
        if (i === categoryIndex) {
          return { ...cat, quiz: { ...cat.quiz, completed: true } };
        }
        if (i === categoryIndex + 1) {
          return { ...cat, quiz: { ...cat.quiz, unlocked: true } };
        }
        return cat;
      })
    );
  };

  const getProgress = () => {
    const total = categories.length;
    const completed = categories.filter((c) => c.quiz.completed).length;
    return { completed, total };
  };

  return { categories, completeQuiz, getProgress };
}
