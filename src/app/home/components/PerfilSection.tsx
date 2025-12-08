import React from "react";
import QuizCard from "../../../components/QuizCard";
import DockFooter from "../../../components/DockFooter";
import { Category } from "../../../components/useProgress";

interface ResultsRecord {
  [quizId: string]: {
    score: number;
    interpretation: string;
  };
}

// Firmas exactas que parece que tu padre está pasando
type SetActiveQuizFn = (q: Category | null) => void;
type SetActiveIndexFn = (i: number | null) => void;
type SetBoolFn = (v: boolean) => void;
type SetResultsFn = (updater: ResultsRecord | ((prev: ResultsRecord) => ResultsRecord)) => void;

interface Props {
  categories: Category[];
  refreshTrigger: number;
  logout: () => void;

  // aquí usamos las firmas simples que el padre provee
  setActiveQuiz: SetActiveQuizFn;
  setActiveIndex: SetActiveIndexFn;

  setResultModalOpen: SetBoolFn;
  setRecommendModalOpen: SetBoolFn;

  setResults: SetResultsFn;
  results: ResultsRecord;
}

const PerfilSection = ({
  categories,
  refreshTrigger,
  logout,
  setActiveQuiz,
  setActiveIndex,
  setResultModalOpen,
  setRecommendModalOpen,
  setResults,
  results,
}: Props) => {
  return (
    <main className="perfil-container">
      {categories.map((cat, index) => (
        <QuizCard
          key={cat.name}
          cat={cat}
          index={index}
          refreshTrigger={refreshTrigger}
          openModal={() => {
            if (!cat.quiz.completed) {
              setActiveQuiz(cat);
              setActiveIndex(index);
            }
          }}
          openResult={(q, i, result) => {
            setActiveQuiz(q);
            setActiveIndex(i);
            setResultModalOpen(true);

            // setResults acepta tanto un objeto como una función actualizadora
            setResults((prev: ResultsRecord) => ({
              ...prev,
              [q.quiz.id]: result,
            }));
          }}
          openRecomendacion={(q, i) => {
            setActiveQuiz(q);
            setActiveIndex(i);
            setRecommendModalOpen(true);
          }}
        />
      ))}

      <DockFooter logout={logout} />
    </main>
  );
};

export default PerfilSection;
