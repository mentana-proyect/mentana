import Modal from "../../../components/modal";
import ResultView from "../../../components/ResultView";
import Recommendation from "../../../components/Recommendation";
import React from "react";
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

type SetStateBool = React.Dispatch<React.SetStateAction<boolean>>;

type HandleQuizCompletion = (
  index: number,
  activeQuiz: Category,
  score: number,
  interpretation: string
) => void;

interface Props {
  activeQuiz: Category | null;
  results: ResultsRecord;
  quizModalOpen: boolean;
  resultModalOpen: boolean;
  recommendModalOpen: boolean;
  setQuizModalOpen: SetStateBool;
  setResultModalOpen: SetStateBool;
  setRecommendModalOpen: SetStateBool;
  QuizComponentToRender: QuizComponent | null;
  handleQuizCompletion: HandleQuizCompletion;
  activeIndex: number | null;
}

const QuizModals = ({
  activeQuiz,
  results,
  quizModalOpen,
  resultModalOpen,
  recommendModalOpen,
  setQuizModalOpen,
  setResultModalOpen,
  setRecommendModalOpen,
  QuizComponentToRender,
  handleQuizCompletion,
  activeIndex,
}: Props) => {
  return (
    <>
      <Modal isOpen={quizModalOpen} onClose={() => setQuizModalOpen(false)}>
        {QuizComponentToRender && activeQuiz && (
          <QuizComponentToRender
            onResult={(score, interpretation) =>
              handleQuizCompletion(
                activeIndex!,
                activeQuiz,
                score,
                interpretation
              )
            }
          />
        )}
      </Modal>

      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)}>
        {activeQuiz && results[activeQuiz.quiz.id] && (
          <ResultView
            score={results[activeQuiz.quiz.id].score}
            interpretation={results[activeQuiz.quiz.id].interpretation}
          />
        )}
      </Modal>

      <Modal
        isOpen={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
      >
        {activeQuiz && (
          <Recommendation
            quizId={activeQuiz.quiz.id}
            score={results[activeQuiz.quiz.id]?.score ?? 0}
          />
        )}
      </Modal>
    </>
  );
};

export default QuizModals;
