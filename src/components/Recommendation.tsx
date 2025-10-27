"use client";
import React from "react";

export const getRecommendation = (quizType: string, score: number): string => {
  switch (quizType) {
    case "ansiedad":
      if (score <= 4)
        return "Ansiedad mínima. Mantén tus hábitos saludables: dormir bien, hacer pausas y cuidar tu respiración.";
      if (score <= 9)
        return "Ansiedad leve. Practica ejercicios de respiración o mindfulness. Sal a caminar, mantén contacto con personas de confianza.";
      if (score <= 14)
        return "Ansiedad moderada. Reduce la cafeína y las pantallas antes de dormir. Dedica tiempo a actividades relajantes como leer o salir al aire libre.";
      return "Ansiedad alta. Busca apoyo psicológico o consejería. Realiza actividades calmantes diarias y evita la sobreexposición a noticias o redes sociales.";

    case "depresion":
      if (score <= 4)
        return "Estado de ánimo estable. Continúa con rutinas que te ayuden a sentirte bien, como ejercicio ligero y contacto social.";
      if (score <= 9)
        return "Síntomas leves. Trata de mantener una rutina con pequeñas metas diarias: caminar, escuchar música o cocinar algo que disfrutes.";
      if (score <= 14)
        return "Depresión moderada. Hablar con alguien de confianza puede ayudar. Intenta actividades que te conecten con otros y evita aislarte.";
      if (score <= 19)
        return "Depresión moderadamente grave. Es recomendable buscar orientación profesional. Mantén hábitos de sueño regulares y sal a tomar aire fresco cada día.";
      return "Depresión grave. Prioriza el apoyo profesional. No enfrentes esto solo; hablar con un terapeuta o médico puede marcar la diferencia.";

    case "estres":
      if (score <= 13)
        return "Estrés bajo. Mantén tus hábitos saludables y tiempo de descanso. Hacer pausas durante el día te ayudará a conservar el equilibrio.";
      if (score <= 19)
        return "Estrés leve. Realiza actividades físicas suaves, estiramientos o caminatas cortas. Aprende a decir 'no' cuando lo necesites.";
      if (score <= 26)
        return "Estrés moderado. Organiza tus tareas por prioridad, busca apoyo emocional y reserva tiempo para desconectarte del trabajo o estudios.";
      return "Estrés alto. Intenta técnicas de relajación (respiración 4-7-8, meditación guiada). Si el estrés es persistente, consulta a un profesional.";

    case "soledad":
      if (score <= 20)
        return "Bajo nivel de soledad. Mantén tus vínculos y participa en actividades sociales que disfrutes.";
      if (score <= 40)
        return "Soledad moderada. Busca momentos de conexión: conversar con amigos, asistir a un taller o grupo, o participar en actividades comunitarias.";
      return "Soledad alta. Considera unirte a espacios grupales o de voluntariado. Si la sensación de aislamiento persiste, hablar con un profesional puede ser de gran ayuda.";

    default:
      return "No hay recomendaciones disponibles para este test.";
  }
};

// Componente que renderiza la recomendación
interface RecommendationProps {
  quizId: string; // puede ser 'ansiedad1', 'depresion1', etc.
  score: number;
}

const Recommendation: React.FC<RecommendationProps> = ({ quizId, score }) => {
  // Extrae el tipo real del quiz (elimina números)
  const quizType = quizId.replace(/[0-9]/g, "");
  const recommendation = getRecommendation(quizType, score);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <p style={{ fontWeight: "bold", margin: 0 }}>{recommendation}</p>
    </div>
  );
};

export default Recommendation;
