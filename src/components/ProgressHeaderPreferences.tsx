"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface QuizProgress {
  quiz_id: string;
  completed: boolean;
}

interface Props {
  refreshTrigger?: number;
}

const ProgressHeader: React.FC<Props> = ({ refreshTrigger = 0 }) => {
  const [completed, setCompleted] = useState(0);
  const totalQuizzes = 4;

  useEffect(() => {
    const fetchProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("quiz_id, completed")
        .eq("user_id", userId);

      if (error) {
        console.error("Error al obtener progreso:", error.message || error);
        return;
      }

      if (data) {
        const completedQuizzes = data.filter(
          (q: QuizProgress) => q.completed
        ).length;

        setCompleted(
          completedQuizzes > totalQuizzes
            ? totalQuizzes
            : completedQuizzes
        );
      }
    };

    fetchProgress();
  }, [refreshTrigger]);

  return (
    <header>
      <article className="card">
        <div style={{ textAlign: "center" }}>
          {/* SVG intacto */}
          <svg
            id="Capa_4"
            data-name="Capa 4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 1200"
            width={150}
            height={150}
          >
            {/* paths sin cambios */}
          </svg>

          <h3>Preferencias Psicológicas</h3>
        </div>

        <p style={{ textAlign: "center" }}>
          <strong>👉 Es tu espacio seguro, pensado para ti 🌱</strong>
        </p>
      </article>
    </header>
  );
};

export default ProgressHeader;
