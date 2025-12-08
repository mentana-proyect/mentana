import DailyNotes from "../../../components/DailyNotes";
import { NoteItem } from "../hooks/useNotes";

interface Props {
  userId: string;
}

const NotesSection = ({ userId }: Props) => {
  return <DailyNotes userId={userId} />;
};

export default NotesSection;
