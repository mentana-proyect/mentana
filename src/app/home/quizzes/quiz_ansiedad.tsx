"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

export interface Gad7FormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const gad7Questions = [
  "1. ¿Te has sentido nervioso/a, ansioso/a o al borde?",
  "2. ¿Te has preocupado demasiado por diferentes cosas?",
  "3. ¿Te ha costado relajarte?",
  "4. ¿Te has sentido inquieto/a o incapaz de quedarse quieto/a?",
  "5. ¿Te has sentido fácilmente irritable?",
  "6. ¿Has tenido miedo de que algo terrible pudiera pasar?",
  "7. ¿Has sentido que tu respiración se acelera sin razón aparente?",
  "8. ¿Has evitado situaciones por miedo a sentir ansiedad?",
];

const options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

export default function Gad7Form({
  onComplete,
  onResult,
}: Gad7FormProps) {
  
  const [answers, setAnswers] = useState<number[]>(
    Array(gad7Questions.length).fill(-1)
  );
  const [loading, setLoading] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);
  
  const quizId = "ansiedad1";

  const handleAnswer = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number) => {
    if (score <= 4)
      return "La ansiedad es baja. Probablemente no se requiere intervención clínica.";
    if (score <= 9)
      return "Síntomas leves de ansiedad. Observar si afectan la vida diaria.";
    if (score <= 14)
      return "Síntomas moderados. Considerar evaluación profesional.";
    return "Alta ansiedad. Se recomienda apoyo profesional.";
  };

  // 🕒 Verificar si puede volver a responder
  useEffect(() => {
    const checkLastAttempt = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("last_completed_at")
        .eq("user_id", userId)
        .eq("quiz_id", quizId)
        .single();

      if (error) return;

      if (data?.last_completed_at) {
        const lastDate = new Date(data.last_completed_at);
        const now = new Date();
        const diffDays =
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays < 30) setCanAnswer(false);
      }
    };

    checkLastAttempt();
  }, []);

  const calculateScore = async () => {
    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      return;
    }

    if (!canAnswer) {
      alert("⏳ Solo puedes volver a responder este test después de 30 días.");
      return;
    }

    const total = answers.reduce((acc, val) => acc + val, 0);
    const interpretation = getInterpretation(total);

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    // 1️⃣ Guardar histórico
    const { error: insertError } = await supabase
      .from("results_ansiedad")
      .insert([
        { user_id: userId, answers, score: total, interpretation },
      ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar resultado.");
      setLoading(false);
      return;
    }

    // 2️⃣ Actualizar progreso
    const { error: progressError } = await supabase
      .from("quiz_progress")
      .upsert(
        {
          user_id: userId,
          quiz_id: quizId,
          completed: true,
          unlocked: true,
          score: total,
          interpretation,
          last_completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,quiz_id" }
      );

    if (progressError) {
      console.error(progressError);
      alert("Error al actualizar el progreso del quiz.");
      setLoading(false);
      return;
    }

    setLoading(false);

    // 👇👇👇 FIX del error:
    onResult?.(total, interpretation);
    onComplete?.();

    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario GAD-7</h1>
        <small>
          <i>
            Donde 0 es "Nunca", 1 es "Varios días", 2 es "Más de la mitad de los días" y 3 es "Casi todos los días".
          </i>
        </small>
      </div>

      {!canAnswer ? (
        <p className="text-center text-red-500 font-medium mt-4">
          ⏳ Ya completaste este cuestionario hace menos de 30 días.
          Podrás volver a responderlo más adelante.
        </p>
      ) : (
        <>
          <form>
            {gad7Questions.map((q, i) => (
              <div key={i} className="form-group full-width">
                <p className="font-medium mb-3 text-left">{q}</p>

                <div className="options-row">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`option-btn ${
                        answers[i] === opt.value ? "selected" : ""
                      }`}
                      onClick={() => handleAnswer(i, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </form>

          <button
            type="button"
            onClick={calculateScore}
            disabled={loading}
            className="calculate-row"
          >
            {loading ? "Guardando..." : "Calcular"}
          </button>
        </>
      )}

      <br />
      <Footer />
    </div>
  );
}
