"use client";

import React, { useEffect, useState } from "react";

import "../../styles/home.css";

import { initialData } from "../data/initialData";
import { useLogout } from "./utils/useLogout";
import { useInactivityTimer } from "./utils/useInactivityTimer";
import { useAuthCheck } from "./utils/useAuthCheck";
import { useFetchProgress } from "./utils/useFetchProgress";
import { useQuizHandlers } from "./utils/useQuizHandlers";

import { supabase } from "../../lib/supabaseClient";

import ViewToggle from "./components/ViewToggle";
import NotesSection from "./components/NotesSection";
import PerfilSection from "./components/PerfilSection";
import QuizModals from "./components/QuizModals";

import { useNotes } from "./hooks/useNotes";
import { useQuizManager } from "./hooks/useQuizManager";

import ProgressHeaderNote from "../../components/ProgressHeaderNote";
import Footer from "../../components/Footer";
import Confetti from "react-confetti";

import CuestionarioGAD7 from "./quizzes/quiz_ansiedad";
import CuestionarioPHQ9 from "./quizzes/quiz_depresion";
import CuestionarioPSS10 from "./quizzes/quiz_estres";
import CuestionarioUCLA from "./quizzes/quiz_soledad";

/* ⬅⬅ SOLUCIÓN DEL ERROR */
type QuizKey = "ansiedad1" | "depresion1" | "estres1" | "soledad1";

const quizComponents: Record<QuizKey, React.FC<any>> = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

const Home = () => {
  useAuthCheck();
  const logout = useLogout();
  useInactivityTimer(logout);

  const { categories, setCategories, results, setResults } =
    useFetchProgress(initialData);

  const [activeView, setActiveView] = useState<"diario" | "perfil">("diario");
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { handleQuizCompletion: baseHandleQuizCompletion } = useQuizHandlers(
    categories ?? [],
    setCategories,
    setResults,
    () => setQuizModalOpen(false)
  );

  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then((session) => {
      setUserId(session.data.session?.user?.id ?? "");
    });
  }, []);

  const notes = useNotes(userId);

  const quizManager = useQuizManager(
    categories ?? [],
    setCategories,
    results,
    setResults,
    baseHandleQuizCompletion,
    setQuizModalOpen,
    setResultModalOpen
  );

  /* ⬅⬅ AQUÍ SE APLICA LA SOLUCIÓN */
  const QuizComponentToRender =
    quizManager.activeQuiz &&
    quizComponents[quizManager.activeQuiz.quiz.id as QuizKey];

  return (
    <div className="home-container">
      <div className="daily-notes-container">
        <ProgressHeaderNote refreshTrigger={refreshTrigger} />
        <h2 className="daily-notes-title">
          👉 Es tu espacio seguro, pensado para ti 🌱
        </h2>

        <ViewToggle activeView={activeView} setActiveView={setActiveView} />
      </div>

      {activeView === "diario" && <NotesSection userId={userId} />}

      {activeView === "perfil" && (
        <PerfilSection
          categories={categories ?? []}
          refreshTrigger={refreshTrigger}
          logout={logout}
          setActiveQuiz={quizManager.setActiveQuiz}
          setActiveIndex={quizManager.setActiveIndex}
          setResultModalOpen={setResultModalOpen}
          setRecommendModalOpen={setRecommendModalOpen}
          setResults={setResults}
          results={results}
        />
      )}

      <QuizModals
        activeQuiz={quizManager.activeQuiz}
        results={results}
        quizModalOpen={quizModalOpen}
        resultModalOpen={resultModalOpen}
        recommendModalOpen={recommendModalOpen}
        setQuizModalOpen={setQuizModalOpen}
        setResultModalOpen={setResultModalOpen}
        setRecommendModalOpen={setRecommendModalOpen}
        QuizComponentToRender={QuizComponentToRender}
        handleQuizCompletion={quizManager.handleQuizCompletion}
        activeIndex={quizManager.activeIndex}
      />

      {quizManager.showConfetti && typeof window !== "undefined" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
