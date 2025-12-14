// QuizModals.tsx
import React, { Suspense } from "react";
import Modal from "../../../components/modal";
import ResultView from "../../../components/ResultView";
import Recommendation from "../../../components/Recommendation";
import { Category } from "../../../components/useProgress";

interface ResultsRecord {
  [quizId: string]: {
    score: number;
    interpretation: string;
  };
}

interface QuizComponentProps {
  onResult: (score: number, interpretation: string) => void;
}

type QuizComponent = React.ComponentType<QuizComponentProps>;

export type HandleQuizCompletion = (
  index: number,
  activeQuiz: Category,
  score: number,
  interpretation: string
) => void;

interface Props {
  activeQuiz: Category | null;
  activeIndex: number | null;
  results: ResultsRecord;
  quizModalOpen: boolean;
  resultModalOpen: boolean;
  recommendModalOpen: boolean;
  setQuizModalOpen: (open: boolean) => void;
  setResultModalOpen: (open: boolean) => void;
  setRecommendModalOpen: (open: boolean) => void;
  QuizComponentToRender: QuizComponent | null;
  handleQuizCompletion: HandleQuizCompletion;
}

const QuizModals = ({
  activeQuiz,
  activeIndex,
  results,
  quizModalOpen,
  resultModalOpen,
  recommendModalOpen,
  setQuizModalOpen,
  setResultModalOpen,
  setRecommendModalOpen,
  QuizComponentToRender,
  handleQuizCompletion,
}: Props) => {

  // ---------------------------------------------------
  // Render del quiz
  // ---------------------------------------------------
  const renderQuizContent = () => {
    if (!QuizComponentToRender || !activeQuiz || activeIndex === null) return null;

    return (
      <Suspense fallback={<div style={{ padding: 20 }}>Cargando cuestionario…</div>}>
        <QuizComponentToRender
          onResult={(score, interpretation) => {
            handleQuizCompletion(activeIndex, activeQuiz, score, interpretation);

            // Cerrar el modal del quiz inmediatamente
            setQuizModalOpen(false);
          }}
        />
      </Suspense>
    );
  };

  // ---------------------------------------------------
  // Render del resultado
  // ---------------------------------------------------
  const renderResultContent = () => {
    if (!activeQuiz) return null;

    const result = results[activeQuiz.quiz.id];
    if (!result) return null;

    return (
      <ResultView
        score={result.score}
        interpretation={result.interpretation}
      />
    );
  };

  // ---------------------------------------------------
  // Render de las recomendaciones
  // ---------------------------------------------------
  const renderRecommendationContent = () => {
    if (!activeQuiz) return null;

    const score = results[activeQuiz.quiz.id]?.score ?? 0;

    return <Recommendation quizId={activeQuiz.quiz.id} score={score} />;
  };

  return (
    <>
      {/* QUIZ MODAL */}
      <Modal isOpen={quizModalOpen} onClose={() => setQuizModalOpen(false)}>
        {renderQuizContent()}
      </Modal>

      {/* RESULT MODAL */}
      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)}>
        {renderResultContent()}
      </Modal>

      {/* RECOMMENDATION MODAL */}
      <Modal isOpen={recommendModalOpen} onClose={() => setRecommendModalOpen(false)}>
        {renderRecommendationContent()}
      </Modal>
    </>
  );
};

export default QuizModals;
