"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ProgressHeaderPreferences from "../../../components/ProgressHeaderPreferences";
import { questionConfig, styles, ButtonStyle } from "./config";

/* =========================================
   TIPOS DEL COMPONENTE QUESTION CARD
========================================= */
interface QuestionCardProps {
  question: string;
  options: { value: string; label: string }[];
  currentAnswer: string[];
  onChange: (value: string[]) => void;
}

/* =========================================
   COMPONENTE QUESTION CARD
========================================= */
function QuestionCard({
  question,
  options,
  currentAnswer,
  onChange,
}: QuestionCardProps) {
  const toggle = (value: string) => {
    onChange(
      currentAnswer.includes(value)
        ? currentAnswer.filter((v) => v !== value)
        : [...currentAnswer, value]
    );
  };

  return (
    <div style={{ ...styles.card, textAlign: "center" }}>
      <h2 style={{ ...styles.questcardion, textAlign: "center" }}>{question}</h2>
      

      <div style={{ ...styles.tagContainer, justifyContent: "center" }}>
        {options.map((opt) => {
          const selected = currentAnswer.includes(opt.value);

          return (
            <div
              key={opt.value}
              onClick={() => toggle(opt.value)}
              style={{
                ...styles.tag,
                ...(selected ? styles.tagSelected : {}),
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */
export default function PreferenciasPsicologicas() {
  const router = useRouter();

  // Inicializar respuestas
  const initialAnswers = useMemo(() => {
    return questionConfig.reduce(
      (acc, q) => ({ ...acc, [q.field]: [] as string[] }),
      {}
    );
  }, []);

  const [answers, setAnswers] =
    useState<Record<string, string[]>>(initialAnswers);

  const [step, setStep] = useState(1);
  const stepsTotal = questionConfig.length;

  // Actualizar respuestas
  const handleChange = useCallback((field: string, value: string[]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Navegación
  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  // Validación
  const currentQuestionField = questionConfig[step - 1].field;
  const isCurrentAnswerSelected =
    answers[currentQuestionField] &&
    answers[currentQuestionField].length > 0;

  // Guardar en Supabase
  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesión no encontrada. Redirigiendo...");
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("psych_preferences").insert({
      user_id: user.id,
      ...answers,
    });

    if (error) {
      console.error("Error guardando preferencias:", error);
      alert("Error al guardar las preferencias. Por favor, inténtalo nuevamente.");
      return;
    }

    router.push("/home");
  };

  const currentQuestion = questionConfig[step - 1];
  const progress = (step / stepsTotal) * 100;

  return (
    <div style={{ ...styles.container, textAlign: "center" }}>
      <ProgressHeaderPreferences />

      {/* Barra de progreso */}
      <div
        style={{
          width: "100%",
          background: "#ddd",
          height: "10px",
          borderRadius: "5px",
          margin: "20px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #ff8cd3, #56dbc4)",
            height: "100%",
            borderRadius: "5px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Tarjeta */}
      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        currentAnswer={answers[currentQuestion.field]}
        onChange={(value) => handleChange(currentQuestion.field, value)}
      />

      {/* Botones alineados */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "30px",
        }}
      >
        {/* Izquierda */}
        <div>
          {step > 1 && (
            <button onClick={back} style={ButtonStyle.back}>
              Atrás
            </button>
          )}
        </div>

        {/* Derecha */}
        <div>
          {step < stepsTotal && (
            <button
              onClick={next}
              style={
                isCurrentAnswerSelected
                  ? ButtonStyle.next
                  : ButtonStyle.disabled
              }
              disabled={!isCurrentAnswerSelected}
            >
              Siguiente
            </button>
          )}

          {step === stepsTotal && (
            <button
              onClick={handleSubmit}
              style={
                isCurrentAnswerSelected
                  ? ButtonStyle.submit
                  : ButtonStyle.disabled
              }
              disabled={!isCurrentAnswerSelected}
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
