"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

interface Phq9FormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const phq9Questions = [
  "1. ¿Poco interés o placer en hacer las cosas?",
  "2. ¿Sentirse decaído/a, deprimido/a o sin esperanzas?",
  "3. ¿Dificultad para dormir o permanecer dormido/a, o ha dormido demasiado?",
  "4. ¿Sentirse cansado/a o con poca energía?",
  "5. ¿Poco apetito o comer en exceso?",
  "6. ¿Sentirse mal con usted mismo/a, o sentir que es un fracaso o que ha decepcionado a su familia?",
  "7. ¿Dificultad para concentrarse en cosas, como leer el periódico o ver la televisión?",
  "8. ¿Moverse o hablar tan lentamente que otras personas podrían notarlo? O lo contrario, estar tan inquieto/a que se ha estado moviendo mucho más de lo normal?",
  "9. ¿Ha tenido pensamientos de que estaría mejor muerto/a, o de lastimarse de alguna manera?",
];

const phq9Options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

export default function Phq9Form({ onComplete, onResult }: Phq9FormProps) {
  const [answers, setAnswers] = useState<number[]>(Array(phq9Questions.length).fill(-1));
  const [loading, setLoading] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);

  const quizId = "depresion1"; // identificador único del quiz

  const handleAnswer = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number) => {
    if (score <= 4) return "Depresión mínima";
    if (score <= 9) return "Depresión leve";
    if (score <= 14) return "Depresión moderada";
    if (score <= 19) return "Depresión moderadamente grave";
    return "Depresión grave";
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

      if (error) return; // no existe → puede responder

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

    // ✅ 1. Guardar resultado histórico
    const { error: insertError } = await supabase.from("results_depresion").insert([
      { user_id: userId, answers, score: total, interpretation },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar resultado.");
      setLoading(false);
      return;
    }

    // ✅ 2. Actualizar progreso general (upsert evita duplicados)
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
    if (onResult) onResult(total, interpretation);
    if (onComplete) onComplete();
    alert("✅ Resultado guardado correctamente.");
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario PHQ-9</h1>
        <small>
          <i>
            Donde 0 es &quot;Nunca&quot;, 1 es &quot;Varios días&quot;, 2 es &quot;Más de la mitad de los días&quot; y 3 es &quot;Casi todos los días&quot;.
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
                      className={`option-btn ${answers[i] === opt.value ? "selected" : ""}`}
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
