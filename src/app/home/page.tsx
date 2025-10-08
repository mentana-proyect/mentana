"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../../styles/home.css";
import { Category } from "../../components/useProgress";
import Modal from "../../components/modal";
import CuestionarioGAD7 from "./quiz_ansiedad";
import CuestionarioPHQ9 from "./quiz_depresion";
import CuestionarioPSS10 from "./quiz_estres";
import CuestionarioUCLA from "./quiz_soledad";
import Confetti from "react-confetti";
import { supabase } from "../../lib/supabaseClient";

// 🔹 Tipos
type QuizResult = {
  score: number;
  interpretation: string;
};

type QuizProps = {
  onResult: (score: number, interpretation: string) => void;
};

type QuizComponentsMap = {
  [quizId: string]: React.FC<QuizProps>;
};

// 🔹 Logout
const useLogout = () => {
  const router = useRouter();
  return async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error al cerrar sesión:", error.message);
    else router.replace("/auth");
  };
};

// 🔹 Todos los quizzes desbloqueados
const initialData: Category[] = [
  { name: "Ansiedad", quiz: { id: "ansiedad1", title: "Ansiedad GAD-7", description: "Evalúa tu nivel de preocupación, nerviosismo e inquietud en las últimas dos semanas.", unlocked: true, completed: false } },
  { name: "Depresión", quiz: { id: "depresion1", title: "Depresión PHQ-9", description: "Mide tu estado de ánimo, interés y energía reciente para identificar síntomas de depresión.", unlocked: true, completed: false } },
  { name: "Estrés", quiz: { id: "estres1", title: "Estrés PSS-10", description: "Evalúa la percepción de tensión, carga y capacidad de recuperación ante situaciones estresantes.", unlocked: true, completed: false } },
  { name: "Soledad", quiz: { id: "soledad1", title: "Soledad UCLA", description: "Mide tu percepción de conexión social y apoyo, identificando posibles sentimientos de soledad.", unlocked: true, completed: false } },
];

const quizComponents: QuizComponentsMap = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 min

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace("/auth");
      else setLoading(false);
    };
    checkAuth();
  }, [router]);

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
        if (p.score !== null && p.interpretation) savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuizCompletion = async (score: number, interpretation: string) => {
    setShowConfetti(true);
    if (activeIndex === null || !activeQuiz) return;

    const updated = [...categories];
    updated[activeIndex] = { ...activeQuiz, quiz: { ...activeQuiz.quiz, completed: true, unlocked: true } };

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

 

  return (
    <div>
      <header>
        <article className="card">
          <div style={{ textAlign: "center" }}>
             <img src="../logo.jpg" className="logo"></img>
            <h3>Perfil Emocional Preliminar</h3>
          </div>
          <p style={{ textAlign: "center" }}>
            Al completar tu PEP estarás dando un paso importante hacia conocerte mejor. Poco a poco, irás desbloqueando aspectos clave de ti mismo: cómo manejas la ansiedad, el estrés, la soledad o la tristeza.
            <br /><br /><strong>👉 Es tu espacio seguro, pensado para ti 🌱</strong>
          </p>
          <div className="topbar">
            <div className="progress-wrap" aria-label="Progreso total">
              <div className="progress-label">
                <span>Progreso</span>
                <span id="progressText">{completed} / {total} completados</span>
              </div>
              <div className="progress">
                <div id="progressBar" style={{ width: `${(completed / total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </article>
      </header>

      <main>
        {categories.map((cat, index) => (
          <section key={cat.name} className="grid">
            <article className="card-content">
             
              <h2>{cat.quiz.title}</h2>
              <span className="pill">{cat.quiz.completed ? "✅ Completado" : "🔓 Disponible"}</span>
              <p className="subtitle">{cat.quiz.description}</p>
              <div className="actions">
                <button className="action open" disabled={cat.quiz.completed} onClick={() => openModal(cat, index)}><b>Responder</b></button>
                <button className="action view" disabled={!cat.quiz.completed} onClick={() => openResult(cat, index)}><b>Resultado</b></button>
                {/*<button className="action open" disabled={cat.quiz.completed} onClick={() => openModal(cat, index)}><b>Recomendación</b></button>*/}
              </div>
            </article>
          </section>
        ))}
        <footer>
              <strong>&copy; 2025 Mentana 🧠</strong>
            </footer>
        

        <footer className="dock-footer">
        <nav className="dock">
          <a href="./home" title="Inicio">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </a>

          <a href="./setting" title="Configuración">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-settings"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </a>
        
          <a
            onClick={logout}
            title="Cerrar sesión"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </a>
        </nav>


</footer>


      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} showConfetti={showConfetti}>
        {modalMode === "quiz" && QuizComponentToRender && <QuizComponentToRender onResult={handleQuizCompletion} />}
        {modalMode === "result" && activeQuiz && results[activeQuiz.quiz.id] && (
          <div className="message mt-6">
            <p><strong>Puntaje total:</strong> {results[activeQuiz.quiz.id].score}</p>
            <p><strong>{results[activeQuiz.quiz.id].interpretation}</strong></p>
          </div>
        )}
      </Modal>

      {showConfetti && typeof window !== "undefined" && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} gravity={0.1} />
      )}
    </div>
  );
};

export default Home;
