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
  logout: () => void;

  openQuizModal: (
    quiz: Category,
    index: number,
    onCompleted: () => void
  ) => void;
  openResultModal: (quizId: string) => void;
  openRecommendModal: (quizId: string) => void;

  setResults: SetResultsFn;
  results: ResultsRecord;

  refreshTrigger: number; // ✅ viene desde Home
}

const PerfilSection: React.FC<Props> = ({
  categories,
  logout,
  openQuizModal,
  openResultModal,
  openRecommendModal,
  setResults,
  results,
  refreshTrigger, // ✅ usar el del padre
}) => {
  return (
    <main className="perfil-container">
      {categories.map((cat, index) => (
        <QuizCard
          key={cat.quiz.id}
          cat={cat}
          index={index}
          refreshTrigger={refreshTrigger}
          openModal={() =>
            openQuizModal(cat, index, () => {
              // 👇 Home ya incrementa refreshTrigger
            })
          }
          openResult={(q, i, result) => {
            openResultModal(q.quiz.id);

            setResults((prev: ResultsRecord) => ({
              ...prev,
              [q.quiz.id]: result,
            }));
          }}
          openRecomendacion={(q) => openRecommendModal(q.quiz.id)}
        />
      ))}

      <Footer />
    </main>
  );
};

export default PerfilSection;
