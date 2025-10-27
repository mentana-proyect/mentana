"use client";
import React, { useEffect } from "react";
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
