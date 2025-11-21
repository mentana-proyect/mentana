"use client";
import React, { useState, useEffect } from "react";
import "../../styles/home.css";
import { Category } from "../../components/useProgress";
import Modal from "../../components/modal";
import Confetti from "react-confetti";
import Footer from "../../components/Footer";

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
  string,
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

  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ⏳ Overlay de carga de 5 segundos
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoadingOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const { handleQuizCompletion: originalHandleQuizCompletion } =
    useQuizHandlers(
      categories ?? [],
      setCategories,
      setResults,
      () => setQuizModalOpen(false)
    );

  const handleQuizCompletion = (
    index: number,
    quiz: Category,
    score: number,
    interpretation: string
  ) => {
    if (index === null) return;

    // Actualizar categorías
    setCategories(prev =>
      prev!.map((cat, i) =>
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

    // Actualizar resultados
    setResults(prev => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    // Mostrar confetti y resultados
    setShowConfetti(true);
    setResultModalOpen(true);
    setRefreshTrigger(prev => prev + 1);

    originalHandleQuizCompletion(
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

  // Auto-cierre del confetti
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const openQuiz = (q: Category, i: number) => {
    if (q.quiz.completed) return;
    setActiveQuiz(q);
    setActiveIndex(i);
    setQuizModalOpen(true);
  };

  const isAppLoading = authLoading || loading || categories === null;

  const QuizComponentToRender =
    activeQuiz && activeQuiz.quiz.id in quizComponents
      ? quizComponents[activeQuiz.quiz.id]
      : null;

  return (
    <div className="home-container">
      {/* Todo el contenido se renderiza siempre */}
      <ProgressHeader refreshTrigger={refreshTrigger} />
      <main>
        {categories?.map((cat, index) => (
          <QuizCard
            key={cat.name}
            cat={cat}
            index={index}
            refreshTrigger={refreshTrigger}
            openModal={() => openQuiz(cat, index)}
            openResult={(q, i, result) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setResultModalOpen(true);
              setResults(prev => ({ ...prev, [q.quiz.id]: result }));
            }}
            openRecomendacion={(q, i) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setRecommendModalOpen(true);
            }}
          />
        ))}

        {!quizModalOpen && !resultModalOpen && !recommendModalOpen && (
          <DockFooter logout={logout} />
          
        )}
      </main>

      {/* Overlay de carga */}
      {showLoadingOverlay && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="spinner" />
            <p>Cargando...</p>
          </div>
        </div>
      )}

      {/* Modales */}
      <Modal
        isOpen={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
      >
        {activeQuiz && (
          <Recommendation
            quizId={activeQuiz.quiz.id}
            score={results[activeQuiz.quiz.id]?.score ?? 0}
          />
        )}
      </Modal>

      <Modal isOpen={quizModalOpen} onClose={() => setQuizModalOpen(false)}>
        {QuizComponentToRender && activeQuiz && (
          <QuizComponentToRender
            onResult={(score, interpretation) =>
              handleQuizCompletion(activeIndex!, activeQuiz, score, interpretation)
            }
          />
        )}
      </Modal>

      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)}>
        {activeQuiz && results[activeQuiz.quiz.id] && (
          <ResultView
            score={results[activeQuiz.quiz.id].score}
            interpretation={results[activeQuiz.quiz.id].interpretation}
          />
        )}
      </Modal>

      {/* Confetti */}
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