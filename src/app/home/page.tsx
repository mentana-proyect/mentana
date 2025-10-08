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

// 📋 Mapeo de quizzes disponibles
const quizComponents: Record<
  "ansiedad1" | "depresion1" | "estres1" | "soledad1",
  React.FC<{ onComplete?: () => void; onResult?: (score: number, interpretation: string) => void }>
> = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

// 📂 Datos iniciales
const initialData: Category[] = [
  {
    name: "Ansiedad",
    quiz: {
      id: "ansiedad1",
      title: "Ansiedad GAD-7",
      description: "Evalúa tu nivel de preocupación, nerviosismo e inquietud.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Depresión",
    quiz: {
      id: "depresion1",
      title: "Depresión PHQ-9",
      description: "Mide tu estado de ánimo y energía reciente.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Estrés",
    quiz: {
      id: "estres1",
      title: "Estrés PSS-10",
      description: "Evalúa tu percepción de carga y tensión.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Soledad",
    quiz: {
      id: "soledad1",
      title: "Soledad UCLA",
      description: "Mide tu nivel de conexión social.",
      unlocked: true,
      completed: false,
    },
  },
];

const Home: React.FC = () => {
  const logout = useLogout();
  const authLoading = useAuthCheck(); // Verifica sesión
  useInactivityTimer(logout);

  // 🧠 Carga de progreso de quizzes
  const { categories, setCategories, results, setResults, loading, error } =
    useFetchProgress(initialData);

  // ⚙️ Estados locales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalMode, setModalMode] = useState<"quiz" | "result">("quiz");

  const { handleQuizCompletion } = useQuizHandlers(
    categories,
    setCategories,
    setResults,
    () => setIsModalOpen(false)
  );

  const completed = categories.filter((c) => c.quiz.completed).length;
  const total = categories.length;

  const QuizComponentToRender =
    activeQuiz && activeQuiz.quiz.id in quizComponents
      ? quizComponents[activeQuiz.quiz.id as keyof typeof quizComponents]
      : null;

  // Mostrar spinner mientras se carga la sesión o progreso
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
            openModal={(q, i) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setModalMode("quiz");
              setIsModalOpen(true);
            }}
            openResult={(q, i) => {
              setActiveQuiz(q);
              setActiveIndex(i);
              setModalMode("result");
              setIsModalOpen(true);
            }}
          />
        ))}

        <footer>
          <strong>&copy; 2025 Mentana 🧠</strong>
        </footer>
        <DockFooter logout={logout} />
      </main>

      {/* Modal dinámico */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showConfetti={showConfetti}
      >
        {modalMode === "quiz" && QuizComponentToRender && (
          <QuizComponentToRender
            onResult={(s, i) =>
              handleQuizCompletion(
                activeIndex,
                activeQuiz,
                s,
                i,
                setShowConfetti,
                setModalMode
              )
            }
          />
        )}
        {modalMode === "result" &&
          activeQuiz &&
          results[activeQuiz.quiz.id] && (
            <ResultView
              score={results[activeQuiz.quiz.id].score}
              interpretation={
                results[activeQuiz.quiz.id].interpretation
              }
            />
          )}
      </Modal>

      {/* 🎉 Confeti */}
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
