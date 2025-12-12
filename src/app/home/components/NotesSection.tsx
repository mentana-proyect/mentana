import DailyNotes from "../../../components/DailyNotes";
import { NoteItem } from "../hooks/useNotes";
import Footer from "../../../components/Footer";

interface Props {
  userId: string;
}

const NotesSection = ({ userId }: Props) => {
  return (
    <>
      <DailyNotes userId={userId} />
      <Footer />
    </>
  );
};

export default NotesSection;
