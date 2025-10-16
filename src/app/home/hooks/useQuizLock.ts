import { useState, useEffect } from "react";
import { Category, Quiz } from "../../../components/useProgress";
import { addDays, daysBetween } from "./helpers";
import { QUIZ_UNLOCK_DAYS } from "./constants";

export const useQuizLock = (categories: Category[]) => {
  const [daysRemaining, setDaysRemaining] = useState<Record<string, number>>({});

  const getDaysRemaining = (quiz: Quiz) => {
    if (!quiz.completedAt) return 0;
    const unlockDate = addDays(new Date(quiz.completedAt), QUIZ_UNLOCK_DAYS);
    const now = new Date();
    const diff = unlockDate.getTime() - now.getTime();
    return diff > 0 ? daysBetween(now, unlockDate) : 0;
  };

  const isQuizUnlocked = (quiz: Quiz) => getDaysRemaining(quiz) === 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const updated: Record<string, number> = {};
      categories.forEach(cat => {
        if (cat.quiz.completed && !isQuizUnlocked(cat.quiz)) {
          updated[cat.quiz.id] = getDaysRemaining(cat.quiz);
        }
      });
      setDaysRemaining(updated);
    }, 60000);
    return () => clearInterval(interval);
  }, [categories]);

  return { daysRemaining, isQuizUnlocked };
};
