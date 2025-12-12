"use client";
import React from "react";
import "./recommendation.css";
import Footer from "../components/Footer";

export const getRecommendation = (quizType: string, score: number): string => {
  switch (quizType) {
    case "ansiedad":
      if (score <= 4)
        return "Tu nivel de ansiedad es bajo 🤍 Sigue cultivando hábitos que cuidan tu bienestar emocional.";
      if (score <= 9)
        return "Estás presentando ansiedad leve 🌿 Practicar respiración consciente o caminar te ayudará a relajarte.";
      if (score <= 14)
        return "Ansiedad moderada 💛 Es buen momento para reducir estímulos y priorizar actividades calmantes.";
      return "Ansiedad alta ❤️‍🩹 Considera apoyo profesional y reduce fuentes de estrés. No estás solo.";

    case "depresion":
      if (score <= 4)
        return "Tu estado de ánimo se encuentra estable 🌞 Mantén actividades que te generen bienestar.";
      if (score <= 9)
        return "Síntomas leves 🌿 Apunta a pequeñas metas diarias: moverte un poco, salir, conectar con otros.";
      if (score <= 14)
        return "Depresión moderada 💛 Conversar con alguien cercano o un profesional puede ayudarte mucho.";
      if (score <= 19)
        return "Depresión moderadamente grave ❤️‍🩹 Buscar orientación profesional es altamente recomendable.";
      return "Depresión grave 🧡 Prioriza apoyo profesional. Mereces sentirte mejor y no enfrentar esto solo.";

    case "estres":
      if (score <= 13)
        return "Estás manejando bien tu nivel de estrés 🌞 Sigue cuidando tus espacios de descanso.";
      if (score <= 19)
        return "Estrés leve 🌿 Intenta pausas activas, estiramientos y respiración profunda.";
      if (score <= 26)
        return "Estrés moderado 💛 Organiza tus tareas, desconéctate de pantallas y busca apoyo emocional.";
      return "Estrés alto ❤️‍🩹 Prueba técnicas de relajación guiada y considera hablar con un profesional.";

    case "soledad":
      if (score <= 20)
        return "Tu nivel de soledad es bajo 🤍 Continúa fortaleciendo tus redes sociales.";
      if (score <= 40)
        return "Soledad moderada 🌿 Busca espacios de conexión: talleres, actividades comunitarias o grupos.";
      return "Soledad alta ❤️‍🩹 Conectarte con otros o con un profesional puede ayudarte a sentirte acompañado.";

    default:
      return "No hay recomendaciones disponibles para este test.";
  }
};

// Nivel visual según score (color + tono emocional)
const getLevelInfo = (quizType: string, score: number) => {
  if (quizType === "ansiedad") {
    if (score <= 4) return { label: "Bajo", color: "level-low" };
    if (score <= 9) return { label: "Leve", color: "level-mild" };
    if (score <= 14) return { label: "Moderado", color: "level-mid" };
    return { label: "Alto", color: "level-high" };
  }

  if (quizType === "depresion") {
    if (score <= 4) return { label: "Estable", color: "level-low" };
    if (score <= 9) return { label: "Leve", color: "level-mild" };
    if (score <= 14) return { label: "Moderado", color: "level-mid" };
    if (score <= 19) return { label: "Moderado-Alto", color: "level-midHigh" };
    return { label: "Alto", color: "level-high" };
  }

  if (quizType === "estres") {
    if (score <= 13) return { label: "Bajo", color: "level-low" };
    if (score <= 19) return { label: "Leve", color: "level-mild" };
    if (score <= 26) return { label: "Moderado", color: "level-mid" };
    return { label: "Alto", color: "level-high" };
  }

  if (quizType === "soledad") {
    if (score <= 20) return { label: "Bajo", color: "level-low" };
    if (score <= 40) return { label: "Moderado", color: "level-mid" };
    return { label: "Alto", color: "level-high" };
  }

  return { label: "—", color: "" };
};

interface RecommendationProps {
  quizId: string;
  score: number;
}

const Recommendation: React.FC<RecommendationProps> = ({ quizId, score }) => {
  const quizType = quizId.replace(/[0-9]/g, "");
  const recommendation = getRecommendation(quizType, score);
  const { label, color } = getLevelInfo(quizType, score);

  return (
    <div className={`recommendation-card ${color}`}>
      <div className="rec-header">
        <h2 className="recommendation-title">Tu recomendación</h2>
        
      </div>

      <p className="recommendation-text">{recommendation}</p><Footer />
    </div>
  );
};

export default Recommendation;
