"use client";
import React, { useState, useEffect } from "react";
import { Category } from "../components/useProgress";
import { supabase } from "../lib/supabaseClient";

interface Props {
  cat: Category;
  index: number;
  openModal: (cat: Category, index: number) => void;
  openResult: (
    cat: Category,
    index: number,
    result: { score: number; interpretation: string }
  ) => void;
  openRecomendacion: (cat: Category, index: number) => void;
  refreshTrigger?: number; // 🌟 se incrementa cuando se completa un quiz
}

type ButtonState = {
  responder: { show: boolean; disabled: boolean };
  resultado: { show: boolean; disabled: boolean };
  recomendacion: { show: boolean; disabled: boolean };
};

const QuizCard: React.FC<Props> = ({
  cat,
  index,
  openModal,
  openResult,
  openRecomendacion,
  refreshTrigger = 0,
}) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    interpretation: string;
  } | null>(null);

  // 🔁 Estado interno para forzar actualización al completar quiz
  const [quizVersion, setQuizVersion] = useState(0);

  const [buttonState, setButtonState] = useState<ButtonState>({
    responder: { show: false, disabled: false },
    resultado: { show: false, disabled: false },
    recomendacion: { show: false, disabled: false },
  });

  /* ======================================================
     1️⃣ Convertir refreshTrigger externo en estado interno
     ====================================================== */
  useEffect(() => {
    if (refreshTrigger > 0) {
      setQuizVersion((v) => v + 1);
    }
  }, [refreshTrigger]);

  /* ======================================================
     2️⃣ Obtener último intento (re-ejecuta al completar quiz)
     ====================================================== */
  useEffect(() => {
    const fetchLastAttempt = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("score, interpretation, last_completed_at")
        .eq("user_id", user.id)
        .eq("quiz_id", cat.quiz.id)
        .order("last_completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error al obtener último intento:", error);
        return;
      }

      if (data) {
        setHasResult(true);
        setLastResult({
          score: data.score,
          interpretation: data.interpretation,
        });

        const lastDate = new Date(data.last_completed_at);
        const diffMs = Date.now() - lastDate.getTime();
        const remainingDays =
          30 - Math.floor(diffMs / (1000 * 60 * 60 * 24));

        setDaysLeft(remainingDays > 0 ? remainingDays : 0);
      } else {
        setHasResult(false);
        setLastResult(null);
        setDaysLeft(null);
      }
    };

    fetchLastAttempt();
  }, [cat.quiz.id, quizVersion]);

  /* ======================================================
     3️⃣ Calcular estados de botones
     ====================================================== */
  useEffect(() => {
    const state: ButtonState = {
      responder: { show: false, disabled: false },
      resultado: { show: true, disabled: false },
      recomendacion: { show: false, disabled: true },
    };

    if (!hasResult) {
      state.responder = { show: true, disabled: false };
      state.resultado = { show: true, disabled: true };
      state.recomendacion = { show: false, disabled: true };
    } else if (daysLeft && daysLeft > 0) {
      state.responder = { show: false, disabled: true };
      state.resultado = { show: true, disabled: false };
      state.recomendacion = { show: true, disabled: false };
    } else {
      state.responder = { show: true, disabled: false };
      state.resultado = { show: true, disabled: false };
      state.recomendacion = { show: false, disabled: true };
    }

    setButtonState(state);
  }, [hasResult, daysLeft]);

  const quizStatus = !hasResult
    ? "✅ Disponible"
    : daysLeft && daysLeft > 0
    ? `⏳ Disponible en ${daysLeft} día${daysLeft > 1 ? "s" : ""}`
    : "✅ Disponible";

  /* ======================================================
     4️⃣ Render
     ====================================================== */
  return (
    <section className="grid">
      <article className="card-content">
        <h2>{cat.quiz.title}</h2>
        <span className="pill">{quizStatus}</span>
        <p className="subtitle">{cat.quiz.description}</p>

        <div className="actions">
          {buttonState.responder.show && (
            <button
              className="action open"
              onClick={() => openModal(cat, index)}
              disabled={buttonState.responder.disabled}
            >
              <b>Responder</b>
            </button>
          )}

          {buttonState.resultado.show && (
            <button
              className="action view"
              onClick={() =>
                lastResult && openResult(cat, index, lastResult)
              }
              disabled={buttonState.resultado.disabled}
            >
              <b>Resultado</b>
            </button>
          )}

          {buttonState.recomendacion.show && (
            <button
              className="action recomendacion"
              onClick={() => openRecomendacion(cat, index)}
              disabled={buttonState.recomendacion.disabled}
            >
              <b>Recomendación</b>
            </button>
          )}
        </div>
      </article>
    </section>
  );
};

export default QuizCard;
