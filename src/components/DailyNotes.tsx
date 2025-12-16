"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

interface NoteItem {
  id: string;
  text: string;
  date: string;
}

interface Props {
  userId: string;
}

const DailyNotes: React.FC<Props> = ({ userId }) => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [deletingIndexes, setDeletingIndexes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------
     CARGAR NOTAS DESDE SUPABASE
  ------------------------------------------- */
  const loadNotes = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("daily_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formatted: NoteItem[] = data.map((n) => ({
        id: n.id,
        text: n.note_text,
        date: new Date(n.created_at).toLocaleString("es-CL", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      }));

      setNotes(formatted);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /* -------------------------------------------
     GUARDAR NOTA EN SUPABASE
  ------------------------------------------- */
  const handleSaveNote = async () => {
    if (!note.trim()) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("daily_notes")
      .insert({
        user_id: userId,
        note_text: note.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      const newItem: NoteItem = {
        id: data.id,
        text: data.note_text,
        date: new Date(data.created_at).toLocaleString("es-CL", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      setNotes((prev) => [newItem, ...prev]);
      setNote("");
    }

    setLoading(false);
  };

  /* -------------------------------------------
     ELIMINAR NOTA CON ANIMACIÓN
  ------------------------------------------- */
  const deleteNote = async (index: number, id: string) => {
    if (!confirm("¿Quieres eliminar esta nota?")) return;

    setDeletingIndexes((prev) => [...prev, index]);

    setTimeout(async () => {
      await supabase.from("daily_notes").delete().eq("id", id);

      setNotes((prev) => prev.filter((_, i) => i !== index));
      setDeletingIndexes((prev) => prev.filter((i) => i !== index));
    }, 350);
  };

  return (
    <div className="daily-notes-container">
      <h2 style={{ textAlign: "left" }}>Mentana Chile</h2>

      <p style={{ textAlign: "left" }}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>

      <textarea
        className="daily-note-input"
        placeholder="Escribe una nota sobre tu día..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        className="save-note-btn"
        onClick={handleSaveNote}
        disabled={loading}
      >
        <strong>{loading ? "Guardando..." : "Guardar nota"}</strong>
      </button>

      <div className="notes-history">
        {notes.length === 0 ? (
          <p className="empty-notes">Aún no tienes notas guardadas.</p>
        ) : (
          notes.map((n, i) => (
            <div
              key={n.id}
              className={`note-item ${
                deletingIndexes.includes(i) ? "fade-out" : ""
              }`}
            >
              <div className="note-main">
                <div className="note-date">{n.date}</div>
                <div className="note-text">{n.text}</div>
              </div>

              <div
                className="delete-icon"
                onClick={() => deleteNote(i, n.id)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyNotes;
