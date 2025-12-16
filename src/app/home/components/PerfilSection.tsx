"use client";

import React from "react";
import QuizCard from "../../../components/QuizCard";
import Footer from "../../../components/Footer";
import { Category } from "../../../components/useProgress";

interface QuizResult {
  score: number;
  interpretation: string;
}

type ResultsRecord = Record<string, QuizResult>;

interface Props {
  categories: Category[];
  results: ResultsRecord;
  setResults: React.Dispatch<React.SetStateAction<ResultsRecord>>;
  refreshTrigger: number;

  logout: () => void;

  openQuizModal: (quiz: Category, index: number) => void;
  openResultModal: (quizId: string) => void;
  openRecommendModal: (quizId: string) => void;
}

const PerfilSection: React.FC<Props> = ({
  categories,
  results,
  setResults,
  refreshTrigger,
  logout,
  openQuizModal,
  openResultModal,
  openRecommendModal,
}) => {
  return (
    <main className="perfil-container">
      {categories.map((cat, index) => (
        <QuizCard
          key={cat.quiz.id}
          cat={cat}
          index={index}
          refreshTrigger={refreshTrigger}
          openModal={() => openQuizModal(cat, index)}
          openResult={(q, i, result) => {
            setResults((prev) => ({
              ...prev,
              [q.quiz.id]: result,
            }));
            openResultModal(q.quiz.id);
          }}
          openRecomendacion={(q) =>
            openRecommendModal(q.quiz.id)
          }
        />
      ))}

      <Footer />
    </main>
  );
};

export default PerfilSection;
