"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export const useFetchLastResult = (
  quizId: string | null,
  trigger: number
) => {
  const [lastResult, setLastResult] = useState<{ completed_at: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setLastResult(null);
      setErrorMsg(null);
      return;
    }

    const fetchLastResult = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data, error } = await supabase
          .from("results_ansiedad") // tu tabla
          .select("completed_at")
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Supabase returned an error:", error);
          console.log("Raw data:", data);
          setErrorMsg(error?.message || "Error desconocido al consultar Supabase");
          setLastResult(null);
        } else if (!data) {
          console.warn("No se encontraron resultados para quizId:", quizId);
          setLastResult(null);
        } else {
          setLastResult(data);
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
  }, [quizId, trigger]);

  return { lastResult, loading, error: errorMsg };
};
