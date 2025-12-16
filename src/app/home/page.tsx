"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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

  const { categories, results, setResults } =
    useFetchProgress(initialData);

  const safeCategories = useMemo(() => categories || [], [categories]);

  const [activeView, setActiveView] =
    useState<"diario" | "perfil">("diario");

  const [viewLoading, setViewLoading] = useState(false);
  const viewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [userId, setUserId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [modalStates, setModalStates] =
    useState<Record<string, ModalState>>({});

  const initialized = useRef(false);

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
  }, [safeCategories]);

  /* ---------------- Spinner inicial (1 segundo) ---------------- */
  useEffect(() => {
    initialTimeoutRef.current = setTimeout(() => {
      setInitialLoading(false);
      initialTimeoutRef.current = null;
    }, 1000);

    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
    };
  }, []);

  /* ---------------- Cambio de vista ---------------- */
  const handleViewChange = (view: "diario" | "perfil") => {
    if (view === activeView) return;

    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }

    setActiveView(view);
    setViewLoading(true);

    viewTimeoutRef.current = setTimeout(() => {
      setViewLoading(false);
      viewTimeoutRef.current = null;
    }, 2500);
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
  };

  return (
    <div className="home-container">
      {/* 🔄 Spinner inicial */}
      {initialLoading && (
        <div className="loader-screen">
          <div className="spinner" />
          <p className="loader-text">Cargando...</p>
        </div>
      )}

      {/* 🔄 Overlay loader */}
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
          results={results}
          setResults={setResults}
          refreshTrigger={refreshTrigger}
          logout={logout}
          openQuizModal={(quiz) =>
            setModalStates((prev) => ({
              ...prev,
              [quiz.quiz.id]: { ...prev[quiz.quiz.id], quizOpen: true },
            }))
          }
          openResultModal={(id) =>
            setModalStates((prev) => ({
              ...prev,
              [id]: { ...prev[id], resultOpen: true },
            }))
          }
          openRecommendModal={(id) =>
            setModalStates((prev) => ({
              ...prev,
              [id]: { ...prev[id], recommendOpen: true },
            }))
          }
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
              setModalStates((prev) => ({
                ...prev,
                [cat.quiz.id]: { ...prev[cat.quiz.id], quizOpen: open },
              }))
            }
            setResultModalOpen={(open) =>
              setModalStates((prev) => ({
                ...prev,
                [cat.quiz.id]: { ...prev[cat.quiz.id], resultOpen: open },
              }))
            }
            setRecommendModalOpen={(open) =>
              setModalStates((prev) => ({
                ...prev,
                [cat.quiz.id]: { ...prev[cat.quiz.id], recommendOpen: open },
              }))
            }
            QuizComponentToRender={
              quizComponents[cat.quiz.id as QuizKey]
            }
            handleQuizCompletion={handleQuizCompletion}
          />
        );
      })}

      <DockFooter logout={logout} />
    </div>
  );
};

export default Home;
