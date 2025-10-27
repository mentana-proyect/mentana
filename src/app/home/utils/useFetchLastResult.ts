"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

/**
 * Hook para obtener el último resultado completado de un quiz.
 * 
 * @param quizType - tipo del quiz: "ansiedad" | "depresion" | "estres" | "soledad"
 * @param userId - identificador del usuario
 * @param trigger - número que fuerza la recarga manual
 */
export const useFetchLastResult = (
  quizType: "ansiedad" | "depresion" | "estres" | "soledad",
  userId: string | null,
  trigger: number
) => {
  const [lastResult, setLastResult] = useState<{
    completed_at: string;
    score: number;
    interpretation: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLastResult(null);
      setErrorMsg(null);
      return;
    }

    const fetchLastResult = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // Nombre de la tabla dinámico según el tipo de quiz
        const tableName = `results_${quizType}`;

        const { data, error } = await supabase
          .from(tableName)
          .select("score, interpretation, completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase returned an error:", error);
          setErrorMsg(error.message || "Error al consultar la base de datos");
          setLastResult(null);
        } else if (!data) {
          console.warn("No se encontraron resultados para:", quizType, userId);
          setLastResult(null);
        } else {
          setLastResult({
            score: data.score,
            interpretation: data.interpretation,
            completed_at: data.completed_at,
          });
        }
      } catch (err) {
        console.error("Error inesperado al consultar Supabase:", err);
        setErrorMsg("Error inesperado al obtener resultados");
        setLastResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLastResult();
  }, [quizType, userId, trigger]);

  return { lastResult, loading, error: errorMsg };
};
