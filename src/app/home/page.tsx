"use client";
import React, { useState, useEffect } from "react";
import "../../styles/home.css";
import { Category, Quiz } from "../../components/useProgress";
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

// 🔹 Mapeo de cuestionarios
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
  const [daysRemaining, setDaysRemaining] = useState<Record<string, number>>({});
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  const { handleQuizCompletion: originalHandleQuizCompletion } = useQuizHandlers(
    categories,
    setCategories,
    setResults,
    () => setIsModalOpen(false)
  );

  // 🔹 Calcular días restantes
  const getDaysRemaining = (quiz: Quiz) => {
    if (!quiz.completedAt) return 0;
    const unlockDate = new Date(
      new Date(quiz.completedAt).getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const diff = unlockDate.getTime() - new Date().getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  // 🔹 Comprobar si un quiz está desbloqueado
  const isQuizUnlocked = (quiz: Quiz) => getDaysRemaining(quiz) === 0;

  // 🔹 Manejar finalización de quiz
  const handleQuizCompletion = (
    index: number | null,
    quiz: Category | null,
    score: number,
    interpretation: string
  ) => {
    if (index === null || quiz === null) return;

    const updatedCategories = [...categories];
    updatedCategories[index].quiz.completed = true;
    updatedCategories[index].quiz.completedAt = new Date().toISOString();
    setCategories(updatedCategories);

    setResults(prev => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    setShowConfetti(true);
    setModalMode("result");

    originalHandleQuizCompletion(index, quiz, score, interpretation, setShowConfetti, setModalMode);
  };

  // 🔹 Actualizar días restantes cada minuto
  useEffect(() => {
    const updateDays = () => {
      const newDays: Record<string, number> = {};
      categories.forEach(cat => {
        if (cat.quiz.completed) {
          newDays[cat.quiz.id] = getDaysRemaining(cat.quiz);
        }
      });
      setDaysRemaining(newDays);
    };

    updateDays(); // Inicial
    const interval = setInterval(updateDays, 60000); // cada minuto
    return () => clearInterval(interval);
  }, [categories]);

  const completed = categories.filter(c => c.quiz.completed).length;
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
        {categories.map((cat, index) => {
          const remaining = getDaysRemaining(cat.quiz);
          const locked = cat.quiz.completed && remaining > 0;

          return (
            <div key={cat.name} style={{ position: "relative" }}>
              <QuizCard
                cat={cat}
                index={index}
                openModal={(q, i) => {
                  if (locked) {
                    setLockMessage(`⏰ Este quiz se desbloquea en ${remaining} días`);
                    setTimeout(() => setLockMessage(null), 3000);
                    return;
                  }
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

              {/* 🔹 Etiqueta de días restantes */}
              {locked && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 16,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>⏰</span>
                  <span>{remaining} días</span>
                </div>
              )}
            </div>
          );
        })}

        <footer>
          <strong>&copy; 2025 Mentana 🧠</strong>
        </footer>
        <DockFooter logout={logout} />
      </main>

      {/* 🔹 Modal con cuestionarios y resultados */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showConfetti={showConfetti}
      >
        {modalMode === "quiz" && QuizComponentToRender && (
          <QuizComponentToRender
            onResult={(s, i) =>
              handleQuizCompletion(activeIndex, activeQuiz, s, i)
            }
          />
        )}
        {modalMode === "result" &&
          activeQuiz &&
          results[activeQuiz.quiz.id] && (
            <ResultView
              score={results[activeQuiz.quiz.id].score}
              interpretation={results[activeQuiz.quiz.id].interpretation}
            />
          )}
      </Modal>

      {/* 🔹 Confetti 🎉 */}
      {showConfetti && typeof window !== "undefined" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      {/* 🔹 Mensaje de bloqueo elegante */}
      {lockMessage && (
        <div className="lock-toast">
          {lockMessage}
        </div>
      )}
    </div>
  );
};

export default Home;
