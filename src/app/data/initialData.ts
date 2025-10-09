import { Category } from "../../components/useProgress";

export const initialData: Category[] = [
  {
    name: "Ansiedad",
    quiz: {
      id: "ansiedad1",
      title: "Ansiedad GAD-7",
      description: "El GAD-7 (Generalized Anxiety Disorder-7) es un cuestionario breve de 7 ítems diseñado para evaluar la presencia y gravedad de la ansiedad generalizada en adultos.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Depresión",
    quiz: {
      id: "depresion1",
      title: "Depresión PHQ-9",
      description: "El PHQ-9 (Patient Health Questionnaire-9) es un cuestionario de 9 ítems diseñado para evaluar la presencia y gravedad de la depresión en adultos.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Estrés",
    quiz: {
      id: "estres1",
      title: "Estrés PSS-10",
      description: "El PSS-10 (Perceived Stress Scale-10) es un cuestionario de 10 ítems diseñado para medir el nivel de estrés percibido en adultos.",
      unlocked: true,
      completed: false,
    },
  },
  {
    name: "Soledad",
    quiz: {
      id: "soledad1",
      title: "Soledad UCLA",
      description: "El UCLA Loneliness Scale es un cuestionario para medir la soledad percibida en adultos. Evalúa cómo se siente una persona respecto a la falta de relaciones sociales satisfactorias.",
      unlocked: true,
      completed: false,
    },
  },
];
