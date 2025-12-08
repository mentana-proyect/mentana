"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

export interface Phq9FormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const phq9Questions = [
  "1. ¿Te has sentido poco interesado/a o sin ganas de hacer cosas?",
  "2. ¿Te has sentido triste, deprimido/a o sin esperanza?",
  "3. ¿Has tenido dificultades para dormir o has dormido demasiado?",
  "4. ¿Te has sentido cansado/da o con poca energía?",
  "5. ¿Has tenido poco apetito o has comido en exceso?",
  "6. ¿Te has sentido mal contigo mismo/a o que eres un fracaso?",
  "7. ¿Has tenido dificultades para concentrarte?",
  "8. ¿Has sentido que tu vida no tiene sentido o que no vale la pena vivirla?",
];

const phq9Options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

export default function Phq9Form({ onComplete, onResult }: Phq9FormProps) {
  const [answers, setAnswers] = useState<number[]>(
    Array(phq9Questions.length).fill(-1)
  );
  const [loading, setLoading] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);

  const quizId = "depresion1";

  const handleAnswer = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number): string => {
    if (score <= 4)
      return "Depresión mínima. No se observan síntomas clínicamente significativos.";
    if (score <= 9)
      return "Depresión leve. Puede haber síntomas ocasionales, pero no suelen interferir con las actividades diarias.";
    if (score <= 14)
      return "Depresión moderada. Los síntomas pueden afectar el bienestar y el desempeño cotidiano.";
    if (score <= 19)
      return "Depresión moderadamente grave. Los síntomas tienen impacto importante en la vida diaria.";
    return "Depresión grave. Síntomas intensos que afectan la funcionalidad. Se recomienda apoyo profesional.";
  };

  // 🕒 Verificar si puede responder antes de 30 días
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
        const last = new Date(data.last_completed_at);
        const now = new Date();
        const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays < 30) setCanAnswer(false);
      }
    };

    checkLastAttempt();
  }, []);

  const calculateScore = async () => {
    if (!canAnswer) {
      alert("⏳ Solo puedes volver a responder este test después de 30 días.");
      return;
    }

    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
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

    // Guardar resultados históricos
    const { error: insertError } = await supabase
      .from("results_depresion")
      .insert([{ user_id: userId, answers, score: total, interpretation }]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar resultado.");
      setLoading(false);
      return;
    }

    // Actualizar progreso del quiz
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

    // 🔥 tipos seguros → evita errores TS
    onResult?.(total, interpretation);
    onComplete?.();

    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario PHQ-9</h1>
        <small>
          <i>
            Donde 0 = "Nunca", 1 = "Varios días", 2 = "Más de la mitad de los días", 3 = "Casi todos los días".
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
            {phq9Questions.map((q, i) => (
              <div key={i} className="form-group full-width">
                <p className="font-medium mb-3 text-left">{q}</p>

                <div className="options-row">
                  {phq9Options.map((opt) => (
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
