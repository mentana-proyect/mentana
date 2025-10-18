import { useState } from "react";
import { useLogout } from "../utils/useLogout";
import { useAuthCheck } from "../utils/useAuthCheck";
import { useInactivityTimer } from "../utils/useInactivityTimer";
import { useFetchProgress } from "../utils/useFetchProgress";
import { initialData } from "../../data/initialData";

import { Category } from "../../../components/useProgress";
import { useQuizLock } from "./useQuizLock";
import { useQuizCompletion } from "./useQuizCompletion";

export const useHomeLogic = () => {
  const logout = useLogout();
  const authLoading = useAuthCheck();
  useInactivityTimer(logout);

  const { categories, setCategories, results, setResults, loading, error } =
    useFetchProgress(initialData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalMode, setModalMode] = useState<"quiz" | "result">("quiz");

  const lockState = useQuizLock(categories);
  const handleQuizCompletion = useQuizCompletion(
    categories,
    setCategories,
    setResults,
    setShowConfetti,
    setModalMode
  );

  const modalState = {
    isModalOpen,
    modalMode,
    activeQuiz,
    activeIndex,
    showConfetti,
    setIsModalOpen,
  };

  const modalHandlers = {
    setActiveQuiz,
    setActiveIndex,
    setModalMode,
    setIsModalOpen,
  };

  const quizHandlers = { handleQuizCompletion };

  return {
    authLoading,
    loading,
    error,
    logout,
    categories,
    results,
    showConfetti,
    modalState,
    modalHandlers,
    quizHandlers,
    lockState,
  };
};