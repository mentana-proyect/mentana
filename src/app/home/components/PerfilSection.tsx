import React from "react";
import QuizCard from "../../../components/QuizCard";
import { Category } from "../../../components/useProgress";
import Footer from "../../../components/Footer";

interface ResultsRecord {
  [quizId: string]: {
    score: number;
    interpretation: string;
  };
}

type SetResultsFn = (
  updater: ResultsRecord | ((prev: ResultsRecord) => ResultsRecord)
) => void;

interface Props {
  categories: Category[];
  refreshTrigger: number;
  logout: () => void;

  // Recibimos directamente funciones para abrir por quizId
  openQuizModal: (quiz: Category, index: number) => void;
  openResultModal: (quizId: string) => void;
  openRecommendModal: (quizId: string) => void;

  setResults: SetResultsFn;
  results: ResultsRecord;
}

const PerfilSection: React.FC<Props> = ({
  categories,
  refreshTrigger,
  logout,
  openQuizModal,
  openResultModal,
  openRecommendModal,
  setResults,
  results,
}) => {
  return (
    <>
      <main className="perfil-container">
        {categories.map((cat, index) => (
          <QuizCard
            key={cat.name}
            cat={cat}
            index={index}
            refreshTrigger={refreshTrigger}
            
            /* ---- ABRIR QUIZ ---- */
            openModal={() => {
              openQuizModal(cat, index);
            }}

            /* ---- ABRIR RESULTADOS ---- */
            openResult={(q, i, result) => {
              openResultModal(q.quiz.id);

              setResults((prev: ResultsRecord) => ({
                ...prev,
                [q.quiz.id]: result,
              }));
            }}

            /* ---- ABRIR RECOMENDACIÓN ---- */
            openRecomendacion={(q) => {
              openRecommendModal(q.quiz.id);
            }}
          />
        ))}

        <Footer />
      </main>
    </>
  );
};

export default PerfilSection;
