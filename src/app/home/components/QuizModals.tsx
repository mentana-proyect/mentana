import Modal from "../../../components/modal";
import ResultView from "../../../components/ResultView";
import Recommendation from "../../../components/Recommendation";

interface Props {
  activeQuiz: any;
  results: any;
  quizModalOpen: boolean;
  resultModalOpen: boolean;
  recommendModalOpen: boolean;
  setQuizModalOpen: any;
  setResultModalOpen: any;
  setRecommendModalOpen: any;
  QuizComponentToRender: any;
  handleQuizCompletion: any;
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
            onResult={(score: number, interpretation: string) =>
              handleQuizCompletion(activeIndex!, activeQuiz, score, interpretation)
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
