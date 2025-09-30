"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/general.css";

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

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (s: number) => {
    if (s <= 13) return "Nivel de estrés bajo";
    if (s <= 26) return "Nivel de estrés moderado";
    return "Nivel de estrés alto";
  };

  const calculateScore = async () => {
    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      return;
    }

    const total = answers.reduce((acc, val, index) => {
      const scoreValue = pss10Questions[index].isReversed ? 4 - val : val;
      return acc + scoreValue;
    }, 0);

    const interp = getInterpretation(total);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    // 1️⃣ Guardar respuestas en results_pss10
    const { error: insertError } = await supabase.from("results_estres").insert([
      { user_id: userId, answers, total, interpretation: interp },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_estres");
      setLoading(false);
      return;
    }
// 2️⃣ Actualizar progreso de depresion1
    const { error: updateEstresError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: false,
        completed: true,
        score: total,
        interpretation: interp,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "estres1");

     
    if (updateEstresError) {
      console.error(updateEstresError);
      alert("Error al actualizar progreso de ansiedad1");
      setLoading(false);
      return;
    }
    
// 3️⃣ Desbloquear depresión1
    const { error: unlockSoledadError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: true,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "soledad1");

    if (unlockSoledadError) {
      console.error(unlockSoledadError);
      alert("Error al desbloquear depresión1");
    }

    setLoading(false);

    // Callbacks opcionales
    if (onResult) onResult(total, interp);
    if (onComplete) onComplete();
  };

   

  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-6">Cuestionario PSS-10</h1>
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
      <button onClick={calculateScore} disabled={loading} className="btn btn-primary">
        {loading ? "Guardando..." : "Calcular resultado"}
      </button>
    </div>
  );
}
