"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/home.css";
import Modal from "../../components/modal";
import Confetti from "react-confetti";

import { Category } from "../../components/useProgress";
import CuestionarioGAD7 from "./quizzes/quiz_ansiedad";
import CuestionarioPHQ9 from "./quizzes/quiz_depresion";
import CuestionarioPSS10 from "./quizzes/quiz_estres";
import CuestionarioUCLA from "./quizzes/quiz_soledad";

import { useLogout } from "./utils/useLogout";
import ProgressHeader from "../../components/ProgressHeader";
import QuizCard from "../../components/QuizCard";
import DockFooter from "../../components/DockFooter";
import ResultView from "../../components/ResultView";

type QuizResult = { score: number; interpretation: string };
type QuizProps = { onResult: (score: number, interpretation: string) => void };
type QuizComponentsMap = { [quizId: string]: React.FC<QuizProps> };

const quizComponents: QuizComponentsMap = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

const initialData: Category[] = [
  { name: "Ansiedad", quiz: { id: "ansiedad1", title: "Ansiedad GAD-7", description: "Evalúa tu nivel de preocupación, nerviosismo e inquietud en las últimas dos semanas.", unlocked: true, completed: false } },
  { name: "Depresión", quiz: { id: "depresion1", title: "Depresión PHQ-9", description: "Mide tu estado de ánimo, interés y energía reciente para identificar síntomas de depresión.", unlocked: true, completed: false } },
  { name: "Estrés", quiz: { id: "estres1", title: "Estrés PSS-10", description: "Evalúa la percepción de tensión, carga y capacidad de recuperación ante situaciones estresantes.", unlocked: true, completed: false } },
  { name: "Soledad", quiz: { id: "soledad1", title: "Soledad UCLA", description: "Mide tu percepción de conexión social y apoyo, identificando posibles sentimientos de soledad.", unlocked: true, completed: false } },
];

const INACTIVITY_LIMIT = 10 * 60 * 1000;

const Home: React.FC = () => {
  const router = useRouter();
  const logout = useLogout();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalMode, setModalMode] = useState<"quiz" | "result">("quiz");
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const completed = categories.filter((c) => c.quiz.completed).length;
  const total = categories.length;

  // 💤 Inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.warn("Sesión cerrada por inactividad ⏳");
      logout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const handleClick = () => resetInactivityTimer();
    window.addEventListener("click", handleClick);
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      window.removeEventListener("click", handleClick);
    };
  }, [logout]);

  // 🔐 Verificar usuario
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace("/auth");
      else setLoading(false);
    };
    checkAuth();
  }, [router]);

  // 📊 Cargar progreso
  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("quiz_id, completed, unlocked, score, interpretation")
        .eq("user_id", user.id);

      if (error) return console.error(error.message);

      const updatedCategories = initialData.map((cat) => {
        const progress = data?.find((p) => p.quiz_id === cat.quiz.id);
        return {
          ...cat,
          quiz: {
            ...cat.quiz,
            completed: progress?.completed ?? cat.quiz.completed,
            unlocked: true,
          },
        };
      });

      const savedResults: Record<string, QuizResult> = {};
      data?.forEach((p) => {
        if (p.score !== null && p.interpretation)
          savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
      });

      setCategories(updatedCategories);
      setResults(savedResults);
    };

    fetchProgress();
  }, []);

  const openModal = (quiz: Category, index: number) => {
    setActiveQuiz(quiz);
    setActiveIndex(index);
    setModalMode("quiz");
    setIsModalOpen(true);
    setShowConfetti(false);
  };

  const openResult = (quiz: Category, index: number) => {
    setActiveQuiz(quiz);
    setActiveIndex(index);
    setModalMode("result");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setActiveQuiz(null);
    setActiveIndex(null);
    setIsModalOpen(false);
  };

  const handleQuizCompletion = async (score: number, interpretation: string) => {
    setShowConfetti(true);
    if (activeIndex === null || !activeQuiz) return;

    const updated = [...categories];
    updated[activeIndex] = { ...activeQuiz, quiz: { ...activeQuiz.quiz, completed: true } };
    setCategories(updated);
    setResults((prev) => ({ ...prev, [activeQuiz.quiz.id]: { score, interpretation } }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_progress").upsert({
        quiz_id: activeQuiz.quiz.id,
        completed: true,
        unlocked: true,
        score,
        interpretation,
        user_id: user.id,
      });
    }

    setModalMode("result");
    setTimeout(() => closeModal(), 2000);
  };

  const QuizComponentToRender = activeQuiz ? quizComponents[activeQuiz.quiz.id] : null;

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <ProgressHeader completed={completed} total={total} />

      <main>
        {categories.map((cat, index) => (
          <QuizCard key={cat.name} cat={cat} index={index} openModal={openModal} openResult={openResult} />
        ))}

        <footer>
          <strong>&copy; 2025 Mentana 🧠</strong>
        </footer>

        <DockFooter logout={logout} />
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} showConfetti={showConfetti}>
        {modalMode === "quiz" && QuizComponentToRender && (
          <QuizComponentToRender onResult={handleQuizCompletion} />
        )}
        {modalMode === "result" && activeQuiz && results[activeQuiz.quiz.id] && (
          <ResultView
            score={results[activeQuiz.quiz.id].score}
            interpretation={results[activeQuiz.quiz.id].interpretation}
          />
        )}
      </Modal>

      {showConfetti && typeof window !== "undefined" && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.1} />
      )}
    </div>
  );
};

export default Home;
