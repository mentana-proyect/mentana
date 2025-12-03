"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

import { questionConfig, styles, ButtonStyle } from "./config";

// =============================
//  COMPONENTE QuestionCard
// =============================
interface QuestionCardProps {
  question: string;
  options: { value: string; label: string }[];
  currentAnswer: string[];
  onChange: (value: string[]) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  currentAnswer,
  onChange,
}) => (
  <div style={{ ...styles.card, textAlign: "center" }}>
    <h2 style={{ ...styles.question, textAlign: "center" }}>{question}</h2>

    <div
      style={{
        ...styles.tagContainer,
        justifyContent: "center",
      }}
    >
      {options.map((opt) => {
        const selected = currentAnswer.includes(opt.value);

        const toggle = () => {
          if (selected) {
            onChange(currentAnswer.filter((v) => v !== opt.value));
          } else {
            onChange([...currentAnswer, opt.value]);
          }
        };

        return (
          <div
            key={opt.value}
            onClick={toggle}
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

// =============================
//  COMPONENTE PRINCIPAL
// =============================
export default function PreferenciasPsicologicas() {
  const router = useRouter();

  const initialAnswers = useMemo(() => {
    return questionConfig.reduce(
      (acc, q) => ({ ...acc, [q.field]: [] as string[] }),
      {}
    );
  }, []);

  const [answers, setAnswers] = useState<Record<string, string[]>>(initialAnswers);
  const [step, setStep] = useState(1);
  const stepsTotal = questionConfig.length;

  const handleChange = useCallback((field: string, value: string[]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const currentQuestionField = questionConfig[step - 1].field;
  const isCurrentAnswerSelected =
    answers[currentQuestionField] && answers[currentQuestionField].length > 0;

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
      alert("Error al guardar las preferencias. Por favor, inténtalo de nuevo.");
      return;
    }

    router.push("/home");
  };

  const currentQuestion = questionConfig[step - 1];
  const progress = (step / stepsTotal) * 100;

  return (
    <div style={{ ...styles.container, textAlign: "center" }}>
      <h1 style={{ ...styles.title, textAlign: "center" }}>
        Preferencias Psicológicas 🧠
      </h1>
      <p style={{ ...styles.subtitle, textAlign: "center" }}>
        Paso {step} de {stepsTotal}
      </p>

      {/* Barra de progreso */}
      <div
        style={{
          width: "100%",
          background: "#ddd",
          height: "10px",
          borderRadius: "5px",
          margin: "20px 0",
          overflow: "hidden", // asegura bordes limpios del gradiente
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


      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        currentAnswer={answers[currentQuestion.field]}
        onChange={(value) => handleChange(currentQuestion.field, value)}
      />

      {/* =============================
           BOTONES ALINEADOS IZQ / DER
         ============================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "30px",
        }}
      >
        {/* IZQUIERDA */}
        <div>
          {step > 1 && (
            <button onClick={back} style={ButtonStyle.back}>
              Atrás
            </button>
          )}
        </div>

        {/* DERECHA */}
        <div>
          {step < stepsTotal && (
            <button
              onClick={next}
              style={isCurrentAnswerSelected ? ButtonStyle.next : ButtonStyle.disabled}
              disabled={!isCurrentAnswerSelected}
            >
              Siguiente
            </button>
          )}

          {step === stepsTotal && (
            <button
              onClick={handleSubmit}
              style={isCurrentAnswerSelected ? ButtonStyle.submit : ButtonStyle.disabled}
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
