// =========================
// TIPOS GENÉRICOS UNIFICADOS
// =========================

// Lo que cada formulario debe recibir
export interface QuizComponentProps {
  onComplete: (score: number, interpretation: string) => void;
  onResult?: (score: number, interpretation: string) => void;
}

// =========================
// TIPOS ESPECÍFICOS POR FORMULARIO
// (todos extienden al tipo genérico)
// =========================

export interface Gad7FormProps extends QuizComponentProps {}
export interface Phq9FormProps extends QuizComponentProps {}
export interface Pss10FormProps extends QuizComponentProps {}
export interface UclaFormProps extends QuizComponentProps {}

// =========================
// TIPO DE CATEGORY
// =========================
export interface QuizInfo {
  id: string;
  completed: boolean;
}

export interface Category {
  name: string;
  quiz: QuizInfo;
}
