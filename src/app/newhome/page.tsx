"use client";
import React, { useState, useEffect } from "react";
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

import ProgressHeaderNote from "../../components/ProgressHeaderNote";
import Footer from "../../components/Footer";
import DockFooter from "../../components/DockFooter";
import QuizCard from "../../components/QuizCard";
import ResultView from "../../components/ResultView";
import Recommendation from "../../components/Recommendation";
import { initialData } from "../data/initialData";


// ================================
//   MAPA DE QUIZZES DISPONIBLES
// ================================
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
  // ====== Auth & Seguridad ======
  const logout = useLogout();
  const authLoading = useAuthCheck();
  useInactivityTimer(logout);

  // ====== Datos ======
  const { categories, setCategories, results, setResults, loading } =
    useFetchProgress(initialData);

  // ====== Estados UI ======
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  const [activeView, setActiveView] = useState<"perfil" | "diario">("diario");


  // ================================
  //   OVERLAY INICIAL
  // ================================
  useEffect(() => {
    const timer = setTimeout(() => setShowLoadingOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);


  // ================================
  //   HANDLER QUIZZES
  // ================================
  const { handleQuizCompletion: originalHandleQuizCompletion } = useQuizHandlers(
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

    // Marcar como completado
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

    // Guardar resultados
    setResults(prev => ({
      ...prev,
      [quiz.quiz.id]: { score, interpretation },
    }));

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


  const QuizComponentToRender =
    activeQuiz && activeQuiz.quiz.id in quizComponents
      ? quizComponents[activeQuiz.quiz.id]
      : null;



  // ================================
  //   NOTAS DIARIAS
  // ================================
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ date: string; text: string }[]>([]);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);

  // cargar notas anteriores
  useEffect(() => {
    const saved = localStorage.getItem("dailyNotes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const handleSaveNote = () => {
    if (note.trim().length === 0) return;

    const newNote = {
      date: new Date().toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      text: note.trim(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("dailyNotes", JSON.stringify(updated));
    setNote("");
  };

  const deleteNote = (index: number) => {
    if (deletingIndexes.includes(index)) return;

    const confirmed = confirm("¿Quieres eliminar esta nota?");
    if (!confirmed) return;

    setDeletingIndexes(prev => [...prev, index]);

    setTimeout(() => {
      const updated = notes.filter((_, i) => i !== index);
      setNotes(updated);
      localStorage.setItem("dailyNotes", JSON.stringify(updated));
      setDeletingIndexes(prev => prev.filter(i => i !== index));
    }, 320);
  };




  // =============================================================
  //    RENDER PRINCIPAL
  // =============================================================
  return (
    <div className="home-container">


      {/* ===================================
          HEADER + DESCRIPCIÓN
      =================================== */}
      <div className="daily-notes-container">
        <ProgressHeaderNote refreshTrigger={refreshTrigger} />

        <h2 className="daily-notes-title">
          👉 Tu espacio seguro para avanzar 🌱
        </h2>


        {/* ===================================
            TOGGLE PRINCIPAL: PERFIL / DIARIO
        =================================== */}
        <div className="view-toggle">

          {/* BOTÓN DIARIO */}
          <button
            className={`toggle-btn ${activeView === "diario" ? "active" : ""}`}
            onClick={() => setActiveView("diario")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22h11A2.5 2.5 0 0 0 20 19.5V5H4z" />
              <path d="M16 3V5" />
              <path d="M8 3V5" />
              <path d="M4 9h16" />
            </svg>
            <strong>Diario</strong>
          </button>

          {/* BOTÓN PERFIL */}
          <button
            className={`toggle-btn ${activeView === "perfil" ? "active" : ""}`}
            onClick={() => setActiveView("perfil")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <strong>Perfil</strong>
          </button>

        </div>


        {/* Flecha decorativa UX */}
        <div style={{ textAlign: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>



        {/* ===========================
            DESCRIPCIÓN SOLO "DIARIO"
        ============================ */}
        {activeView === "diario" && (
          <>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#56dbc4", marginBottom: 10 }}>Mentana Chile</h2>
            </div>

            <p style={{ textAlign: "center", maxWidth: 450, margin: "0 auto" }}>
              Un lugar para registrar tus sensaciones diarias y observar tu avance emocional.  
              Todo lo que escribas aquí es solo para ti.
            </p>
          </>
        )}



        {/* ===========================
            NOTAS DIARIAS
        ============================ */}
        {activeView === "diario" && (
          <>
            <textarea
              className="daily-note-input"
              placeholder="Escribe una nota sobre tu día..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button className="save-note-btn" onClick={handleSaveNote}>
              Guardar nota
            </button>

            <div className="notes-history">
              {notes.length === 0 ? (
                <p className="empty-notes">✨ Aún no tienes notas guardadas.</p>
              ) : (
                notes.map((n, i) => {
                  const isDeleting = deletingIndexes.includes(i);
                  return (
                    <div key={i} className={`note-item ${isDeleting ? "fade-out" : ""}`}>
                      <div className="note-main">
                        <div className="note-date">{n.date}</div>
                        <div className="note-text">{n.text}</div>
                      </div>

                      <div
                        role="button"
                        aria-label={`Eliminar nota ${i + 1}`}
                        className="delete-icon"
                        onClick={() => deleteNote(i)}
                        tabIndex={0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg"
                          width="18" height="18" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14H6L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>



      {/* ===================================
            PERFIL
      =================================== */}
      {activeView === "perfil" && (
        <div className="home-container">

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



          {/* ================= LOADING OVERLAY ================= */}
          {showLoadingOverlay && (
            <div className="loading-overlay">
              <div className="loading-container">
                <div className="spinner" />
                <p>Cargando...</p>
              </div>
            </div>
          )}



          {/* ============= MODALES ============= */}
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



          {/* CONFETTI */}
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
      )}


      <Footer />
    </div>
  );
};

export default Home;
