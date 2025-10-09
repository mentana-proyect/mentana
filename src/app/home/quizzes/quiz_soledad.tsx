"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";

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

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (s: number) => {
    if (s <= 5) return "Ausencia de soledad o soledad leve";
    if (s <= 8) return "Soledad moderada";
    return "Soledad grave";
  };

  const calculateScore = async () => {
    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      return;
    }

    const total = answers.reduce((acc, val) => acc + val, 0);
    const interp = getInterpretation(total);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    // Guardar respuestas en results_ucla
    const { error: insertError } = await supabase.from("results_soledad").insert([
      { user_id: userId, answers, total, interpretation: interp },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_soledad");
      setLoading(false);
      return;
    }
// 2️⃣ Actualizar progreso de depresion1
    const { error: updateError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: false,
        completed: true,
        score: total,
        interpretation: interp,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "soledad1");

     
    if (updateError) {
      console.error(updateError);
      alert("Error al actualizar progreso de ansiedad1");
      setLoading(false);
      return;
    }
    

    setLoading(false);

    if (onResult) onResult(total, interp);
    if (onComplete) onComplete();
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
      <h1 className="text-2xl font-bold mb-6">Cuestionario UCLA</h1>
       <small><i>Donde 0 es &quot;Nunca&quot;, 1 es &quot;Varios días&quot;, 2 es &quot;Más de la mitad de los días&quot; y 3 es &quot;Casi todos los días&quot;.</i></small>
     </div>
      
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
      <button onClick={calculateScore} disabled={loading} className="btn btn-primary">
        {loading ? "Guardando..." : "Calcular resultado"}
      </button>
    </div>
  );
}
