"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ProgressHeaderPreferences from "../../../components/ProgressHeaderPreferences";
import { questionConfig, styles, ButtonStyle } from "./config";

/* =========================================
   MARCO HEADER + PROGRESO
========================================= */
const frameStyle: React.CSSProperties = {
  gridColumn: "span 12",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  padding: "16px",
  position: "relative",
  overflow: "hidden",
  flex: "0 0 100%",
  scrollSnapAlign: "start",
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
};

/* =========================================
   TIPOS QUESTION CARD
========================================= */
interface QuestionCardProps {
  question: string;
  options: { value: string; label: string }[];
  currentAnswer: string[];
  onChange: (value: string[]) => void;
}

/* =========================================
   QUESTION CARD
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
      <h2 style={{ ...styles.questcardion, textAlign: "center" }}>
        {question}
      </h2>

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

  const handleChange = useCallback((field: string, value: string[]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const currentQuestionField = questionConfig[step - 1].field;
  const isCurrentAnswerSelected =
    answers[currentQuestionField]?.length > 0;

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
      alert("Error al guardar las preferencias");
      return;
    }

    router.push("/home");
  };

  const currentQuestion = questionConfig[step - 1];
  const progress = (step / stepsTotal) * 100;

  return (
    <div style={{ ...styles.container, textAlign: "center" }}>
      {/* MARCO */}
      <div style={{ ...frameStyle, marginBottom: "15px" }}>
        <ProgressHeaderPreferences />

        {/* Barra de progreso */}
        <div
          style={{
            width: "100%",
            background: "#ddd",
            height: "10px",
            borderRadius: "5px",
            marginTop: "20px",
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
      </div>

      {/* TARJETA PREGUNTA (FUERA DEL MARCO) */}
      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        currentAnswer={answers[currentQuestion.field]}
        onChange={(value) => handleChange(currentQuestion.field, value)}
      />

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "30px",
          gridColumn: "span 12",
        }}
      >
        <div>
          {step > 1 && (
            <button onClick={back} style={ButtonStyle.back}>
              Atrás
            </button>
          )}
        </div>

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
