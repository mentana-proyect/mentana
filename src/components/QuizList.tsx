"use client";
import React, { useState, useEffect } from "react";
import QuizCard from "./QuizCard";
import { Category } from "../components/useProgress";
import { supabase } from "../lib/supabaseClient";

interface QuizListProps {
  categories: Category[];
  openModal: (cat: Category, index: number) => void;
  openResult: (cat: Category, index: number) => void;
  openRecomendacion: (cat: Category, index: number) => void;
}

export default function QuizList({ categories, openModal, openResult, openRecomendacion }: QuizListProps) {
  const [daysLeftMap, setDaysLeftMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchLastAttempts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;

      const updatedDaysLeft: Record<string, number> = {};

      await Promise.all(
        categories.map(async (cat) => {
          const { data, error } = await supabase
            .from("quiz_progress")
            .select("last_completed_at")
            .eq("user_id", userId)
            .eq("quiz_id", cat.quiz.id)
            .order("last_completed_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data?.last_completed_at) {
            const lastDate = new Date(data.last_completed_at);
            const diffMs = new Date().getTime() - lastDate.getTime();
            const remaining = 30 - Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (remaining > 0) updatedDaysLeft[cat.quiz.id] = remaining;
          }
        })
      );

      setDaysLeftMap(updatedDaysLeft);
    };

    fetchLastAttempts();
  }, [categories]);

  return (
    <div className="quiz-list grid gap-4">
      {categories.map((cat, index) => (
        <QuizCard
          key={cat.quiz.id}
          cat={cat}
          index={index}
          openModal={openModal}
          openResult={openResult}
          openRecomendacion={openRecomendacion}
        />
      ))}
    </div>
  );
}
