import { Category } from "../../../components/useProgress";

export interface ModalState {
  isModalOpen: boolean;
  modalMode: "quiz" | "result";
  activeQuiz: Category | null;
  activeIndex: number | null;
  showConfetti: boolean;
  setIsModalOpen: (v: boolean) => void;
}