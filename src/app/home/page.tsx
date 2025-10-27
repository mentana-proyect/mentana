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
import Recommendation from "../../components/Recommendation";
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { handleQuizCompletion: originalHandleQuizCompletion } =
    useQuizHandlers(
      categories ?? [],
      setCategories,
      setResults,
      () => setIsModalOpen(false)
    );

  const handleQuizCompletion = (
    index: number | null,
    quiz: Category | null,
    score: number,
    interpretation: string
  ) => {
    if (index === null || !quiz || !categories) return;

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

  // Control de carga: solo renderiza cuando categories no es null y no hay loading
  const isAppLoading = authLoading || loading || categories === null;

  if (isAppLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="spinner" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <p>{error}</p>
      </div>
    );
  }

  const completed = categories.filter((c) => c.quiz.completed).length;
  const total = categories.length;

  const QuizComponentToRender =
    activeQuiz && activeQuiz.quiz.id in quizComponents
      ? quizComponents[activeQuiz.quiz.id as keyof typeof quizComponents]
      : null;

  return (
    <div>
      <ProgressHeader />
      <main>
        {categories.map((cat, index) => (
          <QuizCard
            key={cat.name}
            cat={cat}
            index={index}
            refreshTrigger={refreshTrigger}
            openModal={() => openQuiz(cat, index)}
            openResult={(q, i, result) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setModalMode("result");
              setResults((prev) => ({
                ...prev,
                [q.quiz.id]: result,
              }));
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

      {/* Modal de recomendación */}
      <Modal
        isOpen={isRecomendacionOpen}
        onClose={() => setIsRecomendacionOpen(false)}
      >
        {activeQuiz && (
          <Recommendation
            quizId={activeQuiz.quiz.id} // 'ansiedad1', 'depresion1', etc.
            score={results[activeQuiz.quiz.id]?.score ?? 0} // si no hay score, usamos 0
          />
        )}
      </Modal>

      {/* Modal de cuestionarios / resultados */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "quiz" && QuizComponentToRender && activeQuiz && (
          <QuizComponentToRender
            onResult={(score, interpretation) =>
              handleQuizCompletion(activeIndex, activeQuiz, score, interpretation)
            }
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
