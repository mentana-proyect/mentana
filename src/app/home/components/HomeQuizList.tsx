import React from "react";
import QuizCard from "../../../components/QuizCard";
import { Category } from "../../../components/useProgress";

interface Props {
  categories: Category[];
  daysRemaining: Record<string, number>;
  isQuizUnlocked: (quiz: Category["quiz"]) => boolean;
  setActiveQuiz: (q: Category | null) => void;
  setActiveIndex: (i: number | null) => void;
  setIsModalOpen: (v: boolean) => void;
  setModalMode: (m: "quiz" | "result") => void;
}

const HomeQuizList: React.FC<Props> = ({
  categories,
  daysRemaining,
  isQuizUnlocked,
  setActiveQuiz,
  setActiveIndex,
  setIsModalOpen,
  setModalMode,
}) => (
  <>
    {categories.map((cat, index) => (
      <div key={cat.name} style={{ position: "relative" }}>
        <QuizCard
          cat={cat}
          index={index}
          openModal={(q, i) => {
            if (!isQuizUnlocked(q.quiz)) {
              alert(`⏰ Este quiz se desbloquea en ${daysRemaining[q.quiz.id] || 0} días`);
              return;
            }
            setActiveQuiz(q);
            setActiveIndex(i);
            setModalMode("quiz");
            setIsModalOpen(true);
          }}
          openResult={(q, i) => {
            setActiveQuiz(q);
            setActiveIndex(i);
            setModalMode("result");
            setIsModalOpen(true);
          }}
        />

        {cat.quiz.completed && !isQuizUnlocked(cat.quiz) && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 16,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>⏰</span>
            <span>{daysRemaining[cat.quiz.id]} días</span>
          </div>
        )}
      </div>
    ))}
  </>
);

export default HomeQuizList;
