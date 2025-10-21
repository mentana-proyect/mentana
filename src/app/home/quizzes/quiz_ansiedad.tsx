"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/general.css";
import Footer from "../../../components/Footer";

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
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const getInterpretation = (score: number) => {
    if (score <= 4) return "La ansiedad es baja! probablemente no se requiere intervención clínica.";
    if (score <= 9) return "Puede haber síntomas de ansiedad, observar y evaluar si afectan la vida diaria.";
    if (score <= 14) return "Síntomas de ansiedad significativos, considerar evaluación profesional.";
    return "Ansiedad alta! considerar evaluación y tratamiento profesional.";
  };

  const calculateScore = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    if (answers.includes(-1)) {
      alert("Por favor responde todas las preguntas antes de continuar.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const total = answers.reduce((acc, val) => acc + val, 0);
    const interpretation = getInterpretation(total);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      alert("⚠️ Usuario no autenticado.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // --- Prevención de doble inserción ---
    const recentAttempt = await supabase
      .from("quiz_progress")
      .select("*")
      .eq("user_id", userId)
      .like("quiz_id", "ansiedad%")
      .order("completed_at", { ascending: false })
      .limit(1);

    if (recentAttempt.data?.length) {
      const last = new Date(recentAttempt.data[0].completed_at).getTime();
      const now = new Date().getTime();
      if (now - last < 2000) {
        alert("⏱ Espera un momento antes de intentar de nuevo.");
        setLoading(false);
        setIsSubmitting(false);
        return;
      }
    }

    // Guardar resultados en results_ansiedad
    const { error: insertError } = await supabase.from("results_ansiedad").insert([
      { user_id: userId, answers, total, interpretation },
    ]);

    if (insertError) {
      console.error(insertError);
      alert("Error al guardar el resultado en results_ansiedad");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Contar quizzes previos para generar quiz_id
    const { count, error: countError } = await supabase
      .from("quiz_progress")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .like("quiz_id", "ansiedad%");

    if (countError) {
      console.error(countError);
      alert("Error al obtener el número de intentos previos");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const newQuizId = `ansiedad${(count ?? 0) + 1}`;

    // Insertar en quiz_progress
    const { error: progressError } = await supabase.from("quiz_progress").insert([
      {
        user_id: userId,
        quiz_id: newQuizId,
        completed: true,
        unlocked: true,
        completed_at: new Date().toISOString(),
        score: total,
        interpretation,
      },
    ]);

    if (progressError) {
      console.error(progressError);
      alert("Error al registrar el progreso del quiz");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    setLoading(false);
    setIsSubmitting(false);

    if (onResult) onResult(total, interpretation);
    if (onComplete) onComplete();

    alert(`✅ Resultado guardado correctamente (ID: ${newQuizId})`);
  };

  return (
    <div className="page">
      <div className="fixed-header-container">
        <h1 className="text-2xl font-bold mb-6">Cuestionario GAD-7</h1>
        <small>
          <i>
            Donde 0 es &quot;Nunca&quot;, 1 es &quot;Varios días&quot;, 2 es &quot;Más de la mitad de los días&quot; y 3 es &quot;Casi todos los días&quot;.
          </i>
        </small>
      </div>

      <form>
        {gad7Questions.map((q, i) => (
          <div key={i} className="form-group full-width">
            <p className="font-medium mb-3 text-left">{q}</p>
            <div className="options-row">
              {options.map((opt) => (
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
        disabled={loading || isSubmitting}
        className="calculate-row"
      >
        {loading ? "Guardando..." : "Calcular"}
      </button>

      <br />
      <Footer />
    </div>
  );
}
