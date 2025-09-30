"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/general.css";

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
  const [answers, setAnswers] = useState<number[]>(
    Array(phq9Questions.length).fill(-1)
  );
  const [loading, setLoading] = useState(false);

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (s: number) => {
    if (s <= 4) return "Depresión mínima";
    if (s <= 9) return "Depresión leve";
    if (s <= 14) return "Depresión moderada";
    if (s <= 19) return "Depresión moderadamente grave";
    return "Depresión grave";
  };

  const calculateScore = async () => {
    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      return;
    }

    const total = answers.reduce((acc, val) => acc + val, 0);
    const interp = getInterpretation(total);

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    // 1️⃣ Guardar respuestas en results_phq9
    const { error: insertError } = await supabase.from("results_phq9").insert([
      {
        user_id: userId,
        answers,
        total,
        interpretation: interp,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_phq9");
      setLoading(false);
      return;
    }

    // 2️⃣ Actualizar progreso de depresion1
    const { error: updateDepresionError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: false,
        completed: true,
        score: total,
        interpretation: interp,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "depresion1");

     
    if (updateDepresionError) {
      console.error(updateDepresionError);
      alert("Error al actualizar progreso de ansiedad1");
      setLoading(false);
      return;
    }

// 3️⃣ Desbloquear depresión1
    const { error: unlockDepresionError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: true,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "estres1");

    if (unlockDepresionError) {
      console.error(unlockDepresionError);
      alert("Error al desbloquear depresión1");
    }

    setLoading(false);

    // Callbacks opcionales
    if (onResult) onResult(total, interp);
    if (onComplete) onComplete();
  };
  
  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-6">Cuestionario PHQ-9</h1>
      <form>
        {phq9Questions.map((q, qIndex) => (
          <div key={qIndex} className="form-group full-width">
            <p className="font-medium mb-3 text-left">{q}</p>
            <div className="options-row">
              {phq9Options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${
                    answers[qIndex] === opt.value ? "selected" : ""
                  }`}
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
        className="btn btn-primary"
      >
        {loading ? "Guardando..." : "Calcular resultado"}
      </button>
    </div>
  );
}
