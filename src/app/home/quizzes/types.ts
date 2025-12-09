
export interface QuizComponentProps {
  onComplete: (score: number, interpretation: string) => void;
  onResult?: (score: number, interpretation: string) => void;
}

export type Gad7FormProps = QuizComponentProps;
export type Phq9FormProps = QuizComponentProps;
export type Pss10FormProps = QuizComponentProps;
export type UclaFormProps = QuizComponentProps;


export interface QuizInfo {
  id: string;
  completed: boolean;
}

export interface Category {
  name: string;
  quiz: QuizInfo;
}
