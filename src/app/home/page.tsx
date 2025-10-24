"use client";
import React, { useState } from "react";
import "../../styles/home.css";
import { Category } from "../../components/useProgress";
import Modal from "../../components/modal";
import Confetti from "react-confetti";

import CuestionarioGAD7 from "./quizzes/quiz_ansiedad";
import CuestionarioPHQ9 from "./quizzes/quiz_depresion";
import CuestionarioPSS10 from "./quizzes/quiz_estres";
import CuestionarioUCLA from "./quizzes/quiz_soledad";

import { useLogout } from "./utils/useLogout";
import { useInactivityTimer } from "./utils/useInactivityTimer";
import { useAuthCheck } from "./utils/useAuthCheck";
import { useFetchProgress } from "./utils/useFetchProgress";
import { useQuizHandlers } from "./utils/useQuizHandlers";

import ProgressHeader from "../../components/ProgressHeader";
import QuizCard from "../../components/QuizCard";
import DockFooter from "../../components/DockFooter";
import ResultView from "../../components/ResultView";
import { initialData } from "../data/initialData";

const quizComponents: Record<
  "ansiedad1" | "depresion1" | "estres1" | "soledad1",
  React.FC<{ onResult?: (score: number, interpretation: string) => void }>
> = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

const Home: React.FC = () => {
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
  const [isRecomendacionOpen, setIsRecomendacionOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0); // 🔹 trigger para actualizar QuizCard

  const { handleQuizCompletion: originalHandleQuizCompletion } =
    useQuizHandlers(categories, setCategories, setResults, () =>
      setIsModalOpen(false)
    );

  const handleQuizCompletion = (
    index: number | null,
    quiz: Category | null,
    score: number,
    interpretation: string
  ) => {
    if (index === null || !quiz) return;

    const updatedCategories = [...categories];
    updatedCategories[index].quiz.completed = true;
    updatedCategories[index].quiz.completedAt = new Date().toISOString();
    setCategories(updatedCategories);

    setResults((prev) => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    setShowConfetti(true);
    setModalMode("result");

    // 🔹 Incrementamos refreshTrigger para forzar actualización de QuizCard
    setRefreshTrigger((prev) => prev + 1);

    originalHandleQuizCompletion(
      index,
      quiz,
      score,
      interpretation,
      setShowConfetti,
      setModalMode
    );
  };

  const openQuiz = (q: Category, i: number) => {
    setActiveQuiz(q);
    setActiveIndex(i);
    setModalMode("quiz");
    setIsModalOpen(true);
  };

  const completed = categories.filter((c) => c.quiz.completed).length;
  const total = categories.length;

  const QuizComponentToRender =
    activeQuiz && activeQuiz.quiz.id in quizComponents
      ? quizComponents[activeQuiz.quiz.id as keyof typeof quizComponents]
      : null;

  if (authLoading || loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );

  if (error)
    return (
      <div className="loading-container">
        <p>{error}</p>
      </div>
    );

  return (
    <div>
      <ProgressHeader completed={completed} total={total} />
      <main>
        {categories.map((cat, index) => (
          <QuizCard
            key={cat.name}
            cat={cat}
            index={index}
            refreshTrigger={refreshTrigger} // 🔹 pasamos trigger
            openModal={() => openQuiz(cat, index)}
            openResult={(q, i) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setModalMode("result");
              setIsModalOpen(true);
            }}
            openRecomendacion={(q, i) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setIsRecomendacionOpen(true);
            }}
          />
        ))}

        {!isModalOpen && !isRecomendacionOpen && <DockFooter logout={logout} />}
      </main>

      <Modal
        isOpen={isRecomendacionOpen}
        onClose={() => setIsRecomendacionOpen(false)}
      >
        <h2>Recomendación</h2>
        <p>Aquí puedes colocar cualquier recomendación o consejo de bienestar para el usuario.</p>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "quiz" && QuizComponentToRender && activeQuiz && (
          <QuizComponentToRender
            onResult={(score, interpretation) => {
              handleQuizCompletion(activeIndex, activeQuiz, score, interpretation);
            }}
          />
        )}
        {modalMode === "result" && activeQuiz && results[activeQuiz.quiz.id] && (
          <ResultView
            score={results[activeQuiz.quiz.id].score}
            interpretation={results[activeQuiz.quiz.id].interpretation}
          />
        )}
      </Modal>

      {showConfetti && typeof window !== "undefined" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
    </div>
  );
};

export default Home;
