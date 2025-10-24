"use client";
import React, { useState, useEffect } from "react";
import { Category } from "../components/useProgress";
import { supabase } from "../lib/supabaseClient";

interface Props {
  cat: Category;
  index: number;
  openModal: (cat: Category, index: number) => void;
  openResult: (cat: Category, index: number) => void;
  openRecomendacion: (cat: Category, index: number) => void;
  refreshTrigger?: number; // 🔹 se actualiza desde el padre al completar el quiz
}

const QuizCard: React.FC<Props> = ({
  cat,
  index,
  openModal,
  openResult,
  openRecomendacion,
  refreshTrigger = 0,
}) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLastAttempt = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("last_completed_at")
        .eq("user_id", userId)
        .eq("quiz_id", cat.quiz.id)
        .order("last_completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error al obtener último intento:", error.message || error);
        return;
      }

      if (data?.last_completed_at) {
        setHasResult(true);
        const lastDate = new Date(data.last_completed_at);
        const diffMs = new Date().getTime() - lastDate.getTime();
        const remainingDays = 30 - Math.floor(diffMs / (1000 * 60 * 60 * 24));
        setDaysLeft(remainingDays > 0 ? remainingDays : 0);
      } else {
        setHasResult(false);
        setDaysLeft(null);
      }

      setLoading(false);
    };

    fetchLastAttempt();
  }, [cat.quiz.id, refreshTrigger]);

  // 🔹 Lógica de botones según el estado del quiz
  let showResponder = true;
  let disableResponder = false;

  let showResult = true;
  let disableResult = false;

  let showRecomendacion = false;
  let disableRecomendacion = false;

  if (!hasResult) {
    // Nunca respondió
    showResponder = true;
    disableResponder = false;

    showResult = true;
    disableResult = true;

    showRecomendacion = false;
  } else if (daysLeft !== null && daysLeft > 0) {
    // Respondido hace <30 días
    showResponder = false;

    showResult = true;
    disableResult = false;

    showRecomendacion = true;
    disableRecomendacion = false;
  } else {
    // Respondido hace ≥30 días
    showResponder = true;
    disableResponder = false;

    showResult = true;
    disableResult = false;

    showRecomendacion = false;
  }

  const quizStatus = !hasResult
    ? "✅ Disponible"
    : daysLeft && daysLeft > 0
    ? `⏳ Disponible en ${daysLeft} día${daysLeft > 1 ? "s" : ""}`
    : "✅ Disponible";

  return (
    <section key={cat.name} className="grid">
      <article className="card-content">
        <h2>{cat.quiz.title}</h2>
        <span className="pill">{quizStatus}</span>
        <p className="subtitle">{cat.quiz.description}</p>

        <div className="actions">
          {showResponder && (
            <button
              className="action open"
              onClick={() => openModal(cat, index)}
              disabled={disableResponder}
              style={{
                opacity: disableResponder ? 0.6 : 1,
                cursor: disableResponder ? "not-allowed" : "pointer",
              }}
            >
              <b>Responder</b>
            </button>
          )}

          {showResult && (
            <button
              className="action view"
              onClick={() => !disableResult && openResult(cat, index)}
              disabled={disableResult}
              style={{
                opacity: disableResult ? 0.6 : 1,
                cursor: disableResult ? "not-allowed" : "pointer",
              }}
            >
              <b>Resultado</b>
            </button>
          )}

          {showRecomendacion && (
            <button
              className="action recomendacion"
              onClick={() => !disableRecomendacion && openRecomendacion(cat, index)}
              disabled={disableRecomendacion}
              style={{
                opacity: disableRecomendacion ? 0.6 : 1,
                cursor: disableRecomendacion ? "not-allowed" : "pointer",
              }}
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
