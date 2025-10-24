"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

interface UclaFormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const uclaQuestions = [
  "1. ¿Con qué frecuencia siente que le falta compañía?",
  "2. ¿Con qué frecuencia se siente excluido?",
  "3. ¿Con qué frecuencia se siente aislado de los demás?",
];

const uclaOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

export default function UclaForm({ onComplete, onResult }: UclaFormProps) {
  const [answers, setAnswers] = useState<number[]>(Array(uclaQuestions.length).fill(-1));
  const [loading, setLoading] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);

  const quizId = "soledad1"; // identificador único del quiz

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number) => {
    if (score <= 5) return "Ausencia de soledad o soledad leve";
    if (score <= 8) return "Soledad moderada";
    return "Soledad grave";
  };

  // 🕒 Verificar si el usuario puede volver a responder
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
        const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 30) {
          setCanAnswer(false);
        }
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

    // ✅ Guardar resultado histórico
    const { error: insertError } = await supabase.from("results_soledad").insert([
      { user_id: userId, answers, score: total, interpretation },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_soledad");
      setLoading(false);
      return;
    }

    // ✅ Actualizar progreso general (upsert)
    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error(updateError);
      alert("Error al actualizar progreso de soledad1");
    }

    setLoading(false);
    if (onResult) onResult(total, interpretation);
    if (onComplete) onComplete();
    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario UCLA</h1>
        <small>
          <i>Donde 1 es &quot;Nunca&quot;, 2 es &quot;A veces&quot; y 3 es &quot;Casi siempre&quot;.</i>
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
            {uclaQuestions.map((q, qIndex) => (
              <div key={qIndex} className="form-group full-width">
                <p className="font-medium mb-3 text-left">{q}</p>
                <div className="options-row">
                  {uclaOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`option-btn ${answers[qIndex] === opt.value ? "selected" : ""}`}
                      onClick={() => handleAnswer(qIndex, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </form>

          <button onClick={calculateScore} disabled={loading} className="calculate-row">
            {loading ? "Guardando..." : "Calcular"}
          </button>
        </>
      )}

      <br />
      <Footer />
    </div>
  );
}
