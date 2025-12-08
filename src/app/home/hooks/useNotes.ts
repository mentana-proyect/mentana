import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";

export interface NoteItem {
  id: string;
  text: string;
  date: string;
}

// Tipo estricto del row que devuelve Supabase
interface DailyNoteRow {
  id: string;
  note_text: string;
  created_at: string;
  user_id?: string;
}

export const useNotes = (userId: string) => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("daily_notes")
      .select("id, note_text, created_at, user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetchNotes:", error);
      return;
    }

    const formatted = (data ?? []).map((n: DailyNoteRow) => ({
      id: n.id,
      text: n.note_text,
      date: new Date(n.created_at).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }));

    setNotes(formatted);
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("public:daily_notes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_notes" },
        (payload) => {
          const newRow = payload.new as { user_id?: string };
          const oldRow = payload.old as { user_id?: string };

          if (newRow?.user_id === userId || oldRow?.user_id === userId) {
            fetchNotes();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotes]);

  const saveNote = async () => {
    if (!note.trim() || !userId) return;

    const { data, error } = await supabase
      .from("daily_notes")
      .insert({ user_id: userId, note_text: note.trim() })
      .select()
      .single();

    if (error) return console.error("Error guardando nota:", error);

    const newNote: NoteItem = {
      id: data.id,
      text: data.note_text,
      date: new Date(data.created_at).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    setNotes((prev) => [newNote, ...prev]);
    setNote("");
  };

  const deleteNote = async (index: number, noteId: string) => {
    if (!confirm("¿Quieres eliminar esta nota?")) return;

    setDeletingIndexes((prev) => [...prev, index]);

    const { error } = await supabase
      .from("daily_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error borrando:", error);
      setDeletingIndexes((prev) => prev.filter((i) => i !== index));
      return;
    }

    setTimeout(() => {
      setNotes((prev) => prev.filter((_, i) => i !== index));
      setDeletingIndexes((prev) => prev.filter((i) => i !== index));
    }, 350);
  };

  return {
    note,
    notes,
    deletingIndexes,
    setNote,
    saveNote,
    deleteNote,
  };
};
