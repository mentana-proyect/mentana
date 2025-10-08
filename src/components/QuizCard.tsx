"use client";
import React from "react";
import { Category } from "../components/useProgress";

interface Props {
  cat: Category;
  index: number;
  openModal: (cat: Category, index: number) => void;
  openResult: (cat: Category, index: number) => void;
}

const QuizCard: React.FC<Props> = ({ cat, index, openModal, openResult }) => (
  <section key={cat.name} className="grid">
    <article className="card-content">
      <h2>{cat.quiz.title}</h2>
      <span className="pill">{cat.quiz.completed ? "✅ Completado" : "🔓 Disponible"}</span>
      <p className="subtitle">{cat.quiz.description}</p>
      <div className="actions">
        <button
          className="action open"
          disabled={cat.quiz.completed}
          onClick={() => openModal(cat, index)}
        >
          <b>Responder</b>
        </button>
        <button
          className="action view"
          disabled={!cat.quiz.completed}
          onClick={() => openResult(cat, index)}
        >
          <b>Resultado</b>
        </button>
      </div>
    </article>
  </section>
);

export default QuizCard;
