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

  openQuizModal: (
    quiz: Category,
    index: number,
    onCompleted: () => void
  ) => void;
  openResultModal: (quizId: string) => void;
  openRecommendModal: (quizId: string) => void;

  setResults: SetResultsFn;
  refreshTrigger: number;
}

const PerfilSection: React.FC<Props> = ({
  categories,
  openQuizModal,
  openResultModal,
  openRecommendModal,
  setResults,
  refreshTrigger,
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
              // Home ya maneja el refreshTrigger
            })
          }
          openResult={(q, i, result) => {
            openResultModal(q.quiz.id);

            setResults((prev) => ({
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
