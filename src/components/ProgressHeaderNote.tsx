"use client";
import React, { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface QuizProgress {
  quiz_id: string;
  completed: boolean;
}

interface Props {
  refreshTrigger?: number;
}

const ProgressHeader: React.FC<Props> = ({ refreshTrigger = 0 }) => {
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

        // ⚠️ Ya no se guarda en ningún estado porque no se usa.
        // Puedes agregar lógica aquí si luego quieres usarlo.
        const validatedCount =
          completedQuizzes > totalQuizzes ? totalQuizzes : completedQuizzes;

        console.log("Progreso completado:", validatedCount);
      }
    };

    fetchProgress();
  }, [refreshTrigger]);

  return (
    <header>
      <article>
        <div style={{ textAlign: "center" }}>
          <svg
            id="Capa_4"
            data-name="Capa 4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 1200"
            width={150}
            height={150}
          >
            {/* SVG igual… */}
            <path
              fill="#79e7d3"
              d="M695.33,448.57c-2.76-6.23-6.52-11.02-11.31-14.35..."
            />
            <path
              fill="#ff8cd3"
              d="M1098.2,506.41c-.27-2.52-.59-4.78-.99-6.9..."
            />
            <circle fill="#ff8cd3" cx="454.93" cy="625.36" r="37.24" />
            <circle fill="#ff8cd3" cx="596.8" cy="625.41" r="37.24" />
          </svg>

          <h3>Mi diario personal</h3>
        </div>

        <p style={{ textAlign: "center" }}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy
          text ever since the 1500s.
        </p>
      </article>
    </header>
  );
};

export default ProgressHeader;
