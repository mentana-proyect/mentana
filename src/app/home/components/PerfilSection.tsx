"use client";
import React from "react";
import { Category } from "../../../components/useProgress";

interface QuizResult {
  score: number;
  interpretation: string;
}

interface Props {
  categories: Category[];
  results: Record<string, QuizResult>;
  setResults: React.Dispatch<
    React.SetStateAction<Record<string, QuizResult>>
  >;
  refreshTrigger: number;
  logout: () => void;

  openQuizModal: (cat: Category) => void;
  openResultModal: (id: string) => void;
  openRecommendModal: (id: string) => void;
}

const PerfilSection: React.FC<Props> = ({
  categories,
  results,
  logout,
  openQuizModal,
  openResultModal,
  openRecommendModal,
}) => {
  return (
    <section>
      {categories.map((cat) => {
        const quizId = cat.quiz.id;
        const hasResult = Boolean(results[quizId]);

        return (
          <div key={quizId}>
            {/* ✅ ACCESO CORRECTO */}
            <h3>{cat.quiz.title}</h3>

            <button onClick={() => openQuizModal(cat)}>
              Iniciar Quiz
            </button>

            {hasResult && (
              <>
                <button onClick={() => openResultModal(quizId)}>
                  Ver Resultado
                </button>

                <button onClick={() => openRecommendModal(quizId)}>
                  Recomendaciones
                </button>
              </>
            )}
          </div>
        );
      })}

      <button onClick={logout}>Cerrar sesión</button>
    </section>
  );
};

export default PerfilSection;
