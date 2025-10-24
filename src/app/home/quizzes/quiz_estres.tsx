"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

interface Pss10FormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const pss10Questions = [
  { q: "1. En el último mes, ¿con qué frecuencia se ha sentido molesto/a por algo que ocurrió inesperadamente?", isReversed: false },
  { q: "2. En el último mes, ¿con qué frecuencia sintió que no podía controlar las cosas importantes en su vida?", isReversed: false },
  { q: "3. En el último mes, ¿con qué frecuencia se sintió nervioso/a y lleno/a de tensión?", isReversed: false },
  { q: "4. En el último mes, ¿con qué frecuencia sintió confianza en poder manejar sus problemas personales?", isReversed: true },
  { q: "5. En el último mes, ¿con qué frecuencia sintió que las cosas estaban sucediendo de manera favorable para usted?", isReversed: true },
  { q: "6. En el último mes, ¿con qué frecuencia sintió que no podía hacer frente a todas las cosas que tenía que hacer?", isReversed: false },
  { q: "7. En el último mes, ¿con qué frecuencia pudo controlar los disgustos en su vida?", isReversed: true },
  { q: "8. En el último mes, ¿con qué frecuencia sintió que tenía todo bajo control?", isReversed: true },
  { q: "9. En el último mes, ¿con qué frecuencia se enojó por cosas que estaban fuera de su control?", isReversed: false },
  { q: "10. En el último mes, ¿con qué frecuencia sintió que tenía tantas dificultades que no podía superarlas?", isReversed: false },
];

const pss10Options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
];

export default function Pss10Form({ onComplete, onResult }: Pss10FormProps) {
  const [answers, setAnswers] = useState<number[]>(Array(pss10Questions.length).fill(-1));
  const [loading, setLoading] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);

  const quizId = "estres1"; // identificador único del quiz

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number) => {
    if (score <= 13) return "Nivel de estrés bajo";
    if (score <= 26) return "Nivel de estrés moderado";
    return "Nivel de estrés alto";
  };

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

      if (!error && data?.last_completed_at) {
        const lastDate = new Date(data.last_completed_at);
        const diffDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
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

    const total = answers.reduce((acc, val, index) => acc + (pss10Questions[index].isReversed ? 4 - val : val), 0);
    const interpretation = getInterpretation(total);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    // Guardar resultado histórico
    const { error: insertError } = await supabase.from("results_estres").insert([
      { user_id: userId, answers, score: total, interpretation },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_estres");
      setLoading(false);
      return;
    }

    // Actualizar progreso general (upsert)
    const { error: updateError } = await supabase.from("quiz_progress").upsert(
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
      alert("Error al actualizar progreso de estres1");
    }

    setLoading(false);
    if (onResult) onResult(total, interpretation);
    if (onComplete) onComplete();
    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario PSS-10</h1>
        <small>
          <i>
            Donde 0 es "Nunca", 1 es "Casi nunca", 2 es "A veces", 3 es "Bastante seguido" y 4 es "Muy a menudo".
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
            {pss10Questions.map((q, qIndex) => (
              <div key={qIndex} className="form-group full-width">
                <p className="font-medium mb-3 text-left">{q.q}</p>
                <div className="options-row">
                  {pss10Options.map((opt) => (
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
