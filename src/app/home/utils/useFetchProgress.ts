"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Category } from "../../../components/useProgress";

export type QuizResult = { score: number; interpretation: string };

export const useFetchProgress = (initialData: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [results, setResults] = useState<Record<string, QuizResult>>({});

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("quiz_progress")
        .select("quiz_id, completed, unlocked, score, interpretation")
        .eq("user_id", user.id);

      if (error) return console.error(error.message);

      const updatedCategories = initialData.map((cat) => {
        const progress = data?.find((p) => p.quiz_id === cat.quiz.id);
        return {
          ...cat,
          quiz: {
            ...cat.quiz,
            completed: progress?.completed ?? cat.quiz.completed,
            unlocked: true,
          },
        };
      });

      const savedResults: Record<string, QuizResult> = {};
      data?.forEach((p) => {
        if (p.score !== null && p.interpretation)
          savedResults[p.quiz_id] = { score: p.score, interpretation: p.interpretation };
      });

      setCategories(updatedCategories);
      setResults(savedResults);
    };

    fetchProgress();
  }, []);

  return { categories, setCategories, results, setResults };
};
