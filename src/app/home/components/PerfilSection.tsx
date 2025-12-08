import QuizCard from "../../../components/QuizCard";
import DockFooter from "../../../components/DockFooter";
import { Category } from "../../../components/useProgress";

interface Props {
  categories: Category[];
  refreshTrigger: number;
  logout: () => void;
  setActiveQuiz: any;
  setActiveIndex: any;
  setResultModalOpen: any;
  setRecommendModalOpen: any;
  setResults: any;
  results: any;
}

const PerfilSection = ({
  categories,
  refreshTrigger,
  logout,
  setActiveQuiz,
  setActiveIndex,
  setResultModalOpen,
  setRecommendModalOpen,
  setResults,
  results,
}: Props) => {
  return (
    <main className="perfil-container">
      {categories.map((cat, index) => (
        <QuizCard
          key={cat.name}
          cat={cat}
          index={index}
          refreshTrigger={refreshTrigger}
          openModal={() => {
            if (!cat.quiz.completed) {
              setActiveQuiz(cat);
              setActiveIndex(index);
            }
          }}
          openResult={(q, i, result) => {
            setActiveQuiz(q);
            setActiveIndex(i);
            setResultModalOpen(true);
            setResults((prev: any) => ({ ...prev, [q.quiz.id]: result }));
          }}
          openRecomendacion={(q, i) => {
            setActiveQuiz(q);
            setActiveIndex(i);
            setRecommendModalOpen(true);
          }}
        />
      ))}

      <DockFooter logout={logout} />
    </main>
  );
};

export default PerfilSection;
