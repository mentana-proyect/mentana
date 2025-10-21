"use client";
import React from "react";
import { Category } from "../components/useProgress";

interface Props {
  cat: Category;
  index: number;
  openModal: (cat: Category, index: number) => void;
  openResult: (cat: Category, index: number) => void;
  openRecomendacion: (cat: Category, index: number) => void;
}

const QuizCard: React.FC<Props> = ({ cat, index, openModal, openResult, openRecomendacion }) => (
  <section key={cat.name} className="grid">
    <article className="card-content">
      <h2>{cat.quiz.title}</h2>
      <span className="pill">{cat.quiz.completed ? "✅ Completado" : "🔓 Disponible"}</span>
      <p className="subtitle">{cat.quiz.description}</p>

      <div className="actions">
        {!cat.quiz.completed ? (
          <>
            {/* Responder disponible */}
            <button className="action open" onClick={() => openModal(cat, index)}>
              <b>Responder</b>
            </button>
            {/* Resultado bloqueado */}
            <button className="action view" disabled>
              <b>Resultado</b>
            </button>
          </>
        ) : (
          <>
            {/* Resultado habilitado */}
            <button className="action view" onClick={() => openResult(cat, index)}>
              <b>Resultado</b>
            </button>
            {/* Recomendación visible */}
            <button className="action recomendacion" onClick={() => openRecomendacion(cat, index)}>
              <b>Recomendación</b>
            </button>
          </>
        )}
      </div>
    </article>
  </section>
);

export default QuizCard;
