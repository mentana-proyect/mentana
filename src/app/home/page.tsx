"use client";

import React, { useState, useEffect } from "react";
import "../../styles/home.css";

import { Category } from "../../components/useProgress";
import { initialData } from "../data/initialData";

import ProgressHeaderNote from "../../components/ProgressHeaderNote";
import Modal from "../../components/modal";
import Footer from "../../components/Footer";
import DockFooter from "../../components/DockFooter";
import QuizCard from "../../components/QuizCard";
import ResultView from "../../components/ResultView";
import Recommendation from "../../components/Recommendation";
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

/* =========================================
   QUIZ MAP
========================================= */
const quizComponents: Record<
  string,
  React.FC<{ onResult: (score: number, interpretation: string) => void }>
> = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

/* =========================================
   COMPOSICIÓN PRINCIPAL
========================================= */
const Home: React.FC = () => {
  /* ------------------ AUTH / LOGOUT ------------------ */
  const logout = useLogout();
  useAuthCheck(); // 🔹 quitado el warning
  useInactivityTimer(logout);

  /* ------------------ QUIZZES ------------------ */
  const { categories, setCategories, results, setResults } =
    useFetchProgress(initialData); // 🔹 quitado "loading"

  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { handleQuizCompletion: baseHandleQuizCompletion } = useQuizHandlers(
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

    // Guardar progreso
    setCategories((prev) =>
      prev!.map((cat, i) =>
        i === index
          ? {
              ...cat,
              quiz: { ...cat.quiz, completed: true, completedAt: new Date().toISOString() },
            }
          : cat
      )
    );

    // Guardar resultado
    setResults((prev) => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

    // UI feedback
    setShowConfetti(true);
    setResultModalOpen(true);
    setRefreshTrigger((prev) => prev + 1);

    // Handler base
    baseHandleQuizCompletion(
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

  /* ------------------ CONFETTI TIMER ------------------ */
  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, [showConfetti]);

  /* ------------------ NOTAS DIARIAS ------------------ */
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ date: string; text: string }[]>([]);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);
  const [activeView, setActiveView] = useState<"perfil" | "diario">("diario");

  useEffect(() => {
    const saved = localStorage.getItem("dailyNotes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const handleSaveNote = () => {
    if (!note.trim()) return;

    const newNote = {
      date: new Date().toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }),
      text: note.trim(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("dailyNotes", JSON.stringify(updated));
    setNote("");
  };

  const deleteNote = (index: number) => {
    if (deletingIndexes.includes(index)) return;
    if (!confirm("¿Quieres eliminar esta nota?")) return;

    setDeletingIndexes((prev) => [...prev, index]);

    setTimeout(() => {
      const updated = notes.filter((_, i) => i !== index);
      setNotes(updated);
      localStorage.setItem("dailyNotes", JSON.stringify(updated));
      setDeletingIndexes((prev) => prev.filter((i) => i !== index));
    }, 320);
  };

  /* ------------------ QUIZ COMPONENT ------------------ */
  const QuizComponentToRender =
    activeQuiz && quizComponents[activeQuiz.quiz.id]
      ? quizComponents[activeQuiz.quiz.id]
      : null;

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="home-container">
      {/* HEADER NOTAS */}
      <div className="daily-notes-container">
        <ProgressHeaderNote refreshTrigger={refreshTrigger} />

        <h2 className="daily-notes-title">👉 Es tu espacio seguro, pensado para ti 🌱</h2>

        {/* BUTTON TOGGLES */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === "diario" ? "active" : ""}`}
            onClick={() => setActiveView("diario")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22h11A2.5 2.5 0 0 0 20 19.5V5H4z" />
              <path d="M16 3V5" />
              <path d="M8 3V5" />
              <path d="M4 9h16" />
            </svg>{" "}
            <strong>Diario</strong>
          </button>

          <button
            className={`toggle-btn ${activeView === "perfil" ? "active" : ""}`}
            onClick={() => setActiveView("perfil")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <strong>Perfil</strong>
          </button>
        </div>
      </div>
      <DockFooter logout={logout} />

      {/* SECCIÓN → DIARIO */}
      {activeView === "diario" && (
        <div className="daily-notes-container">
          <h2 style={{ textAlign: "left" }}>Mentana Chile</h2>

          <p style={{ textAlign: "left" }}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>

          <textarea
            className="daily-note-input"
            placeholder="Escribe una nota sobre tu día..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button className="save-note-btn" onClick={handleSaveNote}>
            <strong>Guardar nota</strong>
          </button>

          <div className="notes-history">
            {notes.length === 0 ? (
              <p className="empty-notes">Aún no tienes notas guardadas.</p>
            ) : (
              notes.map((n, i) => (
                <div
                  key={i}
                  className={`note-item ${deletingIndexes.includes(i) ? "fade-out" : ""}`}
                >
                  <div className="note-main">
                    <div className="note-date">{n.date}</div>
                    <div className="note-text">{n.text}</div>
                  </div>

                  <div className="delete-icon" onClick={() => deleteNote(i)}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN → PERFIL */}
      {activeView === "perfil" && (
        <main className="perfil-container">
          {categories?.map((cat, index) => (
            <QuizCard
              key={cat.name}
              cat={cat}
              index={index}
              refreshTrigger={refreshTrigger}
              openModal={() => {
                if (!cat.quiz.completed) {
                  setActiveQuiz(cat);
                  setActiveIndex(index);
                  setQuizModalOpen(true);
                }
              }}
              openResult={(q, i, result) => {
                setActiveQuiz(q);
                setActiveIndex(i);
                setResultModalOpen(true);
                setResults((prev) => ({ ...prev, [q.quiz.id]: result }));
              }}
              openRecomendacion={(q, i) => {
                setActiveQuiz(q);
                setActiveIndex(i);
                setRecommendModalOpen(true);
              }}
            />
          ))}
          <DockFooter logout={logout} />
        </main>
      )}

      {/* MODALES */}
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

      <Modal isOpen={recommendModalOpen} onClose={() => setRecommendModalOpen(false)}>
        {activeQuiz && (
          <Recommendation
            quizId={activeQuiz.quiz.id}
            score={results[activeQuiz.quiz.id]?.score ?? 0}
          />
        )}
      </Modal>

      {/* CONFETTI */}
      {showConfetti && typeof window !== "undefined" && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      <Footer />
    </div>
  );
};

export default Home;
