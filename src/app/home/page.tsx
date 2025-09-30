"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../../styles/home.css";
import { Category } from "../../components/useProgress";
import Modal from "../../components/modal";
import CuestionarioGAD7 from "./quiz_gad7";
import CuestionarioPHQ9 from "./quiz_phq9";
import CuestionarioPSS10 from "./quiz_pss10";
import CuestionarioUCLA from "./quiz_ucla";
import Confetti from "react-confetti";
import { supabase } from "../../lib/supabaseClient";

// 🔹 Logout
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error al cerrar sesión:", error.message);
  } else {
    window.location.href = "./auth";
  }
};

const initialData: Category[] = [
  {
    name: "Ansiedad",
    quiz: {
      id: "ansiedad1",
      title: "Ansiedad GAD-7",
      description: "Preocupación, nerviosismo e inquietud.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Depresión",
    quiz: {
      id: "depresion1",
      title: "Depresión PHQ-9",
      description: "Estado de ánimo, interés y energía reciente.",
      unlocked: false,
      completed: false,
    },
  },
  {
    name: "Estrés",
    quiz: {
      id: "estres1",
      title: "Estrés PSS-10",
      description: "Tensión, carga y recuperación.",
      unlocked: false,
      completed: false,
    },
  },
  {
    name: "Soledad",
    quiz: {
      id: "soledad1",
      title: "Soledad UCLA",
      description: "Percepción de conexión y apoyo social.",
      unlocked: false,
      completed: false,
    },
  },
];

const quizComponents: { [key: string]: React.FC<any> } = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

const INACTIVITY_LIMIT = 10 * 60 * 1000; // ⏱️ 10 minutos

const Home: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔹 Estado de quizzes y resultados
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<{ [quizId: string]: { score: number; interpretation: string } }>({});
  const completed = categories.filter((c) => c.quiz.completed).length;
  const total = categories.length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Category | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalMode, setModalMode] = useState<"quiz" | "result">("quiz");

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // 🔹 Reinicia el contador de inactividad SOLO con clics
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.warn("Sesión cerrada por inactividad ⏳");
      handleLogout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const handleClick = () => resetInactivityTimer();

    window.addEventListener("click", handleClick);
    resetInactivityTimer(); // iniciar al cargar

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // 🔹 Proteger página: revisar sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
      } else {
        setLoading(false);
      }
    };
    checkAuth();

    // Recargar si viene de cache (botón atrás en móviles)
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/auth");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 🔹 Cargar progreso y resultados desde Supabase
  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("quiz_id, completed, unlocked, score, interpretation")
        .eq("user_id", userId);

      if (error) {
        console.error("Error cargando progreso:", error.message);
        return;
      }

      const updatedCategories = initialData.map((cat) => {
        const progress = data?.find((p) => p.quiz_id === cat.quiz.id);
        return {
          ...cat,
          quiz: {
            ...cat.quiz,
            completed: progress ? progress.completed : false,
            unlocked: progress ? progress.unlocked : cat.quiz.unlocked,
          },
        };
      });

      const savedResults: { [quizId: string]: { score: number; interpretation: string } } = {};
      data?.forEach((p) => {
        if (p.score !== null && p.interpretation) {
          savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
        }
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

    if (activeIndex !== null && activeQuiz) {
      const updated = [...categories];
      updated[activeIndex] = {
        ...activeQuiz,
        quiz: { ...activeQuiz.quiz, completed: true, unlocked: true },
      };

      if (activeIndex < updated.length - 1) {
        updated[activeIndex + 1] = {
          ...updated[activeIndex + 1],
          quiz: { ...updated[activeIndex + 1].quiz, unlocked: true },
        };
      }

      setCategories(updated);
      setResults((prev) => ({
        ...prev,
        [activeQuiz.quiz.id]: { score, interpretation },
      }));

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (userId) {
        await supabase.from("quiz_progress").upsert({
          quiz_id: activeQuiz.quiz.id,
          completed: true,
          unlocked: true,
          score,
          interpretation,
          user_id: userId,
        });

        if (activeIndex < updated.length - 1) {
          const nextQuiz = updated[activeIndex + 1].quiz;
          await supabase.from("quiz_progress").upsert({
            quiz_id: nextQuiz.id,
            completed: nextQuiz.completed,
            unlocked: true,
            user_id: userId,
          });
        }
      }
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
            <img
              src="../logo.jpg"
              alt="Logo"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
            <h2>Perfil Emocional Preliminar</h2><br />
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
            <article className={`card ${cat.quiz.unlocked ? "" : "locked"}`}>
              <div className="status">
                <span className="badge"><b>Quiz {index + 1}</b></span>
              </div>
              <h3>{cat.quiz.title}</h3>
              <span className="pill">
                {cat.quiz.completed
                  ? "✅ Completado"
                  : cat.quiz.unlocked
                    ? "🔓 Disponible"
                    : "🔒 Bloqueado"}
              </span>
              <p className="subtitle">{cat.quiz.description}</p>
              <div className="actions">
                <button
                  className="action open"
                  disabled={!cat.quiz.unlocked || cat.quiz.completed}
                  onClick={() => openModal(cat, index)}
                >
                  <b>Responder</b>
                </button>
                <button
                  className="action view"
                  disabled={!cat.quiz.completed}
                  onClick={() => openResult(cat, index)}
                >
                  <b>Ver resultado</b>
                </button>
              </div>
            </article>
          </section>
        ))}

        <footer className="dock-footer">
          <nav className="dock">
            <a href="./home">👤</a>
            <a href="./setting">⚙️</a>
          </nav>&nbsp;&nbsp;
          <nav className="dock">
            <button onClick={handleLogout} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer" }}>❌</button>
          </nav>
        </footer>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} showConfetti={showConfetti}>
        {modalMode === "quiz" && QuizComponentToRender && (
          <QuizComponentToRender onResult={handleQuizCompletion} />
        )}
        {modalMode === "result" && activeQuiz && results[activeQuiz.quiz.id] && (
          <div className="message mt-6">
            <p><strong>Puntaje total:</strong> {results[activeQuiz.quiz.id].score}</p>
            <p><strong>{results[activeQuiz.quiz.id].interpretation}</strong></p>
          </div>
        )}
      </Modal>

      {showConfetti && (
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
