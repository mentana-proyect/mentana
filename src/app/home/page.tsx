"use client";

import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "../../styles/home.css";
import { supabase } from "../../lib/supabaseClient";

import { initialData } from "../data/initialData";

import DockFooter from "../../components/DockFooter";
import { useAuthCheck } from "./utils/useAuthCheck";
import { useInactivityTimer } from "./utils/useInactivityTimer";
import { useLogout } from "./utils/useLogout";
import { useFetchProgress } from "./utils/useFetchProgress";

import ViewToggle from "./components/ViewToggle";
import NotesSection from "./components/NotesSection";
import PerfilSection from "./components/PerfilSection";
import QuizModals from "./components/QuizModals";
import ProgressHeaderNote from "../../components/ProgressHeaderNote";

import CuestionarioGAD7, { Gad7FormProps } from "./quizzes/quiz_ansiedad";
import CuestionarioPHQ9 from "./quizzes/quiz_depresion";
import CuestionarioPSS10 from "./quizzes/quiz_estres";
import CuestionarioUCLA from "./quizzes/quiz_soledad";

import { Category } from "../../components/useProgress";

type QuizKey = "ansiedad1" | "depresion1" | "estres1" | "soledad1";

const quizComponents: Record<QuizKey, React.FC<Gad7FormProps>> = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

interface ModalState {
  quizOpen: boolean;
  resultOpen: boolean;
  recommendOpen: boolean;
}

const Home: React.FC = () => {
  useAuthCheck();
  const logout = useLogout();
  useInactivityTimer(logout);

  const { categories, results, setResults, loading } =
    useFetchProgress(initialData);

  const safeCategories = React.useMemo(() => categories || [], [categories]);

  const [activeView, setActiveView] =
    useState<"diario" | "perfil">("diario");

  const [viewLoading, setViewLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [modalStates, setModalStates] =
    useState<Record<string, ModalState>>({});

  const initialized = useRef(false);

  const [showConfetti, setShowConfetti] = useState(false);

  /* ---------------- Inicializar modales ---------------- */
  useEffect(() => {
  if (initialized.current) return;

  if (safeCategories.length > 0) {
    initialized.current = true;

    const initial: Record<string, ModalState> = {};

    safeCategories.forEach((cat) => {
      initial[cat.quiz.id] = {
        quizOpen: false,
        resultOpen: false,
        recommendOpen: false,
      };
    });

    setModalStates(initial);
  }
}, [safeCategories]); // ✅ dependencia correcta


  /* ---------------- Cambio de vista con loader ---------------- */
  const handleViewChange = (view: "diario" | "perfil") => {
    if (view === activeView) return;

    setViewLoading(true);

    setTimeout(() => {
      setActiveView(view);
      setViewLoading(false);
    }, 1000);
  };

  /* ---------------- Helpers modales ---------------- */
  const toggleQuizModal = (quizId: string, open: boolean) => {
    setModalStates((prev) => ({
      ...prev,
      [quizId]: { ...prev[quizId], quizOpen: open },
    }));
  };

  const toggleResultModal = (quizId: string, open: boolean) => {
    setModalStates((prev) => ({
      ...prev,
      [quizId]: { ...prev[quizId], resultOpen: open },
    }));
  };

  const toggleRecommendModal = (quizId: string, open: boolean) => {
    setModalStates((prev) => ({
      ...prev,
      [quizId]: { ...prev[quizId], recommendOpen: open },
    }));
  };

  /* ---------------- User ID ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then((session) => {
      setUserId(session.data.session?.user?.id ?? "");
    });
  }, []);

  /* ---------------- Completar quiz ---------------- */
  const handleQuizCompletion = async (
    index: number,
    activeQuiz: Category,
    score: number,
    interpretation: string
  ) => {
    const quizId = activeQuiz.quiz.id;

    setResults((prev) => ({
      ...prev,
      [quizId]: { score, interpretation },
    }));

    setModalStates((prev) => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        quizOpen: false,
        resultOpen: true,
        recommendOpen: false,
      },
    }));

    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      setModalStates((prev) => ({
        ...prev,
        [quizId]: {
          ...prev[quizId],
          resultOpen: false,
        },
      }));
    }, 3000);

    localStorage.setItem("showConfetti", "true");
  };

  /* ---------------- Confetti post refresh ---------------- */
  useEffect(() => {
    const flag = localStorage.getItem("showConfetti");

    if (flag === "true") {
      setShowConfetti(true);
      localStorage.removeItem("showConfetti");
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  /* ---------------- Loader general ---------------- */
  if (loading) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p className="loader-text">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* 🔄 Loader cambio de vista */}
      {viewLoading && (
        <div className="view-loading-overlay">
          <div className="mini-spinner" />
          <p>Cargando...</p>
        </div>
      )}

      <div className="daily-notes-container">
        <ProgressHeaderNote refreshTrigger={refreshTrigger} />
        <ViewToggle
          activeView={activeView}
          setActiveView={handleViewChange}
        />
      </div>

      {activeView === "diario" && <NotesSection userId={userId} />}

      {activeView === "perfil" && (
        <PerfilSection
          categories={safeCategories}
          setResults={setResults}
          refreshTrigger={refreshTrigger}
          openQuizModal={(quiz) => toggleQuizModal(quiz.quiz.id, true)}
          openResultModal={(id) => toggleResultModal(id, true)}
          openRecommendModal={(id) => toggleRecommendModal(id, true)}
        />
      )}

      {safeCategories.map((cat, idx) => {
        const state = modalStates[cat.quiz.id];
        if (!state) return null;

        return (
          <QuizModals
            key={cat.quiz.id}
            activeQuiz={cat}
            activeIndex={idx}
            results={results}
            quizModalOpen={state.quizOpen}
            resultModalOpen={state.resultOpen}
            recommendModalOpen={state.recommendOpen}
            setQuizModalOpen={(open) =>
              toggleQuizModal(cat.quiz.id, open)
            }
            setResultModalOpen={(open) =>
              toggleResultModal(cat.quiz.id, open)
            }
            setRecommendModalOpen={(open) =>
              toggleRecommendModal(cat.quiz.id, open)
            }
            QuizComponentToRender={
              quizComponents[cat.quiz.id as QuizKey]
            }
            handleQuizCompletion={handleQuizCompletion}
          />
        );
      })}

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <DockFooter logout={logout} />
    </div>
  );
};

export default Home;
