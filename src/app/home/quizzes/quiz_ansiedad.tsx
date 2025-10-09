"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import "../../../styles/general.css";

interface Gad7FormProps {
  onComplete?: () => void;
  onResult?: (score: number, interpretation: string) => void;
}

const gad7Questions = [
  "1. ¿Con qué frecuencia se ha sentido nervioso, ansioso o con los nervios de punta?",
  "2. ¿Con qué frecuencia no ha podido dejar de preocuparse o controlar la preocupación?",
  "3. ¿Con qué frecuencia se ha preocupado demasiado por diferentes cosas?",
  "4. ¿Con qué frecuencia ha tenido dificultad para relajarse?",
  "5. ¿Con qué frecuencia se ha sentido tan inquieto que le resulta difícil permanecer quieto?",
  "6. ¿Con qué frecuencia se ha molestado o irritado con facilidad?",
  "7. ¿Con qué frecuencia ha sentido miedo como si algo terrible pudiera pasar?"
];

const options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 }
];

export default function Gad7Form({ onComplete, onResult }: Gad7FormProps) {
  const [answers, setAnswers] = useState<number[]>(Array(gad7Questions.length).fill(-1));
  const [score, setScore] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnswer = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const getInterpretation = (s: number) => {
    if (s <= 4) return "Ansiedad mínima";
    if (s <= 9) return "Ansiedad leve";
    if (s <= 14) return "Ansiedad moderada";
    return "Ansiedad grave";
  };

  const calculateScore = async () => {
    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      return;
    }

    const total = answers.reduce((acc, val) => acc + val, 0);
    const interp = getInterpretation(total);

    setScore(total);
    setInterpretation(interp);
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

    const { error: insertError } = await supabase.from("results_ansiedad").insert([
      {
        user_id: userId,
        answers,
        total,
        interpretation: interp,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_ansiedad");
      setLoading(false);
      return;
    }

    const { error: updateAnsiedadError } = await supabase
      .from("quiz_progress")
      .update({
        unlocked: false,
        completed: true,
        score: total,
        interpretation: interp,
      })
      .eq("user_id", userId)
      .eq("quiz_id", "ansiedad1");

    if (updateAnsiedadError) {
      console.error(updateAnsiedadError);
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
      .eq("quiz_id", "depresion1");

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
   
    {/* 🎯 Nuevo Contenedor para el Encabezado Fijo */}
   <div className="fixed-header-container">
      <h1 className="text-2xl font-bold mb-6">Cuestionario GAD-7</h1>
       <small><i>Donde 0 es &quot;Nunca&quot;, 1 es &quot;Varios días&quot;, 2 es &quot;Más de la mitad de los días&quot;y 3 es &quot;Casi todos los días&quot;.</i></small>
     </div>
     <form>
        
        {gad7Questions.map((q, qIndex) => (
          <div key={qIndex} className="form-group full-width">
            <p className="font-medium mb-3 text-left">{q}</p>
            <div className="options-row">
              {options.map((opt) => (
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
    </div>
  );
}
