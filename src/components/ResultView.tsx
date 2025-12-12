// "use client";
import React from "react";
import Footer from "../components/Footer";

interface Props {
  score?: number;
  interpretation?: string;
}

const ResultView: React.FC<Props> = ({ score = 0, interpretation = "Sin interpretación" }) => {
  return (
    <div className="result-card"><div className="result-score">
      <h2 className="result-title">Tu resultado</h2>

      
        <span className="score-number">{score}</span>
        <span className="score-label">puntaje total</span>
      </div>

      <div className="result-interpretation">
        <p>{interpretation}</p>
      </div>

     <Footer />
    </div>
  );
};

export default ResultView;
