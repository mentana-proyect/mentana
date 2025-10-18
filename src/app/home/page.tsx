"use client";
import React from "react";
import "../../styles/home.css";

import { useHomeLogic } from "./hooks/useHomeLogic";

import HomeHeader from "./components/HomeHeader";
import HomeQuizList from "./components/HomeQuizList";
import HomeQuizModal from "./components/HomeQuizModal";
import HomeFooter from "./components/HomeFooter";
import HomeLoadingState from "./components/HomeLoadingState";
import HomeConfetti from "./components/HomeConfetti";

const Home: React.FC = () => {
  const {
    authLoading,
    loading,
    error,
    categories,
    results,
    logout,
    showConfetti,
    modalState,
    modalHandlers,
    quizHandlers,
    lockState,
  } = useHomeLogic();

  if (authLoading || loading) return <HomeLoadingState />;
  if (error) return <p className="loading-container">{error}</p>;

  const completed = categories.filter(c => c.quiz.completed).length;
  const total = categories.length;

  return (
    <div>
      <HomeHeader completed={completed} total={total} />

      <main>
        <HomeQuizList
          categories={categories}
          daysRemaining={lockState.daysRemaining}
          isQuizUnlocked={lockState.isQuizUnlocked}
          {...modalHandlers}
        />
        <HomeFooter logout={logout} />
      </main>

      <HomeQuizModal {...modalState} {...quizHandlers} results={results} />
      <HomeConfetti show={showConfetti} />
    </div>
  );
};

export default Home;