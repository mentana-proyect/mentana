import React from "react";
import Modal from "./modal";
import ResultView from "../../../components/ResultView";

import CuestionarioGAD7 from "../quizzes/quiz_ansiedad";
import CuestionarioPHQ9 from "../quizzes/quiz_depresion";
import CuestionarioPSS10 from "../quizzes/quiz_estres";
import CuestionarioUCLA from "../quizzes/quiz_soledad";

import { Category } from "../../../components/useProgress";

const quizComponents = {
  ansiedad1: CuestionarioGAD7,
  depresion1: CuestionarioPHQ9,
  estres1: CuestionarioPSS10,
  soledad1: CuestionarioUCLA,
};

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  modalMode: "quiz" | "result";
  activeQuiz: Category | null;
  activeIndex: number | null;
  results: Record<string, { score: number; interpretation: string }>;
  handleQuizCompletion: (index: number | null, quiz: Category | null, s: number, i: string) => void;
  showConfetti: boolean;
}

const HomeQuizModal: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  activeQuiz,
  activeIndex,
  results,
  handleQuizCompletion,
  showConfetti,
}) => {
  const QuizComponent =
    activeQuiz && quizComponents[activeQuiz.quiz.id as keyof typeof quizComponents];

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} showConfetti={showConfetti}>
      {modalMode === "quiz" && QuizComponent && (
        <QuizComponent onResult={(s, i) => handleQuizCompletion(activeIndex, activeQuiz, s, i)} />
      )}
      {modalMode === "result" && activeQuiz && results[activeQuiz.quiz.id] && (
        <ResultView
          score={results[activeQuiz.quiz.id].score}
          interpretation={results[activeQuiz.quiz.id].interpretation}
        />
      )}
    </Modal>
  );
};

export default HomeQuizModal;
