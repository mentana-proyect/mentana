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
  "1. ¿Te has sentido solo/a incluso estando acompañado/da?",
  "2. ¿Sientes que no tienes con quién hablar de lo que realmente te importa?",
  "3. ¿Te has sentido excluido/a o desconectado/a de los demás?",
  "4. ¿Sientes que no formas parte de ningún grupo o comunidad?",
  "5. ¿Te cuesta encontrar personas que te entiendan?",
  "6. ¿Sientes que tu presencia no es valorada por otros?",
  "7. ¿Has sentido que nadie se preocupa por ti de verdad?",
  "8. ¿Te has sentido invisible o ignorado/a?",
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

  const quizId = "soledad1";

  const handleAnswer = (qIndex: number, value: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIndex] = value;
      return updated;
    });
  };

  const getInterpretation = (score: number) => {
    if (score <= 5)
      return "Ausencia de soledad o soledad leve. Probablemente se siente conectado socialmente y satisfecha/o con sus relaciones.";

    if (score <= 8)
      return "Soledad moderada. Puede experimentar sentimientos de aislamiento ocasional. Se recomienda fortalecer la red social y actividades de conexión.";

    return "Soledad grave. Es posible que se sienta muy aislado o desconectado de los demás. Se sugiere buscar apoyo social y profesional si es necesario.";
  };

  // Verificar si ya respondió dentro de los últimos 30 días
  useEffect(() => {
    const checkLastAttempt = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from("quiz_progress")
        .select("last_completed_at")
        .eq("user_id", userId)
        .eq("quiz_id", quizId)
        .single();

      if (data?.last_completed_at) {
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

    // Guardar resultado histórico
    const { error: insertError } = await supabase.from("results_soledad").insert([
      { user_id: userId, answers, score: total, interpretation },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_soledad");
      setLoading(false);
      return;
    }

    // Actualizar progreso general
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

    // Uso seguro de callbacks opcionales
    onResult?.(total, interpretation);
    onComplete?.();

    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario UCLA</h1>
        <small>
          <i>
            Donde 1 es "Nunca", 2 es "A veces" y 3 es "Casi siempre".
          </i>
        </small>
      </div>

      {!canAnswer ? (
        <p className="text-center text-red-500 font-medium mt-4">
          ⏳ Ya completaste este cuestionario hace menos de 30 días.
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

          <button
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
